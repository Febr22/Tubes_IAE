import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from apps.app_pesanan.models import Order, OrderItem
from apps.app_katalog.models import Produk
from apps.app_users.models import CustomUser
from rest_framework.test import APIRequestFactory, force_authenticate
from apps.app_pembayaran.views import GenerateSnapTokenView

user = CustomUser.objects.first()
produk = Produk.objects.first()

order = Order.objects.create(pembeli_id=user.id, total_harga=47005000)
OrderItem.objects.create(order=order, laptop_id=produk.id, jumlah=1, harga_saat_beli=47005000)

factory = APIRequestFactory()
request = factory.post('/api/pembayaran/token/', {'order_id': order.id})
force_authenticate(request, user=user)

view = GenerateSnapTokenView.as_view()
response = view(request)
print("STATUS CODE:", response.status_code)
if response.status_code != 201 and response.status_code != 200:
    print("ERROR:", response.data)
else:
    print("SUCCESS! Token:", response.data['snap_token'])
