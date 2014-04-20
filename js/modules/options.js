// Options

(function () {

  // configure requirejs
  require.config({
    baseUrl: chrome.extension.getURL("js"),
    paths: {
      'bootstrap': 'bootstrap.min',
      'jquery': 'jquery'
    },
    shim: {
      'bootstrap': {
        deps: ['jquery'],
        exports: '$.fn.modal'
      }
    }
  });
  
  require(["stasher","utility","jquery","bootstrap"], function ( Stasher, Utility, $, Bootstrap ) {

    var clear = document.getElementById('clearGifs'); // clear gifs button,
        flash = Utility.flash;

    // clear all gifs in local storage
    function clearGifs () {
      localStorage.removeItem('gifs');
      flash.start('All gifs have been cleared. :)','Poof!','success');
    }

    Utility.addEvent(clear, 'click', clearGifs);

    $('#email-btn').bind('click', function () {
      window.location.href = 'mailto:gifstasher@gmail.com?subject=Gifstasher%20Feedback';
    });

  });

}());