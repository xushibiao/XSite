本章集中介绍四个重要的小功能：回到顶部浮动按钮、矢量图标、页脚沉底和粘性侧边栏。  
这几个功能与Django基本没啥关系，更多的是前端知识，但是对博客网站都很重要，问的读者也比较多，因此也集中讲一下好了。  
## 简介
> - 这是我写的博客网站
> - 1111
> - 2222
## Markdown功能测试 
## 文本加粗 
__我是不是很粗__
## 文本斜体 
_我是不是很斜_
## 代码显示 
```python
class ArticlePost(models.Model):
    # on_delete=models.CASCADE 删除关联表数据时,与之关联的数据也删除
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='文章作者')
    title = models.CharField(max_length=100, verbose_name='文章标题')
    body = models.TextField(verbose_name='文章正文')
    created = models.DateTimeField(auto_now_add=True, verbose_name='文章创建时间')
    updated = models.DateTimeField(auto_now=True, verbose_name='文章修改时间')

    class Meta:
        # 指定此模型返回数据以created字段倒序排列
        ordering = ('-created',)

    def __str__(self):
        return self.title
```