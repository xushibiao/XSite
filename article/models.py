from django.core.exceptions import ValidationError
from django.db import models


# Create your models here.


class ArticleSeries(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="文章系列名称")
    create_datetime = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    update_datetime = models.DateTimeField(auto_now=True, verbose_name="更新时间")

    def __str__(self):
        return self.name

    class Meta:
        db_table = "article-series"
        verbose_name = "文章系列"


class ArticleLabel(models.Model):
    name = models.CharField(max_length=100, unique=True, verbose_name="标签名称")
    create_datetime = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    update_datetime = models.DateTimeField(auto_now=True, verbose_name="更新时间")

    def __str__(self):
        return self.name

    class Meta:
        db_table = "article-label"
        verbose_name = "文章标签"


class Article(models.Model):
    title = models.CharField(max_length=200, verbose_name="标题")
    summary = models.CharField(max_length=1000, verbose_name="摘要")
    # 文章主体内容以Markdown文件形式储存
    content = models.FileField(upload_to="articlefiles/%Y/%m/%d/", verbose_name="文章内容文件")
    # 当关联的文章系列被删除时，此字段置空
    series = models.ForeignKey(ArticleSeries, models.SET_NULL, blank=True, null=True, verbose_name="文章系列")
    # 标签与文章是多对多关系
    label = models.ManyToManyField(ArticleLabel, blank=True)
    read_num = models.PositiveIntegerField(default=0, verbose_name="阅读量")
    # True表示公开，False表示仅自己可见
    visible = models.BooleanField(default=True, verbose_name="可见性")
    create_datetime = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    update_datetime = models.DateTimeField(auto_now=True, verbose_name="更新时间")

    def __str__(self):
        return self.title

    class Meta:
        db_table = "article"
        verbose_name = "文章"


