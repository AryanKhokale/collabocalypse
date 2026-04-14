import asyncio
from core.dbs.redis_db import redis_client



async def redis_listener(doc_id: str, manager, doc_service):  
# sender wala params is added
# removed sender caz the msges were only being broadcasted from a speceific webscoket, starting wala instance, to all but not vice versa! 
    pubsub = redis_client.pubsub()
    await pubsub.subscribe(doc_id)
    try:
        async for msg in pubsub.listen():
            if msg["type"] != "message":
                continue
            #data = msg["data"] // this was the frist approach, but this doesnt identify the sender ka socket instance
            raw_payload = msg["data"] # now we are using CN wala concept, HEADER + PAYLOAD wala !
            # concept --> 16 bytes id/header + variable length payload(actual data) // inspired by CN
            # note --> vvvimp --> use bytes instead of any dtype // 
            # Gpt suggested about json but json makes everything slower! bottleneck for my sockets msges!
            # redis pubsub uses bytes so preffered bytes // watched from RAPHEL DE LIO!!
            sender_id = raw_payload[:16] 
            data = raw_payload[17:] # 16 (id) + 1 (type) = 17

            if not data:
                continue
            await doc_service.update_buffer(doc_id, data)
            await manager.broadcast(doc_id, data, sender_id)   # sender = None // changed sender: WebSocket to sender_id: bytes
    except asyncio.CancelledError:
        pass
    except Exception as e:
# log error, yet to be handled, not have enough knowledge for this to trace its cause and even gpt couldnt help much, for now this is running smoothly
        print(f"Redis listener error for {doc_id}: {e}")
    finally:
        await pubsub.unsubscribe(doc_id)
        await pubsub.close()