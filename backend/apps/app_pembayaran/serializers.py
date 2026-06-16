from rest_framework import serializers
from .models import Pembayaran

class PembayaranSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pembayaran
        fields = [
            'id', 'order_id', 'metode', 'is_lunas', 'tanggal_konfirmasi',
            'midtrans_order_id', 'transaction_id', 'snap_token',
            'gross_amount', 'status_transaksi', 'metode_pembayaran_midtrans',
            'waktu_transaksi', 'bukti_bayar'
        ]
        read_only_fields = ['id', 'is_lunas', 'tanggal_konfirmasi', 'snap_token', 'midtrans_order_id', 'status_transaksi']
