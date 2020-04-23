var router = new VueRouter({
	mode: 'history',
	routes: [{
		path: '/article/detail/',
		name: '/detail'
	}]
})

/* Vue.component('article-card', {
	template: '#article-card',
	props: ['id', 'title', 'summary', 'create_datetime', 'read_num', 'like_num', 'comment_num', 'series_id', 'labels', 'series'],
	methods: {
		
	},
}) */

// 设置axios访问基础路径
axios.defaults.baseURL = "http://127.0.0.1:8000";

var article_list = new Vue({
	el: '#article_list',
	data: {
		bodyMinHeight: window.innerHeight-76-102,
		//最新为true，最热为false
		latestorhot: true,
		//文章列表
		articleList: [],
		article: {
			id: null,
			title: null,
			summary: null,
			create_datetime: null,
			read_num: null,
			like_num: null,
			series_id: null,
			comment_num: null
		},
		//根据文章ids获取的标签
		labels: [],
		label: {
			id: null,
			name: null,
			article_id: null
		},
		//根据文章ids获取的系列
		series: [],
		aseries: {
			id: null,
			name: null,
		},
		//分页：当前页码
		currentPage: 1,
		//分页：总条数
		totalCount: null,
		//分页：每页条数
		perPage: 10,
		// 查询条件：系列ID
		query_series_id: null,
		// 查询条件：标签ID
		query_label_id: null,
		// 文章列表提示内容
		articleListTip: null,
	},
	
	created: function(){
		this.query_series_id = this.$route.query.series_id
		this.latestArticleList(1)
	},
	
	router: router,

	methods: {
		// 获取文章列表分页数据
		latestArticleList: function(currentPage) {
			if(this.query_series_id != null){
				href = "/article/list/latest/series/"+this.query_series_id+"/?currentPage="+currentPage+"&perPage="+this.perPage
			}
			else if(this.query_label_id != null){
				href = "/article/list/latest/label/"+this.query_label_id+"/?currentPage="+currentPage+"&perPage="+this.perPage
			}
			else{
				href = "/article/list/latest/?currentPage="+currentPage+"&perPage="+this.perPage
			}
			var _this = this
			axios.get(href)
				.then(function(response) {
					data = response.data
					if (data.msg === "success") {
						_this.articleList = data.articleList
						_this.totalCount = data.totalCount
						_this.labelsByIds()
						_this.seriesByIds()
					}
				})
		},
		// 根据文章ids获取标签
		labelsByIds: function(){
			var _this = this
			articleIds = this.articleList.map(function(elem, index){
				return elem.id
			}).join(',')
			axios.get("/article/label/?articleIds="+articleIds)
				.then(function(response){
					if(response.data.msg === "success"){
						_this.labels = response.data.labels
					}
				})
		},
		// 根据文章系列ids获取系列
		seriesByIds: function(){
			var _this = this
			arr = this.articleList.map(function(elem, index){
				return elem.series_id
			})
			new_arr = []
			for(var i=0; i<arr.length; i++){
				if(arr[i] != null && new_arr.indexOf(arr[i]) === -1){
					new_arr.push(arr[i])
				}
			}
			seriesIds = new_arr.join(',')
			axios.get("/article/series/?seriesIds="+seriesIds)
				.then(function(response){
					if(response.data.msg === "success"){
						_this.series = response.data.series
					}
				})
		},
		// 根据系列ID获取文章列表
		articleListBySeries: function(series_id, name){
			this.query_series_id = series_id
			this.query_label_id = null
			this.latestArticleList(1)
			this.articleListTip = "“"+name+"”系列文章如下："
		},
		// 根据标签ID获取文章列表
		articleListByLabel: function(label_id, name){
			this.query_label_id = label_id
			this.query_series_id = null
			this.latestArticleList(1)
			this.articleListTip = "“"+name+"”标签相关文章如下："
		},
		// 跳转文章详情页面
		article_detail: function(article_id) {
			var detail = this.$router.resolve({
				name: "/detail",
				query: {id: article_id}
			})
			window.open(detail.href, '_blank')
		}
	},
})
