import json
import os

import requests
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.forms import modelform_factory, model_to_dict
from django.http import JsonResponse, HttpResponse
from django.middleware.csrf import get_token
from django.shortcuts import render, redirect

# Create your views here.
from django.utils.decorators import method_decorator
from django.views import View
from dwebsocket import accept_websocket

from XSite import settings
from comment.method import comment_method
from user.form import UserExtendForm
from user.method import user_method, user_ws_method
from user.models import UserExtend


class UserRegisterView(View):
    def post(self, request):
        """
        处理用户注册请求
        :param request:
        :return:注册成功返回'success'，注册失败返回相应错误信息
        """
        msg = ''
        errors = ''
        user = None
        # 使用Django默认的用户名和密码验证规则
        # 用户名：不超过150个字符，且只能包含：汉字、英文字母、数字和@.+-_以上字符
        # 密码：任意字符，不超过128个字符
        UserForm = modelform_factory(User, fields=('username', 'password'))
        user_form = UserForm(request.POST)
        user_extend_form = UserExtendForm(files=request.FILES)
        if user_form.is_valid() and user_extend_form.is_valid():
            user_cleaned = user_form.cleaned_data
            user = User.objects.create_user(user_cleaned["username"], password=user_cleaned["password"])
            if 'avatar' in request.FILES.keys():
                user_extend = UserExtend(user=user, avatar=request.FILES['avatar'])
                user_extend.save()
            login(request, user)
            user = {'id': user.id, 'username': user.username,
                    'avatar': user_method.user_avatar(request.user.id), 'is_superuser': user.is_superuser}
            msg = 'success'
        else:
            msg = 'error'
            errors = user_form.errors
            user_extend_form_error = user_extend_form.errors
            if len(user_extend_form_error) > 0:
                for key in user_extend_form_error.keys():
                    msg[key] = user_extend_form_error[key]
        data = {'msg': msg, 'errors': errors, 'user': user}
        return JsonResponse(data)

    def get(self, request):
        """
        处理判断用户名是否唯一请求
        :param request:
        :return: 唯一返回yes，不唯一返回no
        """
        if "username" not in request.GET.keys():
            return HttpResponse("请携带参数username")
        username = request.GET["username"]
        if User.objects.filter(username=username).exists():
            return HttpResponse("no")
        return HttpResponse("yes")


class UserView(View):
    def get(self, request):
        """
        获取已登录用户信息
        :param request:
        :return:
        """
        if "type" in request.GET.keys() and request.GET["type"] == "logged":
            if request.user.is_authenticated:
                user = {"id": request.user.id, "username": request.user.username,
                        "avatar": user_method.user_avatar(request.user.id),  'is_superuser': request.user.is_superuser}
                data = {"msg": "success", "user": user}
            else:
                data = {"msg": "error"}
            return JsonResponse(data)

    @method_decorator(login_required(login_url='/'))
    def post(self, request):
        """
        处理修改头像请求
        :param request:
        :return:
        """
        if "id" in request.POST.keys() and not int(request.POST["id"]) == request.user.id:
            return JsonResponse({"msg": "error"})
        if "id" in request.POST.keys() and "avatar" in request.FILES.keys():
            user_id = request.POST["id"]
            avatar = request.FILES["avatar"]
            user_extend_form = UserExtendForm(files=request.FILES)
            if user_extend_form.is_valid():
                UserExtend.objects.update_or_create(defaults={'avatar': avatar}, user_id=user_id)
                avatar = user_method.user_avatar(user_id)
                return JsonResponse({"msg": "success", "avatar": avatar})
        return JsonResponse({"msg": "error"})


class UserLogView(View):
    def post(self, request):
        """
        处理用户登录请求
        :param request:
        :return:登录成功返回用户信息，失败返回error
        """
        # 本地登录
        if {"username", "password"}.issubset(request.POST.keys()):
            user = authenticate(username=request.POST["username"], password=request.POST["password"])
            if user is not None:
                login(request, user)
                user = {"id": user.id, "username": user.username,
                        "avatar": user_method.user_avatar(user.id), 'is_superuser': user.is_superuser}
                data = {"msg": "success", "user": user}
            else:
                data = {"msg": "error"}
            return JsonResponse(data)

    def get(self, request):
        """
        处理用户退出登录请求
        关闭websocket连接
        :param request:
        :return: None
        """
        user_ws_method.delete(request.user.id)
        logout(request)
        return HttpResponse()


class LoginOtherView(View):
    def get(self, request):
        """
        第三方授权登录
        请求第三方接口返回用户信息
        判断用户是否存在来决定是否创建新用户
        登录用户，重定向首页
        """
        # github登录
        if "app" in request.GET.keys() and request.GET["app"] == "github":
            if "code" in request.GET.keys():
                client_id = "9d9c5e582b68d07dfad8"
                code = request.GET["code"]
                client_secret = "e64f69056a90d8d4eb21cd9381070a21b53896e0"
                data = {"client_id": client_id, "client_secret": client_secret, "code": code}
                response = requests.post("https://github.com/login/oauth/access_token", data=data)
                access_token = response.text.split('&')[0].split('=')[1]
                headers = {"Authorization": "token "+access_token, "User-Agent": "XSite"}
                response = requests.get("https://api.github.com/user?access_token="+access_token, headers=headers)
                user_info = response.json()
                print(user_info)
                if not UserExtend.objects.filter(github_user_id=user_info["id"]).exists():
                    username = user_method.username_clean(user_info["login"])
                    avatar_other = user_info["avatar_url"]
                    user = User.objects.create_user(username)
                    user_extend = UserExtend(user=user, avatar_other=avatar_other, github_user_id=user_info["id"])
                    user_extend.save()
                else:
                    user = User.objects.get(userextend__github_user_id=user_info["id"])
                login(request, user)
                if "redirect_url" in request.session.keys():
                    return redirect(request.session["redirect_url"])
                return redirect('/')
        # QQ登录
        if "app" in request.GET.keys() and request.GET["app"] == "qq":
            if "code" in request.GET.keys():
                grant_type = "authorization_code"
                client_id = "101870649"
                client_secret = "4f84644f02b7c034cfefdaad68af3505"
                code = request.GET["code"]
                redirect_uri = "http://www.xusite.top/user/loginother/?app=qq"
                data = {"grant_type": grant_type, "client_id": client_id, "client_secret": client_secret,
                        "code": code, "redirect_uri": redirect_uri}
                response = requests.get("https://graph.qq.com/oauth2.0/token", data=data)
                access_token = response.text.split('&')[0].split('=')[1]
                return HttpResponse(access_token)

    def post(self, request):
        """
        保存第三方登录前的url到session中，用于登录后页面跳转
        :param request:
        :return:
        """
        if "redirect_url" in request.GET.keys():
            redirect_url = request.GET["redirect_url"]
            request.session["redirect_url"] = redirect_url
            return HttpResponse("success")
        else:
            return HttpResponse("error")


class UserMessageView(View):
    @method_decorator(login_required(login_url="/"))
    def get(self, request):
        """
        返回已登录用户消息
        :param request:
        :return:
        """
        user = request.user
        if user.is_superuser:
            messages = comment_method.not_read_by_user(user.id, auth=True)
        else:
            messages = comment_method.not_read_by_user(user.id)
        return JsonResponse({"msg": "success", "messages": messages})


@login_required(login_url='/')
@accept_websocket
def user_ws_connect(request):
    """
    接收websocket请求并保存
    :param request:
    :return:
    """
    if request.is_websocket():
        for message in request.websocket:
            if not message:
                break
            if message.decode() == "keepalive":
                request.websocket.send("keepalive")
            else:
                user_id = message.decode()
                user_ws_method.save(user_id, request.websocket)
        # message = request.websocket.wait()
        # # if not message:
        # #     break
        # if message.decode() == "keepalive":
        #     request.websocket.send("keepalive")
        # else:
        #     user_id = message.decode()
        #     user_ws_method.save(user_id, request.websocket)


def csrf_token(request):
    get_token(request)
    return JsonResponse({"msg": "success"})