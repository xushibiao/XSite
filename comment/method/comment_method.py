from django.forms import modelform_factory

from comment.models import Comment
from user.method import user_method


def comments_by_article(article_id):
    """
    根据文章ID获取主评论
    :param article_id: 文章ID
    :return: 主评论list（dict）
    """
    comments = list(Comment.objects.filter(article=article_id, is_delete=False, parent__isnull=True)
                    .order_by('create_datetime')
                    .values('id', 'content', 'article', 'user', 'user__username', 'create_datetime'))
    if len(comments) > 0:
        for comment in comments:
            comment["avatar"] = user_method.user_avatar(comment["user"])
    return comments


def comments_children_by_article(article_id):
    """
    根据文章ID获取子评论
    :param article_id: 文章ID
    :return: 子评论list（dict）
    """
    comments_children = list(Comment.objects.filter(article=article_id, is_delete=False, parent__isnull=False)
                             .order_by('create_datetime')
                             .values('id', 'parent', 'content', 'article', 'user', 'user__username', 'to_user',
                                     'to_user__username', 'create_datetime'))
    if len(comments_children) > 0:
        for comment in comments_children:
            comment["avatar"] = user_method.user_avatar(comment["user"])
    return comments_children


def comment_by_id(id):
    """
    根据评论ID获取评论
    :param id: 评论ID
    :return: 评论dict
    """
    comment = Comment.objects.filter(pk=id).values('id', 'parent', 'content', 'article', "article__title", 'user',
                                                   'user__username', 'to_user', 'to_user__username', 'create_datetime')
    comment = comment[0]
    comment["avatar"] = user_method.user_avatar(comment["user"])
    return comment


def not_read_by_user(user_id, auth=False):
    """
    根据用户ID获取未读评论
    :param user_id: 用户ID
    :param auth: 是否为作者
    :return: 评论list（dict）
    """
    if auth:
        return list(Comment.objects.filter(is_read_by_author=False).exclude(user=user_id).order_by('-create_datetime')
                    .values('id', 'article', 'article__title', 'user', 'user__username', 'to_user', 'to_user__username', 'create_datetime'))
    return list(Comment.objects.filter(to_user=user_id, is_read_by_reader=False).exclude(user=user_id).order_by('-create_datetime')
                .values('id', 'article', 'article__title', 'user', 'user__username', 'to_user', 'to_user__username', 'create_datetime'))


def set_read_by_id(id, auth=False):
    """
    根据评论ID更新评论为已读状态
    :param id: 评论ID
    :param auth: 是否为作者
    :return: 影响的行数
    """
    if auth:
        return Comment.objects.filter(pk=id).update(is_read_by_author=True)
    return Comment.objects.filter(pk=id).update(is_read_by_reader=True)


def set_all_read_by_user(user_id, auth=False):
    """
    根据用户ID更新所有未读评论为已读状态
    :param user_id:
    :param auth:
    :return:
    """
    if auth:
        return Comment.objects.filter(is_read_by_author=False).update(is_read_by_author=True)
    return Comment.objects.filter(user=user_id, is_read_by_reader=False).update(is_read_by_reader=True)


def comment_count_by_article(article_id):
    """
    根据文章ID获取评论数
    :param article_id:文章ID
    :return: 评论数（int）
    """
    return Comment.objects.filter(article=article_id).count()


def add(request_post, logged_user):
    """
    添加评论
    article, user, content 三个参数必须
    to_user, parent 回复评论相关参数，可选
    :param logged_user: 已登录用户ID
    :param request_post:
    :return: 成功或错误标志（success/error），具体的错误信息
    """
    if not {"article", "user", "content"}.issubset(request_post.keys()):
        return "error", "缺少必要的参数"
    if not int(request_post["user"]) == logged_user:
        return  "error", "用户信息错误"
    CommentForm = modelform_factory(Comment, fields=("content", "article", "user"))
    comment_form = CommentForm(data=request_post)
    if not comment_form.is_valid():
        return "error", "数据不合法"
    comment = comment_form.save(commit=False)
    if {"to_user", "parent"}.issubset(request_post.keys()):
        CommentForm2 = modelform_factory(Comment, fields=("to_user", "parent"))
        comment_form2 = CommentForm2(data=request_post)
        if not comment_form2.is_valid():
            return "error", "回复评论错误"
        comment.to_user = comment_form2.cleaned_data["to_user"]
        comment.parent = comment_form2.cleaned_data["parent"]
    comment.save()
    comment = comment_by_id(comment.id)
    return "success", comment
