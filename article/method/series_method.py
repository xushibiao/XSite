# 关于文章系列操作方法
import os
import re

from django.core.paginator import Paginator
from django.forms import modelform_factory

from XSite.settings import MEDIA_URL
from article.models import ArticleSeries, Article


def series_all():
    """
    获取所有文章系列
    :return: 文章系列list
    """
    return list(ArticleSeries.objects.values('id', 'name', 'bgi_url'))


def series_by_ids(series_ids):
    """
    根据文章系列ids获取文章系列
    :param series_ids: 文章系列ids
    :return: 若series_ids不合法，则返回0，否则返回文章系列list
    """
    if not re.match('^([0-9]+[,])*[0-9]+$', series_ids):
        return 0
    return list(ArticleSeries.objects.filter(id__in=series_ids.split(',')).values('id', 'name'))


def series_by_article_id(article_id):
    """
    根据文章ID获取文章系列
    :param article_id: 文章ID
    :return: 文章系列list
    """
    series_id = Article.objects.filter(pk=article_id).values_list('series_id')
    if not len(series_id):
        return []
    series_id = series_id[0][0]
    return list(ArticleSeries.objects.filter(pk=series_id).values('id', 'name'))


def exist_by_name(name):
    """
    根据名称判断该系列是否存在
    :param name: 文章系列名称
    :return: 存在返回1，不存在返回0
    """
    return ArticleSeries.objects.filter(name=name).exists()


def add_series(request_post):
    """
    添加文章系列
    :param request_post: request.POST
    :return: 表单验证不通过返回0，通过则返回保存后的文章系列对象
    """
    ArticleSeriesForm = modelform_factory(ArticleSeries, fields=('name', 'bgi_url'))
    series_form = ArticleSeriesForm(request_post)
    if not series_form.is_valid():
        return 0
    return series_form.save()


def series_page(current_page, per_page):
    """
    返回系列分页列表
    :param current_page: 当前页码
    :param per_page: 每页条数
    :return: 系列总数, 系列列表
    """
    qs = ArticleSeries.objects.order_by('create_datetime').values('id', 'name', 'bgi_url')
    paginator = Paginator(qs, per_page)
    page = paginator.get_page(current_page)
    total_count = paginator.count
    series_list = list(page.object_list)
    for series in series_list:
        series["bgi_url"] = os.path.join(MEDIA_URL, series["bgi_url"])
        series["article_num"] = Article.objects.filter(series=series["id"]).count()
    return total_count, series_list


def latest_3_series():
    """
    获取最新三个文章系列
    :return:
    """
    series_list = list(ArticleSeries.objects.order_by('-create_datetime')[:3].values('id', 'name', 'bgi_url'))
    for series in series_list:
        series["bgi_url"] = os.path.join(MEDIA_URL, series["bgi_url"])
        series["article_num"] = Article.objects.filter(series=series["id"]).count()
    return series_list
