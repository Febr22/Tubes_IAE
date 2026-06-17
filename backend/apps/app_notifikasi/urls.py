from django.urls import path
from .views import (
    NotifikasiListView, UnreadCountView,
    MarkAsReadView, MarkAllAsReadView,
)

urlpatterns = [
    path('', NotifikasiListView.as_view(), name='notif-list'),
    path('unread-count/', UnreadCountView.as_view(), name='notif-unread'),
    path('<int:id>/read/', MarkAsReadView.as_view(), name='notif-read'),
    path('read-all/', MarkAllAsReadView.as_view(), name='notif-read-all'),
]