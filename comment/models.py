from django.contrib.auth.models import User
from django.db import models

# Create your models here.
from article.models import Article


class Comment(models.Model):
    content = models.TextField(verbose_name='评论内容')
    article = models.ForeignKey(Article, on_delete=models.CASCADE,
                                related_name='comments', related_query_name='comment', verbose_name='文章ID')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments',
                             related_query_name='comment', verbose_name='发表评论用户ID')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, verbose_name='回复评论对象用户ID')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, verbose_name='父评论ID')
    is_delete = models.BooleanField(default=False, verbose_name='删除标志')
    is_read_by_author = models.BooleanField(default=False, verbose_name='作者已读标志')
    is_read_by_reader = models.BooleanField(default=False, verbose_name='读者已读标志')
    create_datetime = models.DateTimeField(auto_now_add=True, verbose_name="创建时间")
    update_datetime = models.DateTimeField(auto_now=True, verbose_name="更新时间")

    def __str__(self):
        return self.content

    class Meta:
        db_table = 'comment'
        verbose_name = '评论'
