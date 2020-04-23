import json
from copy import copy

from django.contrib.auth.decorators import login_required
from django.forms import modelform_factory, model_to_dict
from django.http import JsonResponse, HttpResponse, HttpRequest
from django.shortcuts import render

# Create your views here.
from django.utils.decorators import method_decorator
from django.views import View

from comment.method import comment_method
from comment.models import Comment
from user.method import user_ws_method, user_method


class CommentView(View):
    def get(self, request):
        """
        返回评论和子评论两个列表
        :param request:
        :return:
        """
        if "article_id" in request.GET.keys():
            comments = comment_method.comments_by_article(request.GET["article_id"])
            comments_children = comment_method.comments_children_by_article(request.GET["article_id"])
            data = {"msg": "success", "comments": comments, "comments_children": comments_children}
            return JsonResponse(data)
        return JsonResponse({"msg": "error"})

    @method_decorator(login_required(login_url="/"))
    def post(self, request):
        """
        添加评论
        article, user, content 三个参数必须
        to_user, parent 回复评论相关参数，可选
        :param request:
        :return:
        """
        msg, result = comment_method.add(request.POST, request.user.id)
        if msg == "error":
            return JsonResponse({"msg": msg, "error": result})
        message = copy(result)
        if result["to_user"] is None:
            superuser = user_method.superuser()
            message["to_user"] = superuser.id
        message["create_datetime"] = str(message["create_datetime"]).replace(' ', 'T')
        user_ws_method.send(message["to_user"], json.dumps(message))
        return JsonResponse({"msg": msg, "comment": result})

    @method_decorator(login_required(login_url='/'))
    def put(self, request):
        """
        更改评论为已读状态
        :param request:
        :return:
        """
        if len(request.body) > 0:
            data = json.loads(request.body.decode())
            if "id" in data.keys():
                if request.user.is_superuser:
                    auth = True
                else:
                    auth = False
                result = comment_method.set_read_by_id(data["id"], auth)
                if result == 1:
                    return JsonResponse({"msg": "success"})
                return JsonResponse({"msg": "error"})
        if request.user.is_superuser:
            auth = True
        else:
            auth = False
        comment_method.set_all_read_by_user(request.user.id, auth)
        return JsonResponse({"msg": "success"})
