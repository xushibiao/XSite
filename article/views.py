from django.forms import modelform_factory, model_to_dict
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render

# Create your views here.
from django.views import View
from django.views.decorators.csrf import csrf_exempt

from article.form import ArticleForm
from article.models import ArticleLabel, ArticleSeries


class ArticleView(View):
    def post(self, request):
        article_form = ArticleForm(request.POST, request.FILES)
        if not article_form.is_valid():
            print(article_form.errors.as_json().encode('utf8').decode('unicode_escape'))
            return HttpResponse(article_form.errors.as_json())
        article = article_form.save()
        if "label" in request.POST.keys():
            label_id = request.POST["label"].split(',')
            label = ArticleLabel.objects.filter(id__in=label_id)
            article.label.add(*label)
        return HttpResponse("success")


class ArticleLabelView(View):
    def get(self, request):
        data = {"all_labels": list(ArticleLabel.objects.values('id', 'name'))}
        return JsonResponse(data)

    def post(self, request):
        ArticleLabelForm = modelform_factory(ArticleLabel, fields=('name',))
        articlelabel_form = ArticleLabelForm(request.POST)
        if not articlelabel_form.is_valid():
            return HttpResponse(articlelabel_form.errors.as_json().encode('utf8').decode('unicode_escape'))
        new_articlelabel = articlelabel_form.save()
        data = {"label": model_to_dict(new_articlelabel), "message": "success"}
        return JsonResponse(data)


class ArticleSeriesView(View):
    def get(self, request):
        if "name" in request.GET.keys():
            series_name = request.GET["name"]
            if not ArticleSeries.objects.filter(name=series_name).exists():
                return HttpResponse("yes")
            return HttpResponse("no")
        else:
            data = {"all_series": list(ArticleSeries.objects.values('id', 'name'))}
            return JsonResponse(data)

    def post(self, request):
        ArticleSeriesForm = modelform_factory(ArticleSeries, fields=('name',))
        articleseries_form = ArticleSeriesForm(request.POST)
        if not articleseries_form.is_valid():
            return HttpResponse(articleseries_form.errors.as_json().encode('utf8').decode('unicode_escape'))
        new_articleseries = articleseries_form.save()
        data = {"series": model_to_dict(new_articleseries), "message": "success"}
        return JsonResponse(data)
