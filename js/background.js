/*!
 * gifstasher 1.0.5
 * https://chrome.google.com/webstore/detail/gifstasher/enegbanenghjkfmmkjimbckfihbamcfi
 *
 * Copyright 2014 Sterling Stokes
 * Date: April 17th, 2014
 */

(function () {

	'use strict';

	// configure require
	require.config({ baseUrl: chrome.extension.getURL("js") });

	// load Stasher and Utility module
	require(["jquery", "stasher", "utility"], function ( $, Stasher, Utility ) {
		
		if (localStorage.getItem('gifs')) {
			var gifs = JSON.parse(localStorage.getItem('gifs'));
		}

		// copy and stash the gif
		function copyStashGif(info) {

			// format url
			var url = JSON.stringify(info.srcUrl);
			url = url.substring(1);
			url = url.substring(0, url.length-1);

			// copy to clipboard
			Utility.copyToClipboard(url);

			// copy here
			stashGif(info, true);

		}

		// stash gif
		function stashGif(info, isCopy) {

			var url = JSON.stringify(info.srcUrl),
					filename = url.substring(url.lastIndexOf('/')+1),
					ext = filename.split('.').pop(),
					gifs,
					notification;

			ext = ext.substring(0, ext.length - 1);

			if (ext === 'gif' || ext === 'jpg') {
				chrome.runtime.sendMessage({}, function() {
					if (localStorage.getItem('gifs')) {
						gifs = JSON.parse(localStorage.getItem('gifs'));
					} else {
						gifs = [];
					}

					url = url.substring(1);
					url = url.substring(0, url.length-1);

					var obj = {
						id: Date.now(),
						title: 'Untitled',
						url: url,
						tags: [],
						isFavorite: false
					};

					gifs.unshift(obj);
					var gifsToStore = JSON.stringify(gifs);
					localStorage.setItem('gifs', gifsToStore);

					if (isCopy === true) {
						notification = webkitNotifications.createNotification(
							'img/icon-small.png',
							'Gif stashed and link copied!',
							'Your gif has been stashed and the link has been copied to your clipboard.'
						);
					} else {
						notification = webkitNotifications.createNotification(
							'img/icon-small.png',
							'Gif stashed!',
							'Your gif has been saved to your Gif stash.'
						);
					}

					notification.show();
					setTimeout(function(){ notification.cancel(); }, 5000);
				});
			} else {
				notification = webkitNotifications.createNotification(
					'img/icon-small-error.png',
					'Oh noes!',
					'There was an error stashing your gif. Are you sure that it\'s a gif?'
				);

				notification.show();
				setTimeout(function(){ notification.cancel(); }, 15000);
			}

		}

		// context menu for Stash this gif
		chrome.contextMenus.create({
			'title': 'Stash this gif',
			'contexts':['image'],
			'onclick': stashGif
		});

		// context menu for Copy and Stash this gif
		chrome.contextMenus.create({
			'title': 'Copy and Stash this gif',
			'contexts':['image'],
			'onclick': copyStashGif
		});

	});

}());