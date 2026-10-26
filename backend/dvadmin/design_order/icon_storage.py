import hashlib
import io
import time
import uuid
from dataclasses import dataclass
from datetime import datetime
from pathlib import PurePosixPath
from urllib.parse import urlencode

import boto3
from botocore.exceptions import ClientError
from django.conf import settings
from django.core.signing import BadSignature, Signer
from PIL import Image, UnidentifiedImageError

from dvadmin.system.models import FileList

ICON_ENGINE = "minio_icon"
# 图片一律通过后端同源路径下发：MinIO 只在内网可达，把预签名直链交给公网浏览器
# 会同时撞上私网地址不可达和 HTTPS 混合内容拦截两道墙。
ICON_IMAGE_URL_PATH = "/api/design_order/icons/image"
ICON_IMAGE_SIGN_SALT = "design_order.icon.image"
ICON_IMAGE_TOKEN_WINDOW = 1800
ICON_IMAGE_CHUNK_SIZE = 64 * 1024
IMAGE_FORMATS = {
    "JPEG": ("jpg", "image/jpeg"),
    "PNG": ("png", "image/png"),
    "WEBP": ("webp", "image/webp"),
    "GIF": ("gif", "image/gif"),
}


@dataclass(frozen=True)
class IconStorageConfig:
    endpoint_url: str
    access_key: str
    secret_key: str
    bucket_name: str
    region_name: str


def get_storage_config() -> IconStorageConfig:
    config = IconStorageConfig(
        endpoint_url=settings.ICON_MINIO_ENDPOINT_URL,
        access_key=settings.ICON_MINIO_ACCESS_KEY,
        secret_key=settings.ICON_MINIO_SECRET_KEY,
        bucket_name=settings.ICON_MINIO_BUCKET_NAME,
        region_name=settings.ICON_MINIO_REGION_NAME,
    )
    required = [config.endpoint_url, config.access_key, config.secret_key, config.bucket_name]
    if not all(required):
        raise RuntimeError("Icon MinIO 配置不完整，请设置 endpoint、账号、密钥和 bucket")
    return config


def create_s3_client(config: IconStorageConfig):
    return boto3.client(
        "s3",
        endpoint_url=config.endpoint_url,
        aws_access_key_id=config.access_key,
        aws_secret_access_key=config.secret_key,
        region_name=config.region_name,
    )


def ensure_bucket() -> str:
    config = get_storage_config()
    client = create_s3_client(config)
    try:
        client.head_bucket(Bucket=config.bucket_name)
    except ClientError as exc:
        error_code = exc.response.get("Error", {}).get("Code")
        if error_code not in {"404", "NoSuchBucket", "NotFound"}:
            raise
        client.create_bucket(Bucket=config.bucket_name)
    return config.bucket_name


def delete_icon_object(file: FileList) -> None:
    config = get_storage_config()
    create_s3_client(config).delete_object(Bucket=config.bucket_name, Key=file.file_url)


def inspect_image(content: bytes) -> tuple[str, str]:
    try:
        with Image.open(io.BytesIO(content)) as image:
            image.verify()
            image_format = image.format or ""
    except (UnidentifiedImageError, OSError) as exc:
        raise ValueError("上传文件不是有效图片") from exc
    if image_format not in IMAGE_FORMATS:
        raise ValueError("仅支持 JPG、PNG、WEBP、GIF 图片")
    return IMAGE_FORMATS[image_format]


def build_object_key(extension: str, icon_id: int | None = None) -> str:
    """
    构建对象存储路径。
    如果提供 icon_id，路径包含 Icon ID 便于按 Icon 清理图片。
    格式：icons/{icon_id}/{timestamp}_{random}.{ext}
    如果不提供 icon_id（上传阶段），使用年月分组：icons/{year}/{month}/{random}.{ext}
    """
    now = datetime.now()
    if icon_id:
        timestamp = int(now.timestamp())
        random_str = uuid.uuid4().hex[:8]
        return str(PurePosixPath("icons", str(icon_id), f"{timestamp}_{random_str}.{extension}"))
    return str(PurePosixPath("icons", str(now.year), f"{now.month:02d}", f"{uuid.uuid4().hex}.{extension}"))


def upload_icon_image(uploaded_file, user=None) -> FileList:
    content = uploaded_file.read()
    extension, mime_type = inspect_image(content)
    config = get_storage_config()
    object_key = build_object_key(extension)
    create_s3_client(config).put_object(
        Bucket=config.bucket_name,
        Key=object_key,
        Body=content,
        ContentType=mime_type,
    )
    return FileList.objects.create(
        name=uploaded_file.name,
        file_url=object_key,
        engine=ICON_ENGINE,
        mime_type=mime_type,
        size=str(len(content)),
        md5sum=hashlib.md5(content).hexdigest(),
        file_type=0,
        **_build_audit_fields(user),
    )


def _build_audit_fields(user) -> dict:
    if not user or not getattr(user, "is_authenticated", False):
        return {}
    return {
        "creator": user,
        "modifier": str(user.id),
        "dept_belong_id": getattr(getattr(user, "dept", None), "id", None),
    }


def _public_base_url() -> str:
    return str(getattr(settings, "ICON_MINIO_PUBLIC_BASE_URL", "") or "").rstrip("/")


def _token_expiry() -> int:
    """把票据有效期对齐到固定时间窗。

    同一窗口内签发的票据完全一致，URL 才是稳定的，浏览器缓存才能命中；
    取下一个窗口边界保证任何时刻签发的票据都还有 30~60 分钟有效期。
    """
    now = int(time.time())
    return (now // ICON_IMAGE_TOKEN_WINDOW + 2) * ICON_IMAGE_TOKEN_WINDOW


def build_icon_image_token(file_id: int) -> str:
    """签发图片访问票据：文件 ID 加过期时间，用 SECRET_KEY 做 HMAC 签名。"""
    return Signer(salt=ICON_IMAGE_SIGN_SALT).sign(f"{int(file_id)}:{_token_expiry()}")


def resolve_icon_image_token(token: str) -> int:
    """校验票据并取回文件 ID，签名不符或已过期都抛 PermissionError。"""
    try:
        file_id_raw, expires_raw = Signer(salt=ICON_IMAGE_SIGN_SALT).unsign(
            token or ""
        ).rsplit(":", 1)
        file_id, expires_at = int(file_id_raw), int(expires_raw)
    except (BadSignature, ValueError) as exc:
        raise PermissionError("图片链接无效或已过期") from exc
    if expires_at < int(time.time()):
        raise PermissionError("图片链接无效或已过期")
    return file_id


def build_icon_image_path(file_id: int) -> str:
    """拼出带票据的同源图片地址，前端直接塞进 img src 即可。"""
    query = urlencode({"sign": build_icon_image_token(file_id)})
    return f"{ICON_IMAGE_URL_PATH}/{int(file_id)}/?{query}"


def build_icon_file_url(file: FileList) -> str:
    """生成图片访问地址。

    默认走后端代理的同源相对路径；配置了 ICON_MINIO_PUBLIC_BASE_URL 时改用该前缀
    直出对象地址，留给 CDN 或公开读桶的部署方式。
    """
    public_base_url = _public_base_url()
    if public_base_url:
        return f"{public_base_url}/{file.file_url.lstrip('/')}"
    return build_icon_image_path(file.id)


def build_icon_file_url_map(file_ids) -> dict[int, str]:
    """批量生成图片地址，缺失的文件直接跳过不报错。

    用于规格提报页批量解析 Icon 封面图，单张图失效不应让整页解析失败。
    """
    unique_ids = []
    for value in file_ids:
        try:
            file_id = int(value)
        except (TypeError, ValueError):
            continue
        if file_id not in unique_ids:
            unique_ids.append(file_id)
    if not unique_ids:
        return {}
    files = FileList.objects.filter(
        id__in=unique_ids, engine=ICON_ENGINE, file_type=0
    )
    return {file.id: build_icon_file_url(file) for file in files}


def get_icon_file(file_id: int) -> FileList:
    """按 Icon 专用引擎取文件记录，避免这个匿名端点被拿去读其他存储的文件。"""
    file = FileList.objects.filter(
        id=file_id, engine=ICON_ENGINE, file_type=0
    ).first()
    if not file:
        raise FileNotFoundError("图片不存在或已失效")
    return file


@dataclass(frozen=True)
class IconObject:
    body: object
    content_type: str
    content_length: int | None
    etag: str


def open_icon_object(file: FileList) -> IconObject:
    """打开 MinIO 对象用于流式下发，不把整张图读进内存。"""
    config = get_storage_config()
    try:
        response = create_s3_client(config).get_object(
            Bucket=config.bucket_name, Key=file.file_url
        )
    except ClientError as exc:
        error_code = exc.response.get("Error", {}).get("Code")
        if error_code in {"404", "NoSuchKey", "NotFound"}:
            raise FileNotFoundError("图片对象不存在") from exc
        # 包成 RuntimeError，让调用方不必依赖 botocore 的异常类型
        raise RuntimeError(f"读取图片对象失败: {error_code or exc}") from exc
    return IconObject(
        body=response["Body"],
        content_type=response.get("ContentType") or file.mime_type or "image/jpeg",
        content_length=response.get("ContentLength"),
        etag=str(response.get("ETag") or "").strip('"'),
    )


def iter_icon_object(icon_object: IconObject):
    """按块吐出对象内容，客户端提前断开也保证底层连接被释放。"""
    try:
        yield from icon_object.body.iter_chunks(ICON_IMAGE_CHUNK_SIZE)
    finally:
        icon_object.body.close()


def serialize_icon_files(image_refs: list[dict]) -> list[dict]:
    ordered_ids = [
        int(item["file_id"])
        for item in image_refs
        if isinstance(item, dict) and item.get("file_id")
    ]
    files = FileList.objects.filter(id__in=ordered_ids, engine=ICON_ENGINE, file_type=0)
    file_map = {item.id: item for item in files}
    missing_ids = [file_id for file_id in ordered_ids if file_id not in file_map]
    if missing_ids:
        raise ValueError(f"Icon 图片文件不存在或已失效: {missing_ids}")
    return [
        {
            "file_id": file_id,
            "sort": index,
            "name": file_map[file_id].name,
            "url": build_icon_file_url(file_map[file_id]),
        }
        for index, file_id in enumerate(ordered_ids, start=1)
    ]
