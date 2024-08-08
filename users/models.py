from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):

    def create_user(self, phone_number, password=None, role='student', **extra_fields):
        if not phone_number:
            raise ValueError('The phone number must be set')
        
        user = self.model(phone_number=phone_number, role=role, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')  # Default role for superuser

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(phone_number, password, **extra_fields)
        

class CustomUser(AbstractUser):
    ADMIN = 'admin'
    TEACHER = 'teacher'
    STUDENT = 'student'

    ROLE_CHOICES = [
        (ADMIN, 'Admin'),
        (TEACHER, 'Teacher'),
        (STUDENT, 'Student'),
    ]

    username = models.CharField(max_length=100, blank=True, null=True)
    phone_number = models.CharField(max_length=20, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=STUDENT)

    USERNAME_FIELD = 'phone_number'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

    def __str__(self):
        return self.phone_number
