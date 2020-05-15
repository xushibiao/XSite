# 文章相关操作方法
import os

import markdown
from django.core.paginator import Paginator
from django.db.models import F

from XSite.settings import MEDIA_ROOT
from article.form import ArticleForm
from article.models import Article, ArticleLabel
from comment.method import comment_method


def article_by_id(id: int):
    """
    根据文章ID获取文章数据(包含系列名称)
    文章对象的content值会被替换成实质的文件内容
    :param id: 文章ID
    :return: 文章（dict），无数据时返回0
    """
    fields = ['id', 'title', 'summary', 'content', 'create_datetime', 'read_num', 'like_num', 'series_id', 'series__name']
    article = list(Article.objects.filter(pk=id).values(*fields))
    if len(article) == 1:
        path = os.path.join(MEDIA_ROOT, article[0]["content"])
        with open(path, encoding='UTF-8') as article_file:
            content = article_file.read()
            extensions = [
                # 包含 缩写、表格等常用扩展
                'markdown.extensions.extra',
                # 语法高亮扩展
                'markdown.extensions.codehilite',
                # 目录
                'markdown.extensions.toc',
                'markdown.extensions.tables',
                # 'markdown.extensions.fenced_code',
            ]
            md = markdown.Markdown(extensions=extensions, tab_length=2)
            article[0]["content"] = md.convert(content)
            article[0]["toc"] = md.toc
        return article[0]
    return 0


def articles_by_series(series_id):
    """
    根据系列ID获取文章列表
    :param series_id: 系列ID
    :return: 文章列表list
    """
    return list(Article.objects.filter(series_id=series_id).order_by('create_datetime').values('id', 'title'))


def latest_3_articles():
    """
    获取最新三篇文章
    :return: 文章list（dict）
    """
    articles = list(Article.objects.order_by('-create_datetime')[:3]
                    .values('id', 'title', 'summary', 'create_datetime', 'read_num', 'like_num'))
    for article in articles:
        article["comment_num"] = comment_method.comment_count_by_article(article["id"])
    return articles


def article_page(current_page: int, per_page: int, **kwargs):
    """
    获取文章分页列表
    :param current_page: 当前页数
    :param per_page: 每页条数
    :return: 文章列表，总条数
    """
    queryset = Article.objects.order_by('-create_datetime')\
        .values('id', 'title', 'summary', 'create_datetime', 'read_num', 'like_num', 'series_id')
    if len(kwargs) > 0:
        queryset = queryset.filter(**kwargs)
    paginator = Paginator(queryset, per_page)
    page = paginator.get_page(current_page)
    articles = list(page.object_list)
    total_count = paginator.count
    for article in articles:
        article["comment_num"] = comment_method.comment_count_by_article(article["id"])
    return articles, total_count


def add_article(request_post, request_files):
    """
    添加文章
    :param request_post: request.POST
    :param request_files: request.FILES
    :return: 表单验证失败则返回0，保存成功则返回1
    """
    article_form = ArticleForm(request_post, request_files)
    if not article_form.is_valid():
        return 0
    article = article_form.save()
    if "label" in request_post.keys():
        label_id = request_post["label"].split(',')
        # label = ArticleLabel.objects.filter(id__in=label_id)
        article.label.add(*label_id)
    return 1


def read_num_increase(article_id):
    """
    指定文章的阅读数加1
    :param article_id: 文章ID
    :return: None
    """
    Article.objects.filter(pk=article_id).update(read_num=F('read_num')+1)