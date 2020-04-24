Vue.component('article-card',{
	props: ['id', 'title', 'summary', 'create_datetime', 'read_num', 'like_num', 'comment_num', 'labels'],
	template: '#article-card',
	methods: {
		
	}
})
Vue.component('series-card',{
	props: ['id', 'name', 'bgi_url', 'article_num'],
	template: '#series-card',
})
// 设置axios访问基础路径
// axios.defaults.baseURL = "http://127.0.0.1:8000";
var index = new Vue({
	el: "#index",
	data() {
		return {
			bodyMinHeight: window.innerHeight-342-102,
			//格言数组
			mottos: [],
			//格言接口page参数
			mottoPage: parseInt(Math.random() * 550 + 1, 10),
			//格言数组索引
			indexMottos: 0,
			//格言内容索引（每条格言中包含作者和内容两个属性）
			indexMottoList: 0,
			//最新文章数组
			latestArticles: [],
			// 系列专题
			latestSeries: [],
			//根据文章IDs获取的标签
			labels: [],
		}
	},

	created: function() {
		this.getMotto()
		this.getLatestArticle()
		this.getLatestSeries()
	},
	
	updated: function(){
		this.$nextTick(function(){
			this.autoSize()
		})
	},
	
	methods: {
		//判断格言长度，大于100时重新加载
		mottoContent: function(){
			this.indexMottos = parseInt(Math.random() * this.mottos.length, 10)
			this.indexMottoList = parseInt(Math.random() * this.mottos[this.indexMottos].mottoList.length, 10)
			if(this.mottos[this.indexMottos].mottoList[this.indexMottoList].length > 100){
				this.mottoContent()
			}
		},
		//请求格言接口，定时更换格言内容
		getMotto: function() {
			var _this = this;
			axios.get(
					"http://route.showapi.com/1646-1?showapi_appid=134679&showapi_sign=a42f32c14de543dd8eec9c149e078ba8&page=" +
					this.mottoPage)
				.then(function(response) {
					_this.mottos = response.data.showapi_res_body.result.contentlist;
					setInterval(function() {
						_this.mottoContent()

					}, 8000)
				}).catch(function(error) {

				})
		},
		
		//请求最新文章
		getLatestArticle: function(){
			var _this = this
			axios.get("/article/list/latest3/")
				.then(function(response){
					_this.latestArticles = response.data.articleList
					_this.getLabels()
				}).catch(function(error) {

				})
		},
		
		//请求最新文章的所有标签
		getLabels: function(){
			var _this = this
			var articleIds = this.latestArticles[0].id + ',' + this.latestArticles[1].id + ',' + this.latestArticles[2].id
			axios.get("/article/label/?articleIds=" + articleIds)
				.then(function(response){
					if(response.data.msg === "success"){
						_this.labels = response.data.labels
					}
				})
		},
		
		//转到文章列表页面
		article_list: function(){
			window.location.href="/article/list/"
		},
		// 跳转文章详情页面
		toArticle: function(id){
			window.location.href="/article/detail/?id="+id
		},
		// 跳转系列专题页面
		series_list: function(){
			window.location.href="/article/series/list/"
		},
		// 取得最新系列专题
		getLatestSeries: function(){
			var _this = this
			axios.get("/article/series/list/latest3/")
				.then(function(response){
					data = response.data
					if(data.msg == "success"){
						_this.latestSeries = data.series_list
					}
				})
		},
		/* 系列名字体大小自适应 */
		autoSize: function(){
			spans = document.querySelectorAll('.autosize')
			if(spans.length > 0){
				spans.forEach(function(span){
					span.style.fontSize = '12px'
					for (var i = 12; i < 40; i++) {
							if (span.offsetHeight > 140) {
									//当容器高度大于最大高度的时候，上一个尝试的值就是最佳大小。
									span.style.fontSize = i-2 + 'px'
									//结束循环
									break;
							} else {
									//如果小于最大高度，文字大小加1继续尝试
									span.style.fontSize = i + 'px'
							}
					}
				})
			}
		},
		// 跳转系列文章列表
		articleListBySeries: function(series_id){
			window.location.href = "/article/list/?series_id="+series_id
		},
	}
})
