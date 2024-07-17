from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from rest_framework.permissions import AllowAny
from django.contrib.auth import logout
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import CustomTokenObtainPairSerializer



class SignupView(generics.CreateAPIView):
    queryset = get_user_model().objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        user = response.data
        refresh = RefreshToken.for_user(get_user_model().objects.get(phone_number=user['phone_number']))
        return Response({
            'user': user,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)



class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        # Assuming you're using JWT and you want to invalidate tokens client-side
        # There's no built-in JWT token invalidation in SimpleJWT; typically, tokens are cleared on the client side.
        logout(request)
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)