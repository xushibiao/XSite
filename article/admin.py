from django.contrib import admin

# Register your models here.
from article.models import Article, ArticleLabel, ArticleSeries

admin.site.register(Article)
admin.site.register(ArticleLabel)
admin.site.register(ArticleSeries)