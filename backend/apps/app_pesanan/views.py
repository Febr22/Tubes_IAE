from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Order
from .serializers import OrderSerializer
from apps.app_users.permissions import IsAdminRole
from apps.app_notifikasi.services import (
    kirim_notifikasi, kirim_notifikasi_ke_semua_admin,
)

# Mapping label status untuk teks notif yang ramah
STATUS_LABEL = {
    'pending': 'Menunggu Pembayaran',
    'konfirmasi': 'Menunggu Konfirmasi Admin',
    'diproses': 'Sedang Disiapkan',
    'dikirim': 'Sedang Dikirim',
    'selesai': 'Selesai',
    'dibatalkan': 'Dibatalkan',
}


class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(pembeli_id=self.request.user.id).order_by('-tanggal_pesan')

    def perform_create(self, serializer):
        order = serializer.save(pembeli_id=self.request.user.id)
        # 🔔 Publish event: pesanan baru → notif ke buyer & semua admin
        kirim_notifikasi(
            user_id=self.request.user.id,
            judul="Pesanan Dibuat",
            pesan=f"Pesanan #{order.id} berhasil dibuat. Silakan lanjut bayar.",
        )
        kirim_notifikasi_ke_semua_admin(
            judul="Pesanan Baru Masuk",
            pesan=f"Pesanan #{order.id} senilai Rp{int(order.total_harga):,} masuk.",
        )


class OrderDetailView(generics.RetrieveAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'


class AdminOrderListView(generics.ListAPIView):
    queryset = Order.objects.all().order_by('-tanggal_pesan')
    serializer_class = OrderSerializer
    permission_classes = [IsAdminRole]


class AdminOrderDetailUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminRole]
    lookup_field = 'id'

    def perform_update(self, serializer):
        old_status = serializer.instance.status
        old_resi = serializer.instance.resi
        order = serializer.save()

        # 🔔 Publish event hanya kalau ada perubahan status / resi baru diisi
        if order.status != old_status:
            label = STATUS_LABEL.get(order.status, order.status)
            kirim_notifikasi(
                user_id=order.pembeli_id,
                judul="Status Pesanan Diperbarui",
                pesan=f"Pesanan #{order.id} kini berstatus: {label}.",
            )
        if order.resi and order.resi != old_resi:
            kirim_notifikasi(
                user_id=order.pembeli_id,
                judul="Resi Pengiriman",
                pesan=f"Pesanan #{order.id} dikirim. Resi: {order.resi} ({(order.kurir or '').upper()}).",
            )