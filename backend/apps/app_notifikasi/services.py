"""
Service untuk publish notifikasi: simpan ke DB + push via WebSocket.
Inilah implementasi pattern Publish-Subscribe di project ini.
"""
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.contrib.auth import get_user_model
from .models import Notifikasi
from .serializers import NotifikasiSerializer

User = get_user_model()

def kirim_notifikasi(user_id: int, judul: str, pesan: str):
    """
    Simpan notif ke DB lalu broadcast via WebSocket ke user terkait.
    Aman dipanggil dari kode synchronous (views, signals, dll).
    """
    notif = Notifikasi.objects.create(
        user_id=user_id,
        judul=judul,
        pesan=pesan,
    )

    payload = NotifikasiSerializer(notif).data

    channel_layer = get_channel_layer()
    if channel_layer is not None:
        async_to_sync(channel_layer.group_send)(
            f"user_{user_id}",
            {"type": "notif.message", "data": payload},
        )
    return notif


def kirim_notifikasi_ke_semua_admin(judul: str, pesan: str):
    """Broadcast notif ke semua user dengan role='admin'."""
    admin_ids = list(User.objects.filter(role='admin').values_list('id', flat=True))
    for uid in admin_ids:
        kirim_notifikasi(uid, judul, pesan)