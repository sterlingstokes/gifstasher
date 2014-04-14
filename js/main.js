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
		},
		end: function () {
			this.el.hide();
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

var Menu = (function () {
	var clear = document.getElementById('clearGifs'),
			gifs = [],
			gifsToStore,
			el = document.getElementById('menu'),
			flash = Utility.flash,
			menuForm = document.getElementById('menu-form'),
			optionsBtn = document.getElementById('options-btn'),
			stash = $('#stash'),
			stashBtn = document.getElementById('stash-btn');
	
	// if gifs is in localStorage, get it out
	if (localStorage.getItem('gifs')) {
		gifs = JSON.parse(localStorage.getItem('gifs'));
	}

	Utility.addEvent(stashBtn, 'click', function () {
		stash.toggle();
		console.log(stash);
		// focus input
		$('#gif-url').focus();
	});

	Utility.addEvent(optionsBtn, 'click', function () {
		chrome.tabs.create({url: 'options.html'});
	});
	
	// append gif to menu
	function appendGif(gif) {
		var li = document.createElement('li');
		li.className = 'gif';
		li.dataset.id = gif.id;

		var div = document.createElement('div');
		
		var overlay = document.createElement('div');
		overlay.className = 'overlay';
		
		var removeBtn = document.createElement('button');
		removeBtn.setAttribute('type','button');
		removeBtn.className = 'btn';
		var removeTxt = document.createTextNode('Unstash Gif');
		removeBtn.appendChild(removeTxt);

		var input = document.createElement('input');
		input.setAttribute('type', 'text');
		input.setAttribute('value', gif.url);
		
		var instructions = document.createElement('div');
		instructions.className = 'instructions';

		var txt = document.createTextNode('Click to copy gif link');
		instructions.appendChild(txt);
		
		overlay.appendChild(instructions);
		overlay.appendChild(input);
		overlay.appendChild(removeBtn);
		
		var img = document.createElement('img');
		img.src = gif.url;
		
		li.appendChild(div);
		li.appendChild(img);
		li.appendChild(overlay);
		el.appendChild(li);

		Utility.addEvent(removeBtn, 'click', function (e) {
			removeGif(gif.id);
			flash.end();
			flash.start('Your gif has been removed.','BOOM!','success');
			e.stopPropagation();
		});

		Utility.addEvent(li, 'click', function () {
			input.select();
			input.focus();
			document.execCommand('SelectAll');
			document.execCommand('Copy', false, null);
			flash.start('The link has been copied to your clipboard. Paste away!','Yay!','success');
		});
	}

	function removeGif(id, e) {
		// find li with data id

		chrome.extension.getBackgroundPage().console.log(id);
		$('li[data-id="' + id + '"]').remove();

		// remove from gifs and save gifs in localStorage
		$.each(gifs, function(i){
			if(gifs[i].id === id) {
				gifs.splice(i,1);
				return false;
			}
		});

		gifsToStore = JSON.stringify(gifs);
		localStorage.setItem('gifs', gifsToStore);
	}

	// clear all gifs in local storage
	function clearGifs () {
		localStorage.removeItem('gifs');
		gifs = [];
		var elements = el.getElementsByTagName('li');
		for (var i = 0, len = elements.length; i < len; i++) { elements[i].onclick = null; }
		while (el.firstChild) { el.removeChild(el.firstChild); }
	}
	
	// create gif and append to gifs
	function createGif(e) {
		var formElements = document.getElementById('menu-form').elements;
		if (formElements.url.value.length !== 0) {
			var obj = {
				id: Date.now(),
				title: (formElements.title.value !== '') ? formElements.title.value : 'Untitled',
				url: formElements.url.value
			};
			gifs.push(obj);
			gifsToStore = JSON.stringify(gifs);
			localStorage.setItem('gifs', gifsToStore);
			appendGif(obj);
			formElements.title.value = '';
			formElements.url.value = '';
			formElements.url.focus();
			flash.start('Your gif has been stashed!','Woohoo!','success');
			$('#stash').slideUp("fast");
			e.preventDefault();
		} else {
			e.preventDefault();
			return false;
		}
	}
	
	// initial menu setup
	function init(){
		for(var i = 0, len = gifs.length; i < len; i++){ appendGif(gifs[i]); }
		Utility.addEvent(menuForm, 'submit', createGif);
		Utility.addEvent(clear, 'click', clearGifs);
	}
	
	return {
		appendGif: appendGif,
		createGif: createGif,
		init: init
	};
})();

window.onload = Menu.init();