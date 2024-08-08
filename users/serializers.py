from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    phone_number = serializers.CharField()
    password = serializers.CharField()

    def validate(self, attrs):
        phone_number = attrs.get('phone_number')
        password = attrs.get('password')

        if phone_number and password:
            user = authenticate(request=self.context.get('request'), phone_number=phone_number, password=password)
            if not user:
                raise serializers.ValidationError('Invalid phone number or password.')

            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include "phone_number" and "password".')

class UserSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'phone_number', 'password', 'role')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data.get('username', ''),
            phone_number=validated_data['phone_number'],
            password=validated_data['password'],
            role=validated_data.get('role', User.STUDENT)  # Default to 'student' if no role is provided
        )
        return user
