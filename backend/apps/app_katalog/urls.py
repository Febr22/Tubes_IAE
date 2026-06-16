from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProdukViewSet, KategoriViewSet

router = DefaultRouter()
router.register(r'produk', ProdukViewSet)
router.register(r'kategori', KategoriViewSet)

urlpatterns = [
    path('', include(router.urls)),
]