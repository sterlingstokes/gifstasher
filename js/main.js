/*!
 * gifstasher 1.0.5
 * https://chrome.google.com/webstore/detail/gifstasher/enegbanenghjkfmmkjimbckfihbamcfi
 *
 * Copyright 2014 Sterling Stokes
 * Date: April 17th, 2014
 */

(function () {

	'use strict';

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

	// load Stasher module
	require(["stasher", "jquery", "bootstrap"], function ( Stasher, $, Bootstrap ) {
		
		// when the document is ready, initialize the Stasher module
		$(document).ready(function () { Stasher.init(); });

	});

}());