# Generated by Django 3.0.4 on 2020-04-20 13:31

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('article', '0009_article_like_num'),
    ]

    operations = [
        migrations.AddField(
            model_name='articleseries',
            name='bgi_url',
            field=models.CharField(blank=True, max_length=200, verbose_name='背景图片URL'),
        ),
    ]
