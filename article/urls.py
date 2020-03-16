from django.urls import path
from django.views.generic import TemplateView

from article.views import ArticleView, ArticleLabelView, ArticleSeriesView

urlpatterns = [
    path('', ArticleView.as_view()),
    path('addArticle/', TemplateView.as_view(template_name="article/add_article.html")),
    path('label/', ArticleLabelView.as_view()),
    path('series/', ArticleSeriesView.as_view()),
]
