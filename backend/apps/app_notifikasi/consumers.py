import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Notifikasi
from .serializers import NotifikasiSerializer

class NotifikasiConsumer(AsyncWebsocketConsumer):
    """
    WebSocket per-user. Tiap user yang login akan subscribe ke group `user_<id>`.
    Server bisa push notif ke group itu kapan saja.
    """

    async def connect(self):
        self.user = self.scope["user"]

        # Tolak koneksi kalau belum login (tidak ada JWT valid)
        if not self.user.is_authenticated:
            await self.close(code=4001)
            return

        self.group_name = f"user_{self.user.id}"
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Kirim greeting + jumlah unread saat baru connect
        unread = await self.get_unread_count()
        await self.send(text_data=json.dumps({
            "type": "connected",
            "user_id": self.user.id,
            "unread_count": unread,
        }))

    async def disconnect(self, close_code):
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        """Handle ping/pong dari client biar koneksi nggak ditutup proxy."""
        try:
            data = json.loads(text_data or "{}")
            if data.get("type") == "ping":
                await self.send(text_data=json.dumps({"type": "pong"}))
        except json.JSONDecodeError:
            pass

    # Handler yang dipanggil oleh group_send dari service.py
    async def notif_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "notification",
            "data": event["data"],
        }))

    @database_sync_to_async
    def get_unread_count(self):
        return Notifikasi.objects.filter(user_id=self.user.id, is_read=False).count()