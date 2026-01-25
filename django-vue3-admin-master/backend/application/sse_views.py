# views.py
import time

import jwt
from django.http import StreamingHttpResponse

from application import settings
from dvadmin.system.models import MessageCenterTargetUser
from django.core.cache import cache


def event_stream(user_id):
    last_sent_time = 0

    while True:
        try:
            # 从缓存中获取最后数据库变更时间（支持Redis和本地缓存）
            last_db_change_time = cache.get('last_db_change_time', 0)
            # 只有当数据库发生变化时才检查总数
            if last_db_change_time and last_db_change_time > last_sent_time:
                count = MessageCenterTargetUser.objects.filter(users=user_id, is_read=False).count()
                yield f"data: {count}\n\n"
                last_sent_time = time.time()
        except Exception as e:
            # 缓存连接失败时使用轮询模式
            import logging
            logging.getLogger(__name__).warning(f"SSE cache error: {e}, using polling mode")
            count = MessageCenterTargetUser.objects.filter(users=user_id, is_read=False).count()
            yield f"data: {count}\n\n"
            last_sent_time = time.time()

        time.sleep(1)


def sse_view(request):
    token = request.GET.get('token')
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
    user_id = decoded.get('user_id')
    response = StreamingHttpResponse(event_stream(user_id), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    return response
