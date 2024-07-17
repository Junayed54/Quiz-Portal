# root urls.py
import nested_admin
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('nested_admin/', include('nested_admin.urls')),
    path('', include('frontend.urls')),
    path("api-auth/", include("rest_framework.urls")),
    path('auth/', include('users.urls')),  # Custom user-related URLs
    path('quiz/', include('quiz.urls')),  # Quiz-related URLs
]

urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)