import os
import random
from io import BytesIO

from django.contrib.auth.models import User
from django.core.files import File

from XSite import settings
from user.models import UserExtend


def user_avatar(id):
    """
    获取用户头像信息
    :param id: userID
    :return: avatar地址字符串
    """
    avatar_qs = UserExtend.objects.filter(user=id).values('avatar', 'avatar_other')
    if len(avatar_qs) > 0:
        avatar = avatar_qs[0]
        return os.path.join(settings.MEDIA_URL, avatar["avatar"]) if len(avatar["avatar"])>0 else avatar["avatar_other"]
    return ''


def username_clean(username):
    """
    用于第三方登录时用户名的清洗，若用户名重复则在用户名末尾增加随机字符串
    :param username:
    :return:
    """
    if User.objects.filter(username=username).exists():
        str_tpl = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
        username += '_'
        for i in range(3):
            username += random.choice(str_tpl)
        return username_clean(username)
    return username


def avatar_clean(image_byte):
    """
    将字节码图像数据保存成文件
    :param image_byte:字节码图像数据
    :return:
    """
    return File(BytesIO(image_byte))


def superuser():
    """
    获取超级用户信息
    :return:
    """
    return User.objects.get(is_superuser=True)