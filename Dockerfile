# 从仓库拉取 带有 python 3.6 的 Linux 环境
FROM python:3.6

# 设置 python 环境变量
ENV PYTHONUNBUFFERED 1

# 创建文件夹并将其设置为工作目录
RUN mkdir /xsite
WORKDIR /xsite
# 更新 pip
RUN pip install pip -U -i http://mirrors.aliyun.com/pypi/simple/
# 将 requirements.txt 复制到容器的工作目录
ADD requirements.txt /xsite
# 安装库
RUN pip install -r requirements.txt -i http://mirrors.aliyun.com/pypi/simple/
# 将当前目录复制到容器的工作目录
ADD . /xsite/