import asyncio
import time
import jwt
from django.http import StreamingHttpResponse
from django.core.cache import cache
from asgiref.sync import sync_to_async
from application import settings
from dvadmin.system.models import MessageCenterTargetUser

async def event_stream(user_id):
    last_sent_time = 0

    while True:
        try:
            # 从 Cache 中获取最后数据库变更时间
            try:
                last_db_change_time = cache.get('last_db_change_time', 0)
            except Exception:
                last_db_change_time = 0

            # 如果是首次连接，或者数据库发生变更时间比上次发送时间新
            # 我们就重新查询未读消息数并发送
            if last_sent_time == 0 or (last_db_change_time and last_db_change_time > last_sent_time):
                @sync_to_async
                def get_unread_count():
                    return MessageCenterTargetUser.objects.filter(users=user_id, is_read=False).count()
                
                count = await get_unread_count()
                yield f"data: {count}\n\n"
                last_sent_time = time.time()
            else:
                # 否则，发送心跳包（Sse 注释行，以冒号开头）保持连接
                yield ": keepalive\n\n"
        except Exception as e:
            yield f": error {str(e)}\n\n"

        await asyncio.sleep(5)


def sse_view(request):
    token = request.GET.get('token')
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
    user_id = decoded.get('user_id')
    response = StreamingHttpResponse(event_stream(user_id), content_type='text/event-stream')
    response['Cache-Control'] = 'no-cache'
    return response
