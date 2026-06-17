from rest_framework import serializers
from .models import Notifikasi

class NotifikasiSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notifikasi
        fields = ['id', 'user_id', 'judul', 'pesan', 'is_read', 'tanggal_kirim']
        read_only_fields = ['id', 'tanggal_kirim']