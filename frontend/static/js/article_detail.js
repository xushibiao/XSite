var router = new VueRouter({
	mode: 'history',
	routes: [{
		path: '/article/detail/',
		name: '/detail'
	}]
})

// 设置axios访问基础路径
// axios.defaults.baseURL = "http://127.0.0.1:8000";

// 引入富文本编辑器
var E = window.wangEditor

var detail = new Vue({
	el: "#detail",
	
	data: {
		bodyMinHeight: window.innerHeight-76-102,
		csrftoken: null,
		id: null,
		title: '',
		summary: '',
		content: '',
		create_datetime: '',
		read_num: 0,
		like_num: 0,
		series_id: null,
		series_name: null,
		labels: [],
		article_list: [],
		toc: '',
		comment_content: '',
		editor: null,
		editor_menu: [
				'head',  // 标题
				'bold',  // 粗体
				'fontSize',  // 字号
				'italic',  // 斜体
				'underline',  // 下划线
				'strikeThrough',  // 删除线
				'link',  // 插入链接
				'list',  // 列表
				'justify',  // 对齐方式
				'quote',  // 引用
				'emoticon',  // 表情
				'table',  // 表格
				'code',  // 插入代码
				'undo',  // 撤销
				'redo'  // 重复
		],
		sider_height: 'auto',
		comments: [],
		comment: {
			id: '',
			content: '',
			article: '',
			user: '',
			user__username: '',
			create_datetime: 'T',
			avatar: '',
		},
		comments_children: [],
		comment_child: {
			id: '',
			content: '',
			article: '',
			user: '',
			user__username: '',
			create_datetime: 'T',
			avatar: '',
			to_user: '',
			to_user_username: '',
			parent: '',
		},
	},
	
	computed: {
		loginStatus: function(){
			return header.loginStatus
		},
	},
	
	router: router,
	
	created: function(){
		this.id = this.$route.query.id
		this.article_detail(this.id)
	},
	
	mounted: function(){
		this.editor_init("editor")
		this.$nextTick(function() {
			this.goAnchor()
		})
	},
	
	beforeUpdate: function(){
		this.sider_height = this.$refs.toc.offsetHeight >= window.innerHeight || this.$refs.side_menu.offsetHeight >= window.innerHeight ? window.innerHeight+'px' : 'auto'
	},
	
	updated: function(){
		
		this.$nextTick(function() {
			// 手动更新active-name
			this.$refs.side_menu.updateActiveName()
		})
	},
	
	methods: {
		// 获取文章信息
		article_detail: function(id){
			if(this.title != '' && this.id == id){
				return 
			}
			this.id = id
			_this = this
			axios.get("/article/detail/"+id+"/")
			.then(function(response){
				data = response.data
				if(data.msg === "success"){
					_this.title = data.article.title
					_this.summary = data.article.summary
					_this.content = data.article.content
					_this.create_datetime = data.article.create_datetime
					_this.read_num = data.article.read_num
					_this.like_num = data.article.like_num
					_this.series_id = data.article.series_id
					_this.series_name = data.article.series__name
					_this.labels = data.article.labels
					_this.toc = data.article.toc
					_this.cur_article_list()	//每次都调用可以刷新侧边栏高度，保证侧边栏高度及滚动正常
					_this.comment_list()
				}
			})
		},
		// 获取本系列文章列表
		cur_article_list: function(){
			_this = this
			axios.get("/article/list/series/"+this.series_id+"/")
				.then(function(response){
					data = response.data
					if(data.msg === "success"){
						_this.article_list = data.articleList
					}
				})
		},
		// 获取评论列表
		comment_list: function(){
			_this = this
			axios.get("/comment/?article_id="+this.id)
				.then(function(response){
					data = response.data
					if(data.msg == "success"){
						_this.comments = data.comments
						_this.comments_children = data.comments_children
						_this.$nextTick(function() {
							if(_this.comments.length > 0){
								_this.editor_init(_this.$refs["editor_p"])
								_this.editor_init(_this.$refs["editor_c"])
							}
						})
						
					}  
				})
		},
		// 初始化富文本编辑器
		editor_init: function(refs){
			if (refs == "editor"){
				var editor = new E(this.$refs.editor)
				editor.customConfig.menus = this.editor_menu	//设置菜单
				editor.customConfig.pasteIgnoreImg = true	// 忽略粘贴内容中的图片
				// 将第一个富文本编辑器的内容和comment_content绑定
				editor.customConfig.onchange = (html) => {
					this.comment_content = html
				}
				editor.create()
			}else{
				_this = this
				refs.forEach(function(_editor, index){
					var editor = new E(refs[index])
					editor.customConfig.menus = _this.editor_menu	//设置菜单
					editor.customConfig.pasteIgnoreImg = true	// 忽略粘贴内容中的图片
					editor.create()
				})
			}
		},
		// 提交评论
		commentSubmit: function(){
			if(header.user.id == null){
				this.$Message["warning"]("请先登录后再评论")
			}else if(this.$refs["editor"].lastChild.lastChild.innerText.trim() == ''){
				this.$Message["warning"]("评论内容不可为空")
			}else{
				article = this.id
				user = header.user.id
				content = this.comment_content
				comment_form = new FormData()
				comment_form.append('article', article)
				comment_form.append('user', user)
				comment_form.append('content', content)
				this.getcsrftoken()
				var config = {
					headers: {'X-CSRFToken': this.csrftoken}
				};
				_this = this
				axios.post("/comment/", comment_form, config)
					.then(function(response){
						data = response.data
						if(data.msg == "success"){
							_this.comments.push(data.comment)
							_this.$Message["success"]("发表评论成功")
						}else if(data.msg == "error"){
							_this.$Message["error"](data.error)
						}
					})
			}
		},
		// 评论回复框展开或收起
		reply_toggle: function(comment_editor_id){
			comment_editor = document.querySelector('#'+comment_editor_id)
			display = document.querySelector('#'+comment_editor_id).style.display
			if(display == "none"){
				comment_editor.style.display = "block"
			}else{
				comment_editor.style.display = "none"
			}
		},
		// 回复评论
		replySubmit: function(index, parent, to_user, type){
			if(header.user.id == null){
				this.$Message["warning"]("请先登录后再评论")
			}else if(this.$refs["editor_"+type][index].lastChild.lastChild.innerText.trim() == ''){
				this.$Message["warning"]("评论内容不可为空")
			}else{
				article = this.id
				user = header.user.id
				content = this.$refs["editor_"+type][index].lastChild.lastChild.innerHTML
				comment_form = new FormData()
				comment_form.append('article', article)
				comment_form.append('user', user)
				comment_form.append('content', content)
				comment_form.append('parent', parent)
				comment_form.append('to_user', to_user)
				this.getcsrftoken()
				var config = {
					headers: {'X-CSRFToken': this.csrftoken}
				};
				_this = this
				axios.post("/comment/", comment_form, config)
					.then(function(response){
						data = response.data
						if(data.msg == "success"){
							_this.comments_children.push(data.comment)
							_this.$Message["success"]("回复评论成功")
						}else if(data.msg == "error"){
							_this.$Message["error"](data.error)
						}
					})
			}
		},
		// 获取URL中锚点信息，并跳转
		goAnchor: function(){
			anchor = window.location.hash
			if(anchor != ""){
				_this = this
				setTimeout(function(){
					_this.$el.querySelector(anchor).scrollIntoView()
				},500)
			}
		},
		/* 弹出登录框 */
		showLoginModal: function(){
			header.loginModal = true
		},
		/* 取得csrftoken */
		getcsrftoken: function(){
			var cookies = document.cookie.split(';')
			if(cookies.length > 0){
				that = this
				cookies.forEach(function(cookie){
					cookie_kv = cookie.split('=')
					if(cookie_kv[0].trim() == "csrftoken"){
						that.csrftoken = cookie_kv[1]
						return false
					}
				})
			}
		},
	}
})