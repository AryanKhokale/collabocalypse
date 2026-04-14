import redis.asyncio as redis
from core.config import settings


redis_client = redis.from_url('redis://host.docker.internal:6379', decode_responses=False)
#redis://localhost:6379
#print(f"{settings.REDIS_URL}")
#redis://host.docker.internal:6379