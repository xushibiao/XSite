# 创建客户端列表，存储所有在线客户端
clients = {}


def save(user_id, websocket):
    """
    将websocket连接保存到clients中
    页面刷新会生成新的websocket对象，先删去原有的再添加
    :param user_id: 用户ID
    :param websocket: websocket对象
    :return: None
    """
    user_id = str(user_id)
    delete(user_id)
    clients["user"+user_id] = websocket


def send(to_user_id, msg):
    """
    发送消息给指定用户
    :param msg: 消息内容，json格式的字符串
    :param to_user_id:
    :return:
    """
    to_user_id = str(to_user_id)
    if "user"+to_user_id in clients.keys():
        clients["user"+to_user_id].send(msg)


def delete(user_id):
    """
    删除clients中的连接
    :param user_id:
    :return:
    """
    user_id = str(user_id)
    if "user"+user_id in clients.keys():
        clients["user" + user_id].close()
        del(clients["user"+user_id])