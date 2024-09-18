# permissions.py
from rest_framework.permissions import BasePermission

class IsAdminOrReadOnly(BasePermission):
    """
    Custom permission to only allow admins or teachers to edit or delete an object.
    """

    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        # Write permissions are allowed to the admin or teacher users.
        return request.user and (request.user.is_staff or request.user.role == 'teacher')

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and (request.user.is_staff)

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'student'


# class IsTeacherOrAdmin(permissions.BasePermission):
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and (request.user.role == 'teacher' or request.user.is_staff)