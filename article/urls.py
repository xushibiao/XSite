from django.urls import path
from django.views.generic import TemplateView

from article.views import ArticleView, ArticleLabelView, ArticleSeriesView, ArticleListView, AddArticleView, \
    ArticleSeriesListView

urlpatterns = [
    # path('', TemplateView.as_view(template_name="article/article_list.html")),
    path('', ArticleView.as_view()),
    path('list/', ArticleListView.as_view()),
    path('list/<str:order_type>/', ArticleListView.as_view()),
    path('list/<str:order_type>/series/<int:series_id>/', ArticleListView.as_view()),
    path('list/<str:order_type>/label/<int:label_id>/', ArticleListView.as_view()),
    path('list/series/<int:series_id>/', ArticleListView.as_view()),
    path('addArticle/', AddArticleView.as_view()),
    path('label/', ArticleLabelView.as_view()),
    path('series/', ArticleSeriesView.as_view()),
    path('series/list/', ArticleSeriesListView.as_view()),
    path('series/list/<str:order_type>/', ArticleSeriesListView.as_view()),
    path('detail/', TemplateView.as_view(template_name="article/article_detail.html")),
    path('detail/<int:id>/', ArticleView.as_view()),
]
