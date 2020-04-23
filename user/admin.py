from django.contrib import admin

# Register your models here.
from user.models import UserExtend

admin.site.register(UserExtend)