import os
import sys
import django

# Set up django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.conf import settings
from midtransclient import Snap

print("SERVER KEY:", settings.MIDTRANS_SERVER_KEY)
print("CLIENT KEY:", settings.MIDTRANS_CLIENT_KEY)
print("IS PRODUCTION:", settings.MIDTRANS_IS_PRODUCTION)

snap_client = Snap(
    is_production=settings.MIDTRANS_IS_PRODUCTION,
    server_key=settings.MIDTRANS_SERVER_KEY,
    client_key=settings.MIDTRANS_CLIENT_KEY
)

param = {
    "transaction_details": {
        "order_id": "test-order-9999",
        "gross_amount": 10000
    },
    "credit_card":{
        "secure" : True
    }
}

try:
    transaction = snap_client.create_transaction(param)
    print("SUCCESS! Token:", transaction['token'])
except Exception as e:
    print("ERROR:", str(e))
