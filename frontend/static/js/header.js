// 设置axios访问基础路径
// axios.defaults.baseURL = "http://127.0.0.1:8000";
var header = new Vue({
	el: '#header',
	data() {
		const usernameValidator = (rule, value, callback) => {
			axios.get("/user/register/?username="+value)
				.then(function(response){
					result = response.data
					if(result === 'no'){
						callback(new Error('当前用户名已存在'))
					}else{
						callback()
					}
				})
		};
		const passwordValidator = (rule, value, callback) => {
			if(value != this.userForm.password){
				callback(new Error('两次输入密码不一致'))
			}else{
				callback()
			}
		};
		const avatarValidator = (rule, value, callback) => {
			if(this.userForm.avatar != null){
				name = this.userForm.avatar.name;
				size = this.userForm.avatar.size;
				if(!name.toLowerCase().endsWith('jpg') && !name.toLowerCase().endsWith('png')){
					callback(new Error('请上传jpg或png格式的图片'))
				}else if(size > 102400){
					callback(new Error('请上传大小不超过100KB的图片'))
				}else{
					callback()
				}
			}else{
				callback()
			}
		};
		return {
			/* 首页顶部图片集 */
			imgsHeader: [
				"/frontend/static/img/yx1.jpg", "/frontend/static/img/yx2.jpg",
				"/frontend/static/img/yx3.jpg", "/frontend/static/img/yx4.jpg",
				"/frontend/static/img/yx5.jpg", "/frontend/static/img/yx6.jpg",
			],
			/* 首页顶部图片集索引 */
			indexImg: 0,
			loginModal: false,
			avatarModal: false,
			messageModal: false,
			csrftoken: null,
			/* 用户对象 */
			user:{
				id: null,
				username: null,
				avatar: null,
				is_superuser: null
			},
			/* 用户表单对象 */
			userForm:{
				username: '',
				password: '',
				password2: '',
				avatar: null,
			},
			/* 临时头像地址（根据选中的图片生成） */
			avatarURL: '',
			/* 登录状态 */
			loginStatus: false,
			/* 用户未读消息 */
			messages: [],
			message: {
				id: null,
				article: null,
				article__title: null,
				user: null,
				user__username: null,
				to_user: null,
				to_user__username: null,
				create_datetime: null,
			},
			/* websocket连接对象 */
			websocket: null,
			loadingStatus: false,
			ruleUser: {
				username: [
					{required: true, message: '用户名不能为空', trigger: 'blur'},
					{type: 'string', max: 150, message: '用户名不超过150个字符', trigger: 'blur'},
					{pattern: /^[\u4e00-\u9fa5,\w,@.+-]*$/, message: '用户名只能包含：汉字、英文字母、数字和@.+-_以上字符', trigger: 'blur'},
					{validator: usernameValidator, trigger: 'blur'},
				],
				password: [
					{required: true, message: '密码不能为空', trigger: 'blur'},
					{type: 'string', max: 128, message: '密码不超过128个字符', trigger: 'blur'},
				],
				password2: [
					{required: true, message: '请确认密码', trigger: 'blur'},
					{validator: passwordValidator, trigger: 'blur'},
				],
				avatar: [
					{validator: avatarValidator, trigger: 'change'}
				]
			},
			ruleUserLogin: {
				username:[
					{required: true, message: '用户名不能为空', trigger: 'blur'},
					{type: 'string', max: 150, message: '用户名不超过150个字符', trigger: 'blur'},
					{pattern: /^[\u4e00-\u9fa5,\w,@.+-]*$/, message: '用户名只能包含：汉字、英文字母、数字和@.+-_以上字符', trigger: 'blur'},
				],
				password: [
					{required: true, message: '密码不能为空', trigger: 'blur'},
					{type: 'string', max: 128, message: '密码不超过128个字符', trigger: 'blur'},
				],
			},
			ruleEditAvatar: {
				avatar: [
					{required: true, validator: avatarValidator, trigger: 'change'}
				]
			},
		}
		
	},
	
	created: function(){
			this.getUser();
			this.getcsrftoken()
	},
	
	mounted: function() {
		this.swImgs();
	},
	
	methods: {
		/* 获取用户名称和头像信息 */
		getUser: function(){
			that = this
			axios.get("/user/?type=logged")
				.then(function(response){
					data = response.data
					if(data.msg === "success"){
						that.loginStatus = true
						that.user = data.user
						that.websocketConnect(that.user.id)
						that.getMessages()
					}
				})
		},
		/* 定时切换首页顶部图片 */
		swImgs: function() {
			var that = this;
			setInterval(function() {
				if (that.indexImg == that.imgsHeader.length - 1) {
					that.indexImg = 0;
				} else {
					that.indexImg++;
				}
			}, 8000)
		},
	
		/* 头像下拉框点击 */
		dropdownClick: function(name) {
			switch(name){
				case 'add_article':
					window.location.href = "/article/addArticle/"
					break;
				case 'login_register':
					this.loginModal = true
					break
				case 'change_avatar':
					this.avatarModal = true
					break
				case 'message':
					this.messageModal = true
					break
				case 'logout':
					this.logout()
					break
			}
		},
		/* 提交当前URL地址到服务器，用于第三方登录成功后的跳转 */
		saveUrl: function(){
			href = window.location.href
			// protocalhost = window.location.protocol + "//" + window.location.host
			// url = href.substring(protocalhost.length, href.length)
			headers = {'X-CSRFToken': this.csrftoken}
			axios.post("/user/login/github/?redirect_url="+href, '', {headers: headers})
		},
		/* 提交用户登录表单 */
		userLogin: function(){
			this.loadingStatus = true;
			this.$refs['userLoginForm'].validate((valid) => {
				if (valid) {
					var user_formdata = new FormData();
					user_formdata.append('username', this.userForm.username);
					user_formdata.append('password', this.userForm.password);
					headers = {'X-CSRFToken': this.csrftoken}
					var that = this;
					axios.post("/user/login/", user_formdata, {headers: headers})
						.then(function(response){
							that.loadingStatus = false;
							data = response.data;
							if(data.msg === "success"){
								that.loginStatus = true
								that.user = data.user
								that.getMessages()
								that.websocketConnect(that.user.id)	// 建立websocket连接
								that.$Message.success('登录成功');
								that.loginModal = false;
							}else if(data.msg === "error"){
								that.$Message.error("用户名或密码错误");
							}
						}).catch(function(error){
							that.loadingStatus = false;
						})
				}
				this.loadingStatus = false;
			})
		},
		/* 选中文件之后的操作
			将选中的图片显示在页面中
			返回false可停止文件自动上传 */
		handleUpload: function(img){
			this.userForm.avatar = img;
			windowURL = window.URL || window.webkitURL;
			this.avatarURL = windowURL.createObjectURL(img)
			this.$refs['user'].validate(() => {});
			return false;
		},
		/* 修改头像对话框中选中图片之后的操作 */
		handleAvatarUpload: function(img){
			this.userForm.avatar = img;
			windowURL = window.URL || window.webkitURL;
			this.avatarURL = windowURL.createObjectURL(img)
			this.$refs['editAvatar'].validate(() => {});
			return false;
		},
		/* 提交注册表单 */
		handleSubmit (name) {
			this.loadingStatus = true;
			this.$refs[name].validate((valid) => {
					console.log(valid)
				if (valid) {
					var user_formdata = new FormData();
					user_formdata.append('username', this.userForm.username);
					user_formdata.append('password', this.userForm.password);
					user_formdata.append('avatar', this.userForm.avatar);
					var config = {
						headers: {
							'Content-Type': 'multipart/form-data',
							'X-CSRFToken': this.csrftoken
						}
					};
					var that = this;
					axios.post("/user/register/", user_formdata, config)
						.then(function(response){
							that.loadingStatus = false;
							data = response.data;
							if(data.msg === "success"){
								that.loginStatus = true
								that.user = data.user
								that.getMessages()	// 获取用户未读消息
								that.websocketConnect(that.user.id)	// 建立websocket连接
								that.$Message.success('注册成功');
								that.loginModal = false;
							}else if(data.msg === "error"){
								errors = data.errors
								for(var key in errors){
									that.$Message.error(key+":"+errors[key]);
								}
							}
						}).catch(function(error){
							that.loadingStatus = false;
						})
				} 
				this.loadingStatus = false;
			})
		},
		/* 重置注册表单 */
		handleReset (name) {
			this.$refs[name].resetFields();
		},
		/* 获取用户未读消息 */
		getMessages: function(){
			if(this.loginStatus == true){
				that = this
				axios.get("/user/message/")
					.then(function(response){
						data = response.data
						if(data.msg == "success"){
							that.messages = data.messages
						}
					})
			}
		},
		/* 修改头像 */
		handleAvatarSubmit: function(){
			this.loadingStatus = true;
			this.$refs['editAvatar'].validate((valid) => {
				if (valid) {
					var user_formdata = new FormData();
					user_formdata.append('id', this.user.id)
					user_formdata.append('avatar', this.userForm.avatar);
					var config = {
						headers: {
							'Content-Type': 'multipart/form-data',
							'X-CSRFToken': this.csrftoken
						}
					};
					var that = this;
					axios.post("/user/", user_formdata, config)
						.then(function(response){
							that.loadingStatus = false;
							data = response.data;
							if(data.msg === "success"){
								that.user.avatar = data.avatar
								that.$Message.success('修改成功');
								that.avatarModal = false;
							}else if(data.msg === "error"){
								that.$Message.error("修改失败");
							}
						}).catch(function(error){
							that.loadingStatus = false;
						})
				} 
				this.loadingStatus = false;
			})
		},
		/* 退出登录 */
		logout: function(){
			this.$Modal.confirm({
				title: '确定要退出登录？',
				onOk: () => {
						this.messages = []
						axios.get("/user/logout/")
						this.loginStatus = false
						this.user = {
							id: null,
							username: null,
							avatar: null,
							is_superuser: null
						}
				},
			})
		},
		/* 处理时间 */
		time_clean: function(datetime){
			var d = new Date()
			var Y = d.getFullYear()+''
			var M = d.getMonth()+1 < 10 ? '0'+(d.getMonth()+1) : d.getMonth()+1+''
			var D = d.getDate() < 10 ? '0'+d.getDate() : d.getDate()+''
			var cur_date = parseInt(Y+M+D)
			var date = parseInt(datetime.split('T')[0].replace(/-/g,''))
			var time = datetime.split('T')[1].substring(0,5)
			dateStr = Y==datetime.split('T')[0].substring(0,4) ? datetime.split('T')[0].substring(5)+' '+time : date+' '+time
			switch(cur_date-date){
				case 0:
					dateStr = '今天 '+time
					break
				case 1:
					dateStr = '昨天 '+time
					break
				default:
					dateStr = dateStr
			}
			return dateStr
		},
		/* 跳转文章详情页面，并标记该消息为已读 */
		toArticle: function(article_id, comment_id){
			this.messageModal = false
			var config = {
				headers: {'X-CSRFToken': this.csrftoken}
			};
			that = this
			axios.put("/comment/", {id: comment_id}, config)
				.then(function(response){
					data = response.data
					if(data.msg == "success"){
						that.getMessages()
					}
				})
			window.location.href = "/article/detail/?id="+article_id+"#comment_"+comment_id
		},
		/* 标记全部消息为已读 */
		setAllRead: function(){
			if(this.messages.length != 0){
				var config = {
					headers: {'X-CSRFToken': this.csrftoken}
				};
				that = this
				axios.put("/comment/", '', config)
					.then(function(response){
						data = response.data
						if(data.msg=="success"){
							that.messageModal = false
							that.messages = []
						}
					})
			}
		},
		/* websocket连接初始化 */
		websocketConnect: function(user_id){
			
			if("WebSocket" in window){
				href = "ws://"+baseIP+"/user/connect/"
				ws = new WebSocket(href)
				var heartCheck = {
			    timeout: 10000,        //30秒发一次心跳
			    timeoutObj: null,
			    serverTimeoutObj: null,
			    reset: function(){
			        clearTimeout(this.timeoutObj);
			        clearTimeout(this.serverTimeoutObj);
			        return this;
			    },
			    start: function(){
			        var self = this;
			        this.timeoutObj = setTimeout(function(){
			            ws.send("keepalive");
			            console.log("keepalive")
			            self.serverTimeoutObj = setTimeout(function(){
			                ws.close();     
			            }, self.timeout)
			        }, this.timeout)
			    }
				}
				that = this
				ws.onopen = function(){
					heartCheck.reset().start()
					console.log("websocket已连接")
					ws.send(user_id)
				}
				ws.onmessage = function(evt){
					msg = JSON.parse(evt.data)
					that.messageNotice(msg)
				}
				ws.onclose = function(){
					console.log("websocket已断开")
				}
				this.websocket = ws
			}else{
				
			}
		},
		/* 弹出消息弹窗 */
		messageNotice: function(msg){
			this.messages.unshift(msg)
			this.$Notice.info({
				title: '收到一条评论',
				desc: msg.user__username+" 在文章 "+msg.article__title+" 中评论了你，快去看看吧",
				duration: 10,
			})
		},
		/* 取得csrftoken */
		getcsrftoken: function(){
			var that = this
			axios.get("/user/csrftoken/")
				.then(function(response){
					data = response.data 
					if (data.msg == "success"){
						var cookies = document.cookie.split(';')
						if(cookies.length > 0){
							cookies.forEach(function(cookie){
								cookie_kv = cookie.split('=')
								if(cookie_kv[0].trim() == "csrftoken"){
									that.csrftoken = cookie_kv[1]
									return false
								}
							})
						}
					}
				})
		},
	}
})