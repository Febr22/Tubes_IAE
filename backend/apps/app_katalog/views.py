from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from apps.app_users.permissions import IsAdminRole
from .models import Produk, Kategori
from .serializers import ProdukSerializer, KategoriSerializer

class ProdukViewSet(viewsets.ModelViewSet):
    queryset = Produk.objects.all().order_by('-created_at')
    serializer_class = ProdukSerializer
    #biar pake slug
    lookup_field = 'slug'

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminRole()]
        return [IsAuthenticatedOrReadOnly()]

class KategoriViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Kategori.objects.all()
    serializer_class = KategoriSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]