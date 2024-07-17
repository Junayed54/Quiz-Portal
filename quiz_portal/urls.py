# root urls.py
import nested_admin
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('nested_admin/', include('nested_admin.urls')),
    path('', include('frontend.urls')),
    path("api-auth/", include("rest_framework.urls")),
    # Points to the frontend app for home, login, and signup
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/', include('users.urls')),  # Custom user-related URLs
    path('quiz/', include('quiz.urls')),  # Quiz-related URLs
]
