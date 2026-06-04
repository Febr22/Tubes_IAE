from django.urls import path
from .views import GenerateSnapTokenView, MidtransNotificationView, CheckPaymentStatusView

urlpatterns = [
    path('create-transaction/', GenerateSnapTokenView.as_view(), name='pembayaran-create-transaction'),
    path('notification/', MidtransNotificationView.as_view(), name='pembayaran-webhook'),
    path('check-status/<int:order_id>/', CheckPaymentStatusView.as_view(), name='pembayaran-check-status'),
]
