from django.shortcuts import render

# Create your views here.
from django.http import HttpResponseNotFound


def page_not_found(request, exception):
    return HttpResponseNotFound(template_name='404.html')