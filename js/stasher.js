/*!
 * gifstasher Stasher module
 *
 * Author: Sterling Stokes
 * Date: April 19th, 2014
 */

// define Stasher module
define(["Utility"], function ( Utility ) {

  // Properties

  var bg = chrome.extension.getBackgroundPage(),              // store background page for logging
      gifsToStore,                                            // for holding stringified gifs array
      el = document.getElementById('gallery'),                // get gallery unordered list
      flash = Utility.flash,                                  // store local copy of flash
      loadLimit = 15,                                         // loading limit, by index, for infinite scroll
      galleryForm = document.getElementById('gallery-form'),  // gallery form
      optionsBtn = document.getElementById('options-btn');

  // Methods

  // append gif to gallery
  function appendGif(gif, placement) {

    // image holder
    var imgHolder = document.createElement('li');   // create li element
    imgHolder.className = 'gif';                    // add .gif class
    imgHolder.dataset.id = gif.id;                  // add data-id to li

    // overlay div
    var overlay = document.createElement('div');  // create div element
    overlay.className = 'overlay';                // add .overlay class

    // view button
    var viewBtn = document.createElement('button');     // create button element
    viewBtn.setAttribute('type','button');              // set type attribute
    viewBtn.className = 'btn btn-info';                 // add bootstrap classes
    var viewTxt = document.createTextNode('View Gif');  // create text node
    viewBtn.appendChild(viewTxt);                       // append text node

    // copy button
    var copyBtn = document.createElement('button');     // create button element
    copyBtn.setAttribute('type','button');              // set type attribute
    copyBtn.className = 'btn btn-success copy-btn';     // add bootstrap and .copy-btn classes
    var copyTxt = document.createTextNode('Copy Link'); // create text node
    copyBtn.appendChild(copyTxt);                       // append text node

    // unstash button
    var unstashBtn = document.createElement('button');      // create button element
    unstashBtn.setAttribute('type','button');               // set type attribute
    unstashBtn.setAttribute('data-toggle','modal');         // set data-toggle for modal
    unstashBtn.setAttribute('data-target','#removeModal');  // set data-target to remove id
    unstashBtn.className = 'btn btn-danger';                // add bootstrap classes
    var removeTxt = document.createTextNode('Unstash Gif'); // create text node
    unstashBtn.appendChild(removeTxt);                      // append text node

    // input (hidden behind copy button)
    var input = document.createElement('input');  // create input element
    input.setAttribute('type', 'text');           // set type attribute
    input.setAttribute('value', gif.url);         // set value attribute to gif url

    // the gif element
    var img = document.createElement('img');  // create image element
    img.src = gif.url;                        // set source for gif

    // the gallery view element
    var galleryImg = document.createElement('img'); // create gallery image element
    galleryImg.src = gif.url;                       // set source for gif
    var gallery = $('#gallery-view');                 // store jquery gallery element
    var content = gallery.find('.modal-content'); // store modal content element

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

      removeGif(gif.id);    // remove gif
      e.stopPropagation();  // stop click from propagating

      // show success alert
      flash.start('Your gif has been removed.','BOOM!','success');

    });

    // add listener for view button
    Utility.addEvent(viewBtn, 'click', function (e) {

      content.html('');           // remove any previous modal content
      content.append(galleryImg); // append the gallery image
      gallery.modal('show');      // show the gallery view modal
      e.stopPropagation();        // stop the click from propagating

    });

    // add listener for clicking the gallery view image
    Utility.addEvent(galleryImg, 'click', function (e) {

      gallery.modal('hide');    // close modal
      $(galleryImg).remove();   // remove and unbind gallery view image element
      e.stopPropagation();      // stop the click from propagating

    });

    // add listener for clicking copy button
    Utility.addEvent(copyBtn, 'click', function () {

      input.select();                             // select url in input
      input.focus();                              // focus input element
      document.execCommand('SelectAll');          // select all text in chrome
      document.execCommand('Copy', false, null);  // copy text to clipboard

      // show success alert
      flash.start('The link has been copied to your clipboard. Paste away!','Yay!','success');

    });

  }

  function isAlreadyStashed(url) {
    var gifs = getStoredGifs();
    var isAlreadyStashed = false;
    for ( var i =0; i < gifs.length; i ++ ) {
      gifToCheck = gifs[i];
      if ( gifToCheck.url ==  url) {
        isAlreadyStashed = true;
      }
    }
    return isAlreadyStashed;
  }



  // create new gif from gallery form and append to gifs
  function createGif(e) {
    var formElements = document.getElementById('gallery-form').elements;  // store form elements
    var url = formElements.url.value;                                     // get url value
    var filename = url.substring(url.lastIndexOf('/')+1);                 // get filename from url
    var ext = filename.split('.').pop();                                  // split filename and get extension
    var isThisGifStashed = isAlreadyStashed(url);

    // if the url value is not empty and the extension is a gif or a jpg
    if ((formElements.url.value.length !== 0) && (ext === 'gif' || ext === 'jpg' || ext === 'jpeg') && !isThisGifStashed) {

      // create the new gif object
      var gif = {

        id: Date.now(),               // store id as current timestamp
        title: '',                    // store a blank title for future version
        url: formElements.url.value,  // store url
        tags: [],                     // store tags for future version
        isFavorite: false             // store favorite status for future version

      };

      gifs.unshift(gif);                          // add gif to gifs array
      gifsToStore = JSON.stringify(gifs);         // stringify gifs
      localStorage.setItem('gifs', gifsToStore);  // store gifs in localStorage
      formElements.url.value = '';                // reset value of url input
      formElements.url.focus();                   // reset focus to url input

      // hide no-gif element if it exists
      if ($('#no-gifs').is(':visible')) {
        $('#no-gifs').hide();
      }

      // hide gallery form modal
      $('#gallery-form-modal').modal('hide');

      // show success alert
      flash.start('Your gif has been stashed!','Woohoo!','success');

      e.stopPropagation();  // stop click from propagating

      appendGif(gif, prepend);  // append gif to gallery

    } else {

      // if extension is not a gif or a jpg
      if(isAlreadyStashed) {
        $('#gallery-form-modal').modal('hide');
        flash.start('There was a problem! This gif is already stashed!','You really like this gif!','danger');
      } else if (ext !== 'gif' || ext !== 'jpg' || ext !== 'jpeg') {

        // hide the gallery form modal
        $('#gallery-form-modal').modal('hide');

        // show danger alert
        flash.start('There was a problem! Are you sure that it\'s a gif link?','Oh noes!','danger');

      }

      e.stopPropagation();  // stop the click from propagating
      return false;         // stop the form from submitting

    }

    e.preventDefault();
  }

  // retrieve gifs from storage
  function getStoredGifs () {
    // if gifs array is stored in localStorage, retrieve and parse
    if (localStorage.getItem('gifs')) {
      return JSON.parse(localStorage.getItem('gifs'));
    } else {
      return []; // array for holding gifs
    }
  }

  // initial gallery setup
  function init(){

    // if gifs array is stored in localStorage, retrieve and parse
    gifs = getStoredGifs();

    console.log(gifs);

    // load gifs or show no-gif element
    if (gifs.length === 0) {
      $('#no-gifs').show(); // show no-gifs element
    } else {
      $('#no-gifs').hide(); // hide no-gifs element

      // loop through gifs and append to gallery
      for(var i = 0, len = gifs.length; i < loadLimit && i <= (len - 1); i++){
        appendGif(gifs[i]);
      }
    }

    var galleryView = $('#gallery-view'); // store gallery view element

    // bind scroll to gallery view element
    galleryView.bind('scroll', function() {

      // if user scrolls to bottom of window
      if($(window).scrollTop() == $(document).height() - $(window).height()){

        // load next 16 gifs
        if (loadLimit < gifs.length) {

          var oldLoadLimit = loadLimit; // store old load limit for counter
          loadLimit = loadLimit + 16;   // increment load limit

          // loop through and append gifs to gallery
          for(var i = oldLoadLimit; i < loadLimit && i <= gifs.length; i++){
            appendGif(gifs[i]);
          }
        }

      }

    });

    // bind the cancel button to the click
    $('.cancel-btn').bind('click',function () {
      $('.modal').modal('hide');
    });

    // add listener for submit button on gallery form
    Utility.addEvent(galleryForm, 'submit', createGif);

    // add listener for options button
    Utility.addEvent(optionsBtn, 'click', function (e) {

      chrome.tabs.create({url: 'options.html'});  // open options in new tab
      e.stopPropagation();                        // stop click from propagating

    });

    // when Bootstrap modal is shown, focus on gif url input
    $('#gallery-form-modal').on('show.bs.modal',function (e) {
      setTimeout(function () { $('#gif-url').focus(); },500);
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
    gifsToStore = JSON.stringify(gifs);         // stringify gifs array
    localStorage.setItem('gifs', gifsToStore);  // store gifs in localStorage
  }

  return {
    appendGif: appendGif,
    createGif: createGif,
    isAlreadyStashed: isAlreadyStashed,
    init: init
  };

});
