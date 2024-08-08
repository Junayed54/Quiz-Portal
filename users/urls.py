# # urls.py

# from django.urls import path, include
# from rest_framework.routers import DefaultRouter
# from dj_rest_auth.views import LoginView, LogoutView
# from dj_rest_auth.registration.views import RegisterView
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView



# urlpatterns = [
#     path('auth/registration/', UserCreate.as_view(), name='user_create'),    
#     path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
#     path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
#     path('auth/logout/', LogoutView.as_view(), name = 'logout')
# ]


from django.urls import path
from .views import SignupView, LogoutView, UserRoleView
from rest_framework_simplejwt.views import TokenRefreshView, TokenObtainPairView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', TokenObtainPairView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('user-role/', UserRoleView.as_view(), name='get_user_role'),

    # Other URLs
]

