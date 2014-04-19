/*!
 * gifstasher 1.0.5
 * https://chrome.google.com/webstore/detail/gifstasher/enegbanenghjkfmmkjimbckfihbamcfi
 *
 * Copyright 2014 Sterling Stokes
 * Date: April 17th, 2014
 */

(function (window, document, $) {
	'use strict';

	// utility module
	var Utility = (function () {

		// flash message at bottom of gifstasher window
		var flash = {

			// start flash
			start: function (message, title, type) {

				this.end();
				var flashElement = $('#flash-template').clone();						// clone flash-template
				flashElement.addClass('flash').attr('id','');								// add flash class and remove template id
				if (type) { flashElement.addClass('alert-' + type); }				// if a different alert type, add that class
				flashElement.find('.flash-message').text(message);					// insert message into div
				flashElement.find('.flash-title').text(title);							// insert title into div
				flashElement.appendTo('#flash-holder');											// append flash to holder
				flashElement.fadeIn('fast').delay(5000).fadeOut('fast');		// show and fade out

			},

			// end flash
			end: function () {

				$('.flash').stop().remove();	// stop animation and remove from DOM

			}
		};

		// add event function
		function addEvent(element, evnt, funct) {

			if (element.attachEvent) { return element.attachEvent('on' + evnt, funct); }	// below IE 11
			else { return element.addEventListener(evnt, funct, false); }									// everything else

		}

		return {
			addEvent: addEvent,
			flash: flash
		};
	}());

	// Stasher module
	var Stasher = (function () {
		var bg = chrome.extension.getBackgroundPage(),							// store background page for logging
				gifs = [],																							// array for holding gifs
				gifsToStore,																						// for holding stringified gifs array
				el = document.getElementById('gallery'),								// get gallery unordered list
				flash = Utility.flash,																	// store local copy of flash
				loadLimit = 15,																					// loading limit, by index, for infinite scroll
				galleryForm = document.getElementById('gallery-form'),	// gallery form
				optionsBtn = document.getElementById('options-btn');
		
		// if gifs array is stored in localStorage, retrieve and parse
		if (localStorage.getItem('gifs')) { gifs = JSON.parse(localStorage.getItem('gifs')); }

		// add listener for options button
		Utility.addEvent(optionsBtn, 'click', function (e) {

			chrome.tabs.create({url: 'options.html'});	// open options in new tab
			e.stopPropagation();												// stop click from propagating

		});

		// when Bootstrap modal is shown, focus on gif url input
		$('#gallery-form-modal').on('show.bs.modal',function (e) {

			setTimeout(function () { $('#gif-url').focus(); },500);

		});

		// append gif to gallery
		function appendGif(gif, placement) {

			// image holder
			var imgHolder = document.createElement('li');		// create li element
			imgHolder.className = 'gif';										// add .gif class
			imgHolder.dataset.id = gif.id;									// add data-id to li
			
			// overlay div
			var overlay = document.createElement('div');	// create div element
			overlay.className = 'overlay';								// add .overlay class

			// view button
			var viewBtn = document.createElement('button');			// create button element
			viewBtn.setAttribute('type','button');							// set type attribute
			viewBtn.className = 'btn btn-info';									// add bootstrap classes
			var viewTxt = document.createTextNode('View Gif');	// create text node
			viewBtn.appendChild(viewTxt);												// append text node

			// copy button
			var copyBtn = document.createElement('button');			// create button element
			copyBtn.setAttribute('type','button');							// set type attribute
			copyBtn.className = 'btn btn-success copy-btn';			// add bootstrap and .copy-btn classes
			var copyTxt = document.createTextNode('Copy Link');	// create text node
			copyBtn.appendChild(copyTxt);												// append text node

			// unstash button
			var unstashBtn = document.createElement('button');			// create button element
			unstashBtn.setAttribute('type','button');								// set type attribute
			unstashBtn.setAttribute('data-toggle','modal');					// set data-toggle for modal
			unstashBtn.setAttribute('data-target','#removeModal');	// set data-target to remove id
			unstashBtn.className = 'btn btn-danger';								// add bootstrap classes
			var removeTxt = document.createTextNode('Unstash Gif');	// create text node
			unstashBtn.appendChild(removeTxt);											// append text node

			// input (hidden behind copy button)
			var input = document.createElement('input');	// create input element
			input.setAttribute('type', 'text');						// set type attribute
			input.setAttribute('value', gif.url);					// set value attribute to gif url

			// the gif element
			var img = document.createElement('img');	// create image element
			img.src = gif.url;												// set source for gif

			// the gallery view element
			var galleryImg = document.createElement('img');	// create gallery image element
			galleryImg.src = gif.url;												// set source for gif
			var gallery = $('#gallery-view');									// store jquery gallery element
			var content = gallery.find('.modal-content');	// store modal content element

			// append all the things to the overlay
			overlay.appendChild(input);
			overlay.appendChild(viewBtn);
			overlay.appendChild(copyBtn);
			overlay.appendChild(unstashBtn);
			
			// append all the things to the image holder
			imgHolder.appendChild(img);
			imgHolder.appendChild(overlay);

			// append the image holder to the gallery
			if (placement === 'prepend') {
				$(el).prepend(imgHolder);
			} else {
				el.appendChild(imgHolder);
			}

			// add listener for unstash button
			Utility.addEvent(unstashBtn, 'click', function (e) {

				removeGif(gif.id);		// remove gif
				e.stopPropagation();	// stop click from propagating

				// show success alert
				flash.start('Your gif has been removed.','BOOM!','success');

			});

			// add listener for view button
			Utility.addEvent(viewBtn, 'click', function (e) {

				content.html('');						// remove any previous modal content
				content.append(galleryImg);	// append the gallery image
				gallery.modal('show');			// show the gallery view modal
				e.stopPropagation();				// stop the click from propagating

			});

			// add listener for clicking the gallery view image
			Utility.addEvent(galleryImg, 'click', function (e) {

				gallery.modal('hide');		// close modal
				$(galleryImg).remove();		// remove and unbind gallery view image element
				e.stopPropagation();			// stop the click from propagating
			});

			// add listener for clicking copy button
			Utility.addEvent(copyBtn, 'click', function () {

				input.select();															// select url in input
				input.focus();															// focus input element
				document.execCommand('SelectAll');					// select all text in chrome
				document.execCommand('Copy', false, null);	// copy text to clipboard

				// show success alert
				flash.start('The link has been copied to your clipboard. Paste away!','Yay!','success');
			});

		}

		// remove gif from the gallery
		function removeGif(id, e) {
			
			// find li with data id and remove the element and all bound events
			$('li[data-id="' + id + '"]').remove();

			// loop through gifs array
			$.each(gifs, function (i) {

				// if the gif id matches, remove it 
				if(gifs[i].id === id) {
					gifs.splice(i,1);
					return false;
				}

			});

			// if the gifs array is empty, show the no-gifs element
			if (gifs.length === 0) { $('#no-gifs').show(); }

			// store gifs in localStorage
			gifsToStore = JSON.stringify(gifs);					// stringify gifs array
			localStorage.setItem('gifs', gifsToStore);	// store gifs in localStorage
		}
		
		// create new gif from gallery form and append to gifs
		function createGif(e) {

			var formElements = document.getElementById('gallery-form').elements;	// store form elements
			var url = formElements.url.value;																			// get url value
			var filename = url.substring(url.lastIndexOf('/')+1);									// get filename from url
			var ext = filename.split('.').pop();																	// split filename and get extension

			// if the url value is not empty and the extension is a gif or a jpg
			if ((formElements.url.value.length !== 0) && (ext === 'gif' || ext === 'jpg' || ext === 'jpeg')) {
				
				// create the new gif object
				var gif = {

					id: Date.now(),								// store id as current timestamp
					title: '',										// store a blank title for future version
					url: formElements.url.value,	// store url
					tags: [],											// store tags for future version
					isFavorite: false							// store favorite status for future version

				};

				gifs.unshift(gif);													// add gif to gifs array
				gifsToStore = JSON.stringify(gifs);					// stringify gifs
				localStorage.setItem('gifs', gifsToStore);	// store gifs in localStorage
				formElements.url.value = '';								// reset value of url input
				formElements.url.focus();										// reset focus to url input
				appendGif(gif, prepend);										// append gif to gallery

				// hide no-gif element if it exists
				if ($('#no-gifs').is(':visible')) {
					$('#no-gifs').hide();
				}

				// hide gallery form modal
				$('#gallery-form-modal').modal('hide');
				
				// show success alert
				flash.start('Your gif has been stashed!','Woohoo!','success');
				
				e.stopPropagation();	// stop click from propagating

			} else {

				// if extension is not a gif or a jpg
				if (ext !== 'gif' || ext !== 'jpg' || ext !== 'jpeg') {

					// hide the gallery form modal
					$('#gallery-form-modal').modal('hide');

					// show danger alert
					flash.start('There was a problem! Are you sure that it\'s a gif link?','Oh noes!','danger');

				}

				e.stopPropagation();	// stop the click from propagating
				return false;					// 
				
			}

			e.preventDefault();
		}
		
		// initial gallery setup
		function init(){
			if (gifs.length === 0) {
				$('#no-gifs').show();
			} else {
				$('#no-gifs').hide();

				for(var i = 0; i < loadLimit && i <= (gifs.length - 1); i++){
					appendGif(gifs[i]);
				}
			}

			$('.cancel-btn').bind('click',function () {
				$('.modal').modal('hide');
			});

			var galleryView = $('#gallery-view');

			galleryView.bind('scroll', function() {

				if($(window).scrollTop() == $(document).height() - $(window).height()){
					if (loadLimit < gifs.length) {
						// load next 16 gifs
						var oldLoadLimit = loadLimit;
						loadLimit = loadLimit + 16;
						for(var i = oldLoadLimit; i < loadLimit && i <= gifs.length; i++){
							appendGif(gifs[i]);
						}
					}
				}

			});
			
			Utility.addEvent(galleryForm, 'submit', createGif);	// add listener for submit button on gallery form
		}
		
		return {
			appendGif: appendGif,
			createGif: createGif,
			init: init
		};

	}());

	// when the document is ready, initialize the Stasher module
	$(document).ready(function () { Stasher.init(); });

}(window, document, jQuery));