'use strict';

var Utility = (function () {
	var flash = {
		el: $('#flash'),
		title: $('#flash-title'),
		message: $('#flash-message'),
		start: function (message,title,type) {
			this.message.text(message);
			this.title.text(title);
			this.el.addClass('alert-' + type);
			this.el.fadeIn('fast').delay(5000).fadeOut('fast');
			this.el.addClass('alert-' + type);
		}
	};

	function addEvent(element, evnt, funct) {
		if (element.attachEvent) { return element.attachEvent('on' + evnt, funct); }
		else { return element.addEventListener(evnt, funct, false); }
	}

	return {
		addEvent: addEvent,
		flash: flash
	};
})();

var Options = (function () {
	var clear = document.getElementById('clearGifs'),
			flash = Utility.flash;

	// clear all gifs in local storage
	function clearGifs () {
		localStorage.removeItem('gifs');
		flash.start('All gifs have been cleared. :)','Poof!','success');
	}
	
	// initial options setup
	function init(){
		Utility.addEvent(clear, 'click', clearGifs);
	}
	
	return {
		init: init
	};
})();

window.onload = Options.init();