from rest_framework import viewsets
from .models import Produk
from .serializers import ProdukSerializer

class ProdukViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Produk.objects.all().order_by('-created_at')
    serializer_class = ProdukSerializer