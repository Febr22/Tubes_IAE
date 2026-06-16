from rest_framework.permissions import BasePermission

class IsAdminRole(BasePermission):
    """
    Mengizinkan akses hanya untuk pengguna dengan role 'admin'.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'admin')
