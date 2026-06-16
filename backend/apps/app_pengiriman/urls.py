from django.urls import path
from .views import LokasiView, CekOngkirView

urlpatterns = [
    path('lokasi/', LokasiView.as_view(), name='pengiriman-lokasi'),
    path('cek-ongkir/', CekOngkirView.as_view(), name='pengiriman-cek-ongkir'),
]
