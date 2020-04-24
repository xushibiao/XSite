// 设置axios访问基础路径
// axios.defaults.baseURL = "http://127.0.0.1:8000";

var article_series = new Vue({
	el: '#article_series',
	
	data: {
		bodyMinHeight: window.innerHeight-76-102,
		series_list: [],
		series: {
			id: null,
			name: null,
			bgi_url: null,
			article_num: null
		},
		total_count: null,
		current_page: 1,
		per_page: 20,
		
	},
	
	created: function(){
		this.getSeriesList()
	},
	
	mounted: function(){
		
	},
	
	updated: function(){
		this.$nextTick(function(){
			this.autoSize()
		})
	},
	
	methods: {
		/* 获取系列列表 */
		getSeriesList: function(current_page){
			current_page = current_page ? current_page : this.current_page
			_this = this
			axios.get("/article/series/list/?current_page="+this.current_page+"&per_page="+this.per_page)
				.then(function(response){
					data = response.data
					if(data.msg == "success"){
						_this.series_list = data.series_list
						_this.total_count = data.total_count
					}
				})
		},
		/* 系列名字体大小自适应 */
		autoSize: function(){
			spans = document.querySelectorAll('.autosize')
			if(spans.length > 0){
				spans.forEach(function(span){
					span.style.fontSize = '12px'
					for (var i = 12; i < 30; i++) {
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
		/* 跳转文章列表页面 */
		toArticles: function(series_id){
			window.location.href="/article/list/?series_id="+series_id
		}
	}
})