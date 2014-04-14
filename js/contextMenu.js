// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

function stashGif(info) {
	var url = JSON.stringify(info.srcUrl),
			gifs;

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
			url: url
		};

		gifs.push(obj);
		var gifsToStore = JSON.stringify(gifs);
		localStorage.setItem('gifs', gifsToStore);
	});
}

chrome.contextMenus.create({
	'title': 'Stash this gif',
	'contexts':['image'],
	'onclick': stashGif
});