from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Order
from .serializers import OrderSerializer

class OrderListCreateView(generics.ListCreateAPIView):
    """
    Endpoint untuk membuat pesanan baru (POST) dan melihat daftar pesanan user (GET).
    Memerlukan autentikasi JWT Bearer Token.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(pembeli_id=self.request.user.id).order_by('-tanggal_pesan')

    def perform_create(self, serializer):
        # Menyematkan pembeli_id dari user yang sedang login
        serializer.save(pembeli_id=self.request.user.id)

class OrderDetailView(generics.RetrieveAPIView):
    """
    Endpoint untuk melihat detail pesanan tertentu berdasarkan ID.
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
