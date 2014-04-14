// Copyright (c) 2010 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

// A generic onclick callback function.
function stashGif(info, tab) {
  var url = JSON.stringify(info.srcUrl);
  chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
    if (localStorage.getItem('gifCount')) {
      gifCount = JSON.parse(localStorage.getItem('gifCount'));
    } else {
      gifCount = [];
    }

    if (localStorage.getItem('gifs')) {
      gifs = JSON.parse(localStorage.getItem('gifs'));
    } else {
      gifs = [];
    }

    url = url.substring(1);
    url = url.substring(0, url.length-1); 

    // alert(url);

    var obj = {
      id: gifCount + 1,
      title: 'Untitled',
      url: url
    };

    gifs.push(obj);
    gifCountToStore = JSON.stringify(gifCount);
    localStorage.setItem('gifCount', gifCountToStore);
    gifsToStore = JSON.stringify(gifs);
    localStorage.setItem('gifs', gifsToStore);
  });
}

var id = chrome.contextMenus.create({
  "title": "Stash this gif",
  "contexts":["image"],
  "onclick": stashGif
});