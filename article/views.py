from django.contrib.auth.decorators import permission_required, login_required
from django.forms import model_to_dict
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, redirect
from django.utils.decorators import method_decorator

from article.method import label_method, article_method
from article.method import series_method
from django.views import View
# Create your views here.


# 文章视图
class ArticleView(View):
    def get(self, request, id):
        # 返回文章基本信息，以及文章对应的标签和系列信息
        article = article_method.article_by_id(id)
        if article == 0:
            return JsonResponse({"msg": "error"})
        article_method.read_num_increase(id)
        labels = label_method.labels_by_article_ids(str(id))
        if labels == 0:
            article["labels"] = []
        article["labels"] = labels
        data = {"msg": "success", "article": article}
        return JsonResponse(data)

    @method_decorator(login_required(login_url='/'))
    @method_decorator(permission_required('article.add_article', raise_exception=True))
    def post(self, request):
        # 添加文章
        result = article_method.add_article(request.POST, request.FILES)
        if not result:
            return HttpResponse("error")
        return HttpResponse("success")


class AddArticleView(View):
    @method_decorator(login_required(login_url='/'))
    @method_decorator(permission_required('article.add_article', raise_exception=True))
    def get(self, request):
        # 返回add_article.html页面
        return render(request, template_name='article/add_article.html')


# 文章列表视图
class ArticleListView(View):
    def get(self, request, **kwargs):
        order_type = kwargs.get('order_type')
        series_id = kwargs.get('series_id')
        label_id = kwargs.get('label_id')
        getDict = request.GET
        if order_type == "latest3":
            # 返回最新3篇文章
            return JsonResponse({"msg": "success", "articleList": article_method.latest_3_articles()})
        elif order_type == "latest":
            # 返回最新分页文章列表，根据有无系列ID返回结果
            page_flag = {"currentPage", "perPage"}.issubset(set(getDict.keys()))
            if not page_flag:
                return JsonResponse({"msg": "error"})
            if series_id is not None:
                articleList, totalCount = article_method.article_page(getDict["currentPage"], getDict["perPage"],
                                                                      series=series_id)
                return JsonResponse({"msg": "success", "articleList": articleList, "totalCount": totalCount})
            if label_id is not None:
                articleList, totalCount = article_method.article_page(getDict["currentPage"], getDict["perPage"],
                                                                      label=label_id)
                return JsonResponse({"msg": "success", "articleList": articleList, "totalCount": totalCount})
            articleList, totalCount = article_method.article_page(getDict["currentPage"], getDict["perPage"])
            return JsonResponse({"msg": "success", "articleList": articleList, "totalCount": totalCount})
        elif order_type is None and series_id is not None:
            # 返回无特殊排序规则的文章列表
            return JsonResponse({"msg": "success", "articleList": article_method.articles_by_series(series_id)})
        elif order_type is None and series_id is None:
            # 返回文章列表页面
            return render(request, "article/article_list.html")
        else:
            return JsonResponse({"msg": "error"})


# 文章标签相关操作
class ArticleLabelView(View):
    def get(self, request):
        data = {}
        if 'articleIds' in request.GET.keys():
            # 根据文章IDs查询标签，并添加上article_id信息
            articleIds = request.GET['articleIds']
            labels = label_method.labels_by_article_ids(articleIds)
            if labels == 0:
                return JsonResponse({"msg": "error"})
            data = {"msg": "success", "labels": labels}
        else:
            # 查询所有标签
            data = {"msg": "success", "all_labels": label_method.labels_all()}
        return JsonResponse(data)

    @method_decorator(login_required(login_url='/'))
    @method_decorator(permission_required('label.add_label', raise_exception=True))
    def post(self, request):
        # 添加标签
        label = label_method.add_label(request.POST)
        if not label:
            return JsonResponse({"msg": "error"})
        data = {"label": model_to_dict(label), "message": "success"}
        return JsonResponse(data)


# 文章系列相关操作
class ArticleSeriesView(View):
    def get(self, request):
        data = {}
        if "name" in request.GET.keys():
            # 根据名称判断该系列是否存在
            series_name = request.GET["name"]
            result = series_method.exist_by_name(series_name)
            if result:
                return HttpResponse("no")
            return HttpResponse("yes")
        elif 'seriesIds' in request.GET.keys():
            # 根据文章系列ids获取文章系列
            series_ids = request.GET['seriesIds']
            series = series_method.series_by_ids(series_ids)
            if series == 0:
                return JsonResponse({"msg": "error"})
            data = {"msg": "success", "series": series}
        elif "article_id" in request.GET.keys():
            article_id = request.GET["article_id"]
            series = series_method.series_by_article_id(article_id)
            if len(series) == 0:
                return JsonResponse({"msg": "error"})
            data = {"msg": "success", "series": series[0]}
        else:
            # 返回所有系列
            data = {"all_series": series_method.series_all()}
        return JsonResponse(data)

    @method_decorator(login_required(login_url='/'))
    @method_decorator(permission_required('series.add_series', raise_exception=True))
    def post(self, request):
        # 添加文章系列
        series = series_method.add_series(request.POST)
        if not series:
            return JsonResponse({"msg": "error"})
        data = {"series": model_to_dict(series), "message": "success"}
        return JsonResponse(data)


class ArticleSeriesListView(View):
    def get(self, request, **kwargs):
        """
        系列列表获取视图，专为article_series.html页面所用
        无参时返回article_series.html页面
        存在current_page和per_page参数时，返回系列分页列表
        :param request:
        :return:
        """
        order_type = kwargs.get("order_type")
        if order_type == "latest3":
            return JsonResponse({"msg": "success", "series_list": series_method.latest_3_series()})
        elif order_type is None:
            if {'current_page', 'per_page'}.issubset(request.GET.keys()):
                total_count, series_list = series_method.series_page(request.GET["current_page"],
                                                                     request.GET["per_page"])
                return JsonResponse({"msg": "success", "total_count": total_count, "series_list": series_list})
            else:
                # 无参时返回页面
                return render(request, template_name='article/article_series.html')
        else:
            return JsonResponse({"msg": "error"})