// 设置axios访问基础路径
// axios.defaults.baseURL = "http://127.0.0.1:8000/";
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
		}
		
		return{
			// 顶部图片集
			imgsHeader:[
				"/frontend/static/img/yx1.jpg","/frontend/static/img/yx2.jpg",
				"/frontend/static/img/yx3.jpg","/frontend/static/img/yx4.jpg",
				"/frontend/static/img/yx5.jpg","/frontend/static/img/yx6.jpg",
			],
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
				name: ''
			},
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
		// 顶部图片集索引
		indexImg:function(){
			return parseInt(Math.random()*this.imgsHeader.length)
		}, 
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
		change: function(){
			console.log("........."+this.article.series);
		},
		// 延时函数
		debounce: function(fn, delay){
			console.log(1111111)
			clearTimeout(this.timer)
			this.timer = setTimeout(function () {
				fn()
			}, delay)
		},
		// 获取所有标签，并渲染页面
		getAllLabels: function(){
			that = this;
			axios.get('/article/label/')
				.then(function(result){
					that.all_labels = result.data.all_labels;
				})
				.catch(function(error){
					
				})
		},
		// 获取所有系列，并渲染页面
		getAllSeries: function(){
			that = this;
			axios.get('/article/series/')
				.then(function(result){
					that.all_series = result.data.all_series;
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
			var that = this;
			this.$refs['label'].validate((valid) => {
				if(valid){
					config = {
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						}
					}
					axios.post("/article/label/", "name="+that.label.name, config)
						.then(function(result){
							if(result.data.message === 'success'){
								that.all_labels.push(result.data.label);
								that.loadingStatus = false;
								that.addlabel_model = false;
								that.$Message.success("提交成功!")
							}else{
								that.loadingStatus = false;
								that.$Message.error("提交失败!")
							}
						})
						.catch(function(result){
							
						})
				}else{
					that.loadingStatus = false;
				}
			})
		 
		},
		// 发送请求验证系列名称的唯一性
		uniqueSeries: function(){
			console.log(2222)
			var that = this
			axios.get("/article/series/?name="+this.series.name)
				.then(function(result){
					if (result.data === "yes"){
						that.seriesUniqueFlag = true
					}else{
						that.seriesUniqueFlag = false
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
			var that = this;
			this.$refs['series'].validate((valid) => {
				if(valid){
					config = {
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						}
					}
					axios.post("/article/series/", "name="+that.series.name, config)
						.then(function(result){
							if(result.data.message === 'success'){
								that.all_series.push(result.data.series);
								that.loadingStatus = false;
								that.addseries_model = false;
								that.$Message.success("提交成功!")
							}else{
								that.loadingStatus = false;
								that.$Message.error("提交失败!")
							}
						})
						.catch(function(result){
							
						})
				}else{
					that.loadingStatus = false;
				}
			})
		 
		},
		
		// 文件上传之前的操作，返回false可暂停文件上传
		handleUpload: function(file){
			this.article.content = file;
			console.log("content:"+this.article.content.name);
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
					var config = {
						headers: {
							'Content-Type': 'multipart/form-data'
						}
					};
					var that = this;
					axios.post('/article/', article_formdata, config)
						.then(function(result){
							that.loadingStatus = false;
							if(result.data === 'success'){
								that.$Message.success('提交成功！');
							}else{
								that.$Message.error('提交失败！');
								console.log(result);
							}
						})
						.catch(function(error){
							that.loadingStatus = false;
						})
				}else{
					this.loadingStatus = false;
				}
			});
		}
		
	}
})