import asyncio
from fastapi import WebSocket
from starlette.websockets import WebSocketDisconnect
#import redis.asyncio as redis
from core.config import settings
from core.dbs.redis_db import redis_client
from services.realtime_service import redis_listener

#redis_client = redis.from_url("redis://127.0.0.1:6379")

class ConnectionManager:
    def __init__(self, doc_service):
        self.rooms: dict[str, set[WebSocket]] = {}
        self.redis_tasks: dict[str, asyncio.Task] = {}
        self.doc_service = doc_service

    async def connect(self, ws: WebSocket, doc_id: str, client_id: bytes): # added client_id
        #from ReddisListener import redis_listener
        await ws.accept()
        ws.client_id = client_id # attached this id to websocket wala datastructure or instance to be more precise
        if doc_id not in self.rooms:
            self.rooms[doc_id] = set()
            self.redis_tasks[doc_id] = asyncio.create_task(
                #self._redis_listener(doc_id)
                redis_listener(doc_id, self, self.doc_service)
            )

        self.rooms[doc_id].add(ws)

    async def disconnect(self, ws: WebSocket, doc_id: str):
        room = self.rooms.get(doc_id)
        if not room:
            return

        room.discard(ws)

        if not room:
            del self.rooms[doc_id]

            task = self.redis_tasks.pop(doc_id, None)
            if task:
                task.cancel()


    async def broadcast(self, doc_id: str, message: bytes, sender_id: bytes ):
        dead = []
        
        for ws in self.rooms.get(doc_id, []):
            if getattr(ws, 'client_id', None) == sender_id:
                continue
            try:
                await ws.send_bytes(message)
               
            except Exception:
                dead.append(ws)

        for ws in dead:
            await self.disconnect(ws, doc_id)

#print("123")

           # My  logic for broadcasting, from the CN ka concept // also the previous approach
           # but this also broadcasts to the sender wala socket instance
           # took help from harkirat and raphael de lio videos to come with the optimized approach
#    async def broadcast(self, doc_id: str, message: bytes, sender):
#        dead = []
#
#        for ws in self.rooms.get(doc_id, []):
#            if ws is sender:
#               continue
#            try:
#               await ws.send_bytes(message)
#            except Exception:
#               dead.append(ws)
#
#        for ws in dead:
#            await self.disconnect(ws, doc_id)



#docker run --name redis-server -p 6379:6379 -d redis
