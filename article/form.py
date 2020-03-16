from django.core.exceptions import ValidationError
from django.forms import ModelForm, FileField

from article.models import Article


# 校验文件类型和大小
def validate_file(file):
    ext = file.name.split('.')[-1]
    # if ext != 'md' & ext != 'markdown':
    if ext not in ['md', 'markdown']:
        raise ValidationError("请上传Markdown类型的文件")
    if file.size > 10485760:
        raise ValidationError("请上传10M以内的文件")


class ArticleForm(ModelForm):
    # 覆盖content字段，添加校验方法
    content = FileField(validators=[validate_file])

    class Meta:
        model = Article
        fields = ['title', 'summary', 'content', 'series', 'visible']


