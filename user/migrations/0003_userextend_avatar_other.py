# Generated by Django 3.0.4 on 2020-04-10 02:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0002_auto_20200402_1813'),
    ]

    operations = [
        migrations.AddField(
            model_name='userextend',
            name='avatar_other',
            field=models.CharField(blank=True, default='', max_length=256, verbose_name='第三方头像地址'),
        ),
    ]
