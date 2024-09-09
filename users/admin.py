from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ('phone_number', 'username', 'is_staff', 'is_active', 'role')
    list_filter = ('is_staff', 'is_active',)
    fieldsets = (
        (None, {'fields': ('phone_number', 'username', 'password')}),
        ('Permissions', {'fields': ('is_staff', 'is_active')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('phone_number', 'username', 'password1', 'password2', 'is_staff', 'is_active')}
        ),
    )
    search_fields = ('phone_number', 'username',)
    ordering = ('phone_number',)

admin.site.register(CustomUser, CustomUserAdmin)
