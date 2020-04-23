// 设置axios访问基础路径
axios.defaults.baseURL = "http://127.0.0.1:8000";
var add_article = new Vue({
	el: '#add_article',
	delimiters: ['${', '}'],
	data(){
		// 文件校验器，于下方ruleValidate中使用
		const fileValidator = (rule, value, callback) => {
			if(this.article.content === null){
				 callback(new Error('请上传文件'));
			} else {
				size = this.article.content.size;
				name = this.article.content.name;
				if(!name.endsWith('.md') && !name.endsWith('.markdown')){
					 callback(new Error('请上传markdown类型的文件'));
				} else if(size > 10485760){
					 callback(new Error('请上传大小不超过10M的文件'));
				} else{
					 callback();
				}
			}
		};
		// 系列名称唯一性校验
		const uniqueSeriesValidator = (rule, value, callback) => {
			if (!this.seriesUniqueFlag){
				callback(new Error("系列名称已经存在"))
			} else{
				callback()
			}
		};
		
		return{
			csrftoken: null,
			//文章表单对象
			article:{
				title: '',
				summary: '',
				label: [],
				series: '',
				visible: '1',
				content: null
			},
			//用于存放所有标签
			all_labels: [],
			//用于存放所有系列
			all_series: [],
			// 标签对象
			label: {
				name: ''
			},
			// 系列对象
			series: {
				name: '',
				bgi_url: '/media/seriesbgi/seriesbgi001.jpg'
			},
			series_bgis: [
				'/media/seriesbgi/seriesbgi001.jpg', '/media/seriesbgi/seriesbgi002.jpg',
				'/media/seriesbgi/seriesbgi003.jpg', '/media/seriesbgi/seriesbgi004.jpg',
				'/media/seriesbgi/seriesbgi005.jpg', '/media/seriesbgi/seriesbgi006.jpg',
			],
			//文章表单验证规则
			ruleValidate:{
				title:[
					{required: true, message: '标题不能为空', trigger: 'blur'},
					{type: 'string', max: 200, message: '标题不能超过200个字符', trigger: 'blur'}
				],
				summary:[
					{required: true, message: '摘要不能为空', trigger: 'blur'},
					{type: 'string', max: 1000, message: '摘要不能超过1000个字符', trigger: 'blur'}
				],
				content:[
					{validator: fileValidator, trigger: 'change'}
				]
			},
			// 标签表单验证规则
			ruleLabel:{
				name:[
					{required: true, message: '标签名称不能为空', trigger: 'blur'},
					{type: 'string', max: 100, message: '标签名称不能超过100个字符', trigger: 'blur'},
				]
			},
			// 系列表单验证规则
			ruleSeries:{
				name:[
					{required: true, message: '系列名称不能为空', trigger: 'blur'},
					{type: 'string', max: 100, message: '系列名称不能超过100个字符', trigger: 'blur'},
					{validator: uniqueSeriesValidator, trigger: 'blur'},
				]
			},
			seriesUniqueFlag: true,
			// 添加标签对话框状态
			addlabel_model: false,
			// 添加系列对话框状态
			addseries_model: false,
			// 加载状态
			loadingStatus: false,
			// 定时函数,用于延时请求验证标签或系列名称唯一性
			timer: null
		}
	},
	
	computed: {
		seriesName: function(){
			return this.series.name
		},
	},
	
	mounted: function(){
		this.getAllLabels();
		this.getAllSeries();
	},
	
	watch: {
		seriesName: function(){
			this.debounce(this.uniqueSeries,1000)
		},
	},
	
	methods:{
		// 延时函数
		debounce: function(fn, delay){
			clearTimeout(this.timer)
			this.timer = setTimeout(function () {
				fn()
			}, delay)
		},
		// 获取所有标签，并渲染页面
		getAllLabels: function(){
			_this = this;
			axios.get('/article/label/')
				.then(function(result){
					_this.all_labels = result.data.all_labels;
				})
				.catch(function(error){
					
				})
		},
		// 获取所有系列，并渲染页面
		getAllSeries: function(){
			_this = this;
			axios.get('/article/series/')
				.then(function(result){
					_this.all_series = result.data.all_series;
				})
				.catch(function(error){
					
				})
		},
		/*
			弹出添加标签对话框
			发送添加标签请求
			接收返回值并渲染页面
		*/
		addLabel: function(){
			this.loadingStatus = true;
			var _this = this;
			this.$refs['label'].validate((valid) => {
				if(valid){
					this.getcsrftoken()
					config = {
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'X-CSRFToken': this.csrftoken
						}
					}
					axios.post("/article/label/", "name="+_this.label.name, config)
						.then(function(result){
							if(result.data.message === 'success'){
								_this.all_labels.push(result.data.label);
								_this.loadingStatus = false;
								_this.addlabel_model = false;
								_this.$Message.success("提交成功!")
							}else{
								_this.loadingStatus = false;
								_this.$Message.error("提交失败!")
							}
						})
						.catch(function(result){
							
						})
				}else{
					_this.loadingStatus = false;
				}
			})
		 
		},
		// 发送请求验证系列名称的唯一性
		uniqueSeries: function(){
			var _this = this
			axios.get("/article/series/?name="+this.series.name)
				.then(function(result){
					if (result.data === "yes"){
						_this.seriesUniqueFlag = true
					}else{
						_this.seriesUniqueFlag = false
					}
				})
				.catch(function(result){
					
				})
		},
		/*
			弹出添加系列对话框
			发送添加系列请求
			接收返回值并渲染页面
		*/
		addSeries: function(){
			this.loadingStatus = true;
			var _this = this;
			this.$refs['series'].validate((valid) => {
				if(valid){
					this.getcsrftoken()
					config = {
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded',
							'X-CSRFToken': this.csrftoken
						}
					}
					bgi_url = _this.series.bgi_url.substring(_this.series.bgi_url.indexOf('seriesbgi/'))
					
					axios.post("/article/series/", "name="+_this.series.name+"&bgi_url="+bgi_url, config)
						.then(function(result){
							if(result.data.message === 'success'){
								_this.all_series.push(result.data.series);
								_this.loadingStatus = false;
								_this.addseries_model = false;
								_this.$Message.success("提交成功!")
							}else{
								_this.loadingStatus = false;
								_this.$Message.error("提交失败!")
							}
						})
						.catch(function(result){
							
						})
				}else{
					_this.loadingStatus = false;
				}
			})
		 
		},
		
		// 选中文件之后的操作，返回false可停止文件自动上传
		handleUpload: function(file){
			this.article.content = file;
			this.$refs['article'].validate(() => {});
			return false;
		},
		
		// 处理表单提交请求
		handleSubmit: function(){
			this.loadingStatus = true;
			this.$refs['article'].validate((valid) => {
				if(valid){
					var article_formdata = new FormData();
					article_formdata.append('title', this.article.title);
					article_formdata.append('summary', this.article.summary);
					if(this.article.label.length != 0){
						article_formdata.append('label', this.article.label);
					}
					if(this.article.series !== ''){
						article_formdata.append('series', this.article.series);
					}
					article_formdata.append('visible', this.article.visible);
					article_formdata.append('content', this.article.content);
					this.getcsrftoken()
					var config = {
						headers: {
							'Content-Type': 'multipart/form-data',
							'X-CSRFToken': this.csrftoken
						}
					};
					var _this = this;
					axios.post('/article/', article_formdata, config)
						.then(function(result){
							_this.loadingStatus = false;
							if(result.data === 'success'){
								_this.$Message.success('提交成功！');
							}else{
								_this.$Message.error('提交失败！');
							}
						})
						.catch(function(error){
							_this.loadingStatus = false;
						})
				}else{
					this.loadingStatus = false;
				}
			});
		},
		/* 系列预览图字体大小自适应 */
		autoSize: function(){
			autosize = document.querySelector('#autosize')
			autosize.style.fontSize = '12px'
			for (var i = 12; i < 30; i++) {
					if (autosize.offsetHeight > 140) {
							//当容器高度大于最大高度的时候，上一个尝试的值就是最佳大小。
							autosize.style.fontSize = i-2 + 'px'
							break
					} else {
							//如果小于最大高度，文字大小加1继续尝试
							autosize.style.fontSize = i + 'px'
					}
			}
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