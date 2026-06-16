from django.urls import path
from .views import OrderListCreateView, OrderDetailView, AdminOrderListView, AdminOrderDetailUpdateView

urlpatterns = [
    path('order/', OrderListCreateView.as_view(), name='order-list-create'),
    path('order/<int:id>/', OrderDetailView.as_view(), name='order-detail'),
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/orders/<int:id>/', AdminOrderDetailUpdateView.as_view(), name='admin-order-detail-update'),
]
