/*!
 * gifstasher Utility module
 *
 * Author: Sterling Stokes
 * Date: April 19th, 2014
 */

// define Utility module
define(function () {

  // flash message at bottom of gifstasher window
  var flash = {

    // start flash
    start: function (message, title, type) {
      this.end();
      var flashElement = $('#flash-template').clone();            // clone flash-template
      flashElement.addClass('flash').attr('id','');               // add flash class and remove template id
      if (type) { flashElement.addClass('alert-' + type); }       // if a different alert type, add that class
      flashElement.find('.flash-message').text(message);          // insert message into div
      flashElement.find('.flash-title').text(title);              // insert title into div
      flashElement.appendTo('#flash-holder');                     // append flash to holder
      flashElement.fadeIn('fast').delay(5000).fadeOut('fast');    // show and fade out

    },

    // end flash
    end: function () {

      $('.flash').stop().remove();  // stop animation and remove from DOM

    }
  };

  // add event function
  function addEvent(element, evnt, funct) {

    if (element.attachEvent) { return element.attachEvent('on' + evnt, funct); }  // below IE 11
    else { return element.addEventListener(evnt, funct, false); }                 // everything else

  }

  // copy text to clipboard
  function copyToClipboard(text){

    var copyDiv = document.createElement('div');
    copyDiv.contentEditable = true;
    document.body.appendChild(copyDiv);
    copyDiv.innerHTML = text;
    copyDiv.unselectable = "off";
    copyDiv.focus();
    document.execCommand('SelectAll');
    document.execCommand("Copy", false, null);
    document.body.removeChild(copyDiv);

  }

  return {
    addEvent: addEvent,
    copyToClipboard: copyToClipboard,
    flash: flash
  };

});
