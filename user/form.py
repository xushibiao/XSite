from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.forms import ModelForm, ImageField, CharField
from user.models import UserExtend

from article.models import Article


# 校验文件类型和大小
def validate_avatar(file):
    ext = file.name.split('.')[-1]
    if ext.lower() not in ['jpg', 'png']:
        raise ValidationError("请上传jpg或png类型的图片")
    if file.size > 102400:
        raise ValidationError("请上传100kB以内的图片")


class UserExtendForm(ModelForm):
    # 为avatar字段添加校验方法
    avatar = ImageField(required=False, validators=[validate_avatar])

    class Meta:
        model = UserExtend
        fields = ['avatar']



