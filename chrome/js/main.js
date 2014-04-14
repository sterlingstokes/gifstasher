'use strict';

var Utility = (function () {
	function addEvent(element, evnt, funct) {
		if (element.attachEvent) { return element.attachEvent('on' + evnt, funct); }
		else { return element.addEventListener(evnt, funct, false); }
	}
	
	return { addEvent: addEvent };
})();

var Menu = (function () {
	var gifCount,
			clear = document.getElementById('clearGifs'),
			gifs = [],
			gifsToStore,
			el = document.getElementById('menu'),
			menuForm = document.getElementById('menu-form');

	if (localStorage.getItem('gifCount')) {
		gifCount = JSON.parse(localStorage.getItem('gifCount'));
	} else {
		gifCount = 0;
	}
	
	// if gifs is in localStorage, get it out
	if (localStorage.getItem('gifs')) {
		gifs = JSON.parse(localStorage.getItem('gifs'));
	}
	
	// append gif to menu
	function appendGif(gif) {
		var li = document.createElement('li');
		li.dataset.id = gif.id;
		var div = document.createElement('div');
		var overlay = document.createElement('div');
		overlay.className = 'overlay';
		var input = document.createElement('input');
		var removeBtn = document.createElement('button');
		removeBtn.setAttribute('type','button');
		removeBtn.style.background = 'red';
		removeBtn.style.color = 'white';
		var removeTxt = document.createTextNode('Unstash Gif');
		removeBtn.appendChild(removeTxt);
		input.setAttribute('type','text');
		input.setAttribute('value',gif.url);
		var instructions = document.createElement('div');
		instructions.className = 'instructions';
		var txt = document.createTextNode('Click and press Ctrl-C or Cmd-C to copy gif link');
		instructions.appendChild(txt);
		overlay.appendChild(instructions);
		overlay.appendChild(input);
		overlay.appendChild(removeBtn);
		var title = document.createTextNode(gif.title);
		var img = document.createElement('img');
		img.src = gif.url;
		div.appendChild(title);
		li.appendChild(div);
		li.appendChild(img);
		li.appendChild(overlay);
		el.appendChild(li);
		gifCount++;

		Utility.addEvent(removeBtn, 'click', function () {
			console.log(gif);
			removeGif(gif.id);
		});

		Utility.addEvent(li, 'click', function () {
			input.select();
		});
	}

	function removeGif(id) {
		// find li with data id
		console.log($('li[data-id="' + id + '"]').html());
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

		// remove window.confirm

		if (window.confirm('Are you sure you want to unstash all of your gifs?')) {
			localStorage.removeItem('gifs');
			gifs = [];
			var elements = el.getElementsByTagName('li');
			for (var i = 0, len = elements.length; i < len; i++) { elements[i].onclick = null; }
			while (el.firstChild) { el.removeChild(el.firstChild); }
		} else {
			return false;
		}
	}
	
	// create gif and append to gifs
	function createGif(e) {
		var formElements = document.getElementById('menu-form').elements;
		if (formElements.url.value.length !== 0) {
			var obj = {
				id: gifCount + 1,
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
		init: init,
		gifs: gifs
	};
})();

window.onload = Menu.init();