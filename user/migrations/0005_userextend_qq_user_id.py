# Generated by Django 3.0.4 on 2020-05-03 02:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0004_userextend_github_user_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='userextend',
            name='qq_user_id',
            field=models.CharField(blank=True, max_length=64, verbose_name='qq用户ID'),
        ),
    ]
