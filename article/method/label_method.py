# 关于文章标签的操作方法
import re

from django.forms import modelform_factory

from article.models import ArticleLabel


def labels_all():
    """
    获取所有标签
    :return: 标签列表list
    """
    return list(ArticleLabel.objects.values('id', 'name'))


def labels_by_article_ids(article_ids):
    """
    根据文章IDs查询标签，并添加上article_id字段信息
    :param article_ids: 文章ids
    :return: 若article_ids不合法，则返回0，否则返回标签列表list
    """
    if not re.match('^([0-9]+[,])*[0-9]+$', article_ids):
        return 0
    labels = []
    for article_id in article_ids.split(','):
        label = ArticleLabel.objects.filter(article__id=article_id).values('id', 'name')
        for i in range(0, len(label)):
            label[i]['article_id'] = article_id
        labels += label
    return labels


def add_label(request_post):
    """
    添加标签
    :param request_post: request.POST
    :return: 表单验证不通过则返回0，通过则返回保存后的标签对象
    """
    ArticleLabelForm = modelform_factory(ArticleLabel, fields=('name',))
    label_form = ArticleLabelForm(request_post)
    if not label_form.is_valid():
        return 0
    return label_form.save()
