from django.contrib.auth.models import User
from django.db import models

# Create your models here.


# 用户信息扩展
class UserExtend(models.Model):
    # 与Django自带的User模型创建一对一关系
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    avatar = models.ImageField(upload_to="avatar/%Y%m%d/", blank=True, verbose_name='头像')
    avatar_other = models.CharField(max_length=256, default='', blank=True, verbose_name='第三方头像地址')
    github_user_id = models.IntegerField(unique=True, null=True, verbose_name='Github用户ID')
    qq_user_id = models.CharField(max_length=64, blank=True, verbose_name='qq用户ID')

    def __str__(self):
        return self.user.username

    class Meta:
        verbose_name = '用户扩展'