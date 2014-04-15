'use strict';

function preload(arr) {
	var images = [];
	for (var i = 0; i < arr.length; i++) {
		images[i] = new Image();
		images[i].src = arr[i].url;
	}
}

if (localStorage.getItem('gifs')) {
	var gifs = JSON.parse(localStorage.getItem('gifs'));
	preload(gifs);
}

function stashGif(info) {
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

			notification = webkitNotifications.createNotification(
				'img/icon-small.png',
				'Gif stashed!',
				'Your gif has been saved to your Gif stash.'
			);

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

chrome.contextMenus.create({
	'title': 'Stash this gif',
	'contexts':['image'],
	'onclick': stashGif
});