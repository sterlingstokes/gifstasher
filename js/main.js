'use strict';

var Utility = (function () {
	var flash = {
		start: function (message, title, type) {
			this.end();
			// clone flash-template
			var flashElement = $('#flash-template').clone();
			flashElement.addClass('flash').attr('id','');
			if (type) { flashElement.addClass('alert-' + type); }
			flashElement.find('.flash-message').text(message);
			flashElement.find('.flash-title').text(title);
			flashElement.appendTo('#flash-holder');
			flashElement.fadeIn('fast').delay(5000).fadeOut('fast');
		},
		end: function () {
			$('.flash').stop().remove();
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
	var bg = chrome.extension.getBackgroundPage(),
			clear = document.getElementById('clearGifs'),
			gifs = [],
			gifsToStore,
			el = document.getElementById('menu'),
			flash = Utility.flash,
			menuForm = document.getElementById('menu-form'),
			optionsBtn = document.getElementById('options-btn');
	
	// if gifs is in localStorage, get it out
	if (localStorage.getItem('gifs')) {
		gifs = JSON.parse(localStorage.getItem('gifs'));
	}

	Utility.addEvent(optionsBtn, 'click', function (e) {
		chrome.tabs.create({url: 'options.html'});
		e.stopPropagation();
	});

	$('#menu-form-modal').on('show.bs.modal',function (e) {
		setTimeout(function () {
			$('#gif-url').focus();
		},500);
	});

	// append gif to menu
	function appendGif(gif) {
		var li = document.createElement('li');
		li.className = 'gif';
		li.dataset.id = gif.id;

		var div = document.createElement('div');
		
		var overlay = document.createElement('div');
		overlay.className = 'overlay';

		// copy
		var viewBtn = document.createElement('button');
		viewBtn.setAttribute('type','button');
		viewBtn.className = 'btn btn-info';
		var viewTxt = document.createTextNode('View Gif');
		viewBtn.appendChild(viewTxt);

		// copy
		var copyBtn = document.createElement('button');
		copyBtn.setAttribute('type','button');
		copyBtn.className = 'btn btn-success copy-btn';
		var copyTxt = document.createTextNode('Copy Link');
		copyBtn.appendChild(copyTxt);

		// unstash
		var unstashBtn = document.createElement('button');
		unstashBtn.setAttribute('type','button');
		unstashBtn.setAttribute('data-toggle','modal');
		unstashBtn.setAttribute('data-target','#removeModal');
		unstashBtn.className = 'btn btn-danger';
		var removeTxt = document.createTextNode('Unstash Gif');
		unstashBtn.appendChild(removeTxt);

		// input -- hide behind copy button
		var input = document.createElement('input');
		input.setAttribute('type', 'text');
		input.setAttribute('value', gif.url);

		overlay.appendChild(input);
		overlay.appendChild(viewBtn);
		overlay.appendChild(copyBtn);
		overlay.appendChild(unstashBtn);
		
		var img = document.createElement('img');
		img.src = gif.url;
		
		li.appendChild(div);
		li.appendChild(img);
		li.appendChild(overlay);
		$(el).prepend(li);
		// el.appendChild(li);

		Utility.addEvent(unstashBtn, 'click', function (e) {
			removeGif(gif.id);
			flash.start('Your gif has been removed.','BOOM!','danger');
			e.stopPropagation();
		});

		// for viewing in gallery
		var galleryImg = document.createElement('img');
		galleryImg.src = gif.url;
		var gallery = $('#gallery');
		var content = gallery.find('.modal-content');

		Utility.addEvent(viewBtn, 'click', function (e) {
			content.html('');
			content.append(galleryImg);
			gallery.modal('show');
			e.stopPropagation();
		});

		Utility.addEvent(galleryImg, 'click', function (e) {
			// close modal
			gallery.modal('hide');
			$(galleryImg).remove();
			e.stopPropagation();
		});

		Utility.addEvent(copyBtn, 'click', function () {
			input.select();
			input.focus();
			document.execCommand('SelectAll');
			document.execCommand('Copy', false, null);
			flash.start('The link has been copied to your clipboard. Paste away!','Yay!','success');
		});
	}

	function removeGif(id, e) {
		// find li with data id
		$('li[data-id="' + id + '"]').remove();

		// remove from gifs and save gifs in localStorage
		$.each(gifs, function(i){
			if(gifs[i].id === id) {
				gifs.splice(i,1);
				return false;
			}
		});

		if (gifs.length === 0) { $('#no-gifs').show(); }

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

		var url = formElements.url.value;
		var filename = url.substring(url.lastIndexOf('/')+1);
		var ext = filename.split('.').pop();

		if ((formElements.url.value.length !== 0) && (ext === 'gif' || ext === 'jpg')) {
			$('#no-gifs').hide();
			var obj = {
				id: Date.now(),
				title: '',
				url: formElements.url.value,
				tags: [],
				isFavorite: false
			};
			gifs.unshift(obj);
			gifsToStore = JSON.stringify(gifs);
			localStorage.setItem('gifs', gifsToStore);
			appendGif(obj);
			formElements.url.value = '';
			formElements.url.focus();
			$('#menu-form-modal').modal('hide');
			flash.start('Your gif has been stashed!','Woohoo!','success');
			e.preventDefault();
		} else {
			if (ext !== 'gif' || ext !== 'jpg') {
				$('#menu-form-modal').modal('hide');
				flash.start('There was a problem! Are you sure that it\'s a gif link?','Oh noes!','danger');
			}
			e.preventDefault();
			return false;
		}
	}
	
	// initial menu setup
	function init(){
		if (gifs.length === 0) {
			$('#no-gifs').show();
		} else {
			$('#no-gifs').hide();
			for(var i = 0, len = gifs.length; i < len; i++){ appendGif(gifs[i]); }
		}
		$(menuForm).bind('click',function (e) {
			e.stopPropagation();
		});
		$('.cancel-btn').bind('click',function () {
			$('.modal').modal('hide');
		});
		
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