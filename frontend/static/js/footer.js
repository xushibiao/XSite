var footer = new Vue({
	el: '#footer',
	
	data: {
		footerimgshow: false,
	},
	
	created: function(){
		__this = this
		setTimeout(function(){
			__this.footerimgshow = true
		}, 5000)
	}
})