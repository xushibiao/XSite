from django.urls import path

from user.views import UserRegisterView, UserView, UserLogView, GithubLoginView, UserMessageView, user_ws_connect

urlpatterns = [
    path('register/', UserRegisterView.as_view()),
    path('', UserView.as_view()),
    path('login/', UserLogView.as_view()),
    path('logout/', UserLogView.as_view()),
    path('login/github/', GithubLoginView.as_view()),
    path('message/', UserMessageView.as_view()),
    path('connect/', user_ws_connect),
]
