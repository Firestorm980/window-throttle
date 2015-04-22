/**
 * Window Throttle
 * @author: Jon Christensen (Firestorm980)
 * @github: https://github.com/Firestorm980/WindowThrottle
 * @version: 1.1
 *
 * Licensed under the MIT License.
 */
 
(function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define('WindowThrottle', factory(root));
	} else if ( typeof WindowThrottle === 'object' ) {
		module.WindowThrottle = factory(root);
	} else {
		root.WindowThrottle = factory(root);
	}
})(window || this, function (root) {
 
	'use strict';
 
	//
	// Variables
	//
 
	var WindowThrottle = {}; // Object for public APIs
	var supports = !!document.querySelector && !!root.addEventListener; // Feature test
	var settings; // Plugin settings
 	
	// Data to store
 	var windowData = {
		hasResized: false,
		hasScrolled: false,
		width: 0,
		height: 0,
		scrollPositionY: 0,
		scrollPositionX: 0,
		orientation: null
	};

	// Default settings
	var defaults = {
		// Options
		detectResize: true, // Set to detect resize
		detectScroll: true, // Set to detect scrolling
		pollingTime: 150, // Uses setInterval
		useRAF: false // Uses requestAnimationFrame. Falls back to a timeout.
	};
 
 
	//
	// Methods
	//
 
	/**
	 * A simple forEach() implementation for Arrays, Objects and NodeLists
	 * @private
	 * @param {Array|Object|NodeList} collection Collection of items to iterate
	 * @param {Function} callback Callback function for each iteration
	 * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
	 */
	var forEach = function (collection, callback, scope) {
		if (Object.prototype.toString.call(collection) === '[object Object]') {
			for (var prop in collection) {
				if (Object.prototype.hasOwnProperty.call(collection, prop)) {
					callback.call(scope, collection[prop], prop, collection);
				}
			}
		} else {
			for (var i = 0, len = collection.length; i < len; i++) {
				callback.call(scope, collection[i], i, collection);
			}
		}
	};
 
	/**
	 * Merge defaults with user options
	 * @private
	 * @param {Object} defaults Default settings
	 * @param {Object} options User options
	 * @returns {Object} Merged values of defaults and options
	 */
	var extend = function ( defaults, options ) {
		var extended = {};
		forEach(defaults, function (value, prop) {
			extended[prop] = defaults[prop];
		});
		forEach(options, function (value, prop) {
			extended[prop] = options[prop];
		});
		return extended;
	};
 
 	/**
 	 * Methods object from the original plugin. Encapsulates all plugin internal functions.
 	 * @type {Object}
 	 */
	var methods = {
		/**
		 * Plugin initalization function.
		 * @private
		 */
		init: function(){
			var windowElement = window;

			// Set rAF support
			// Normalizes the event through all browsers
			methods.setRAF();

			// Set event polyfill
			methods.events.polyfill();

			// Resize
			if ( settings.detectResize === true ){
				// Bind Events
				// Use resize and orientation change for mobile browsers
				windowElement.addEventListener('resize', function(){ windowData.hasResized = true; });
				windowElement.addEventListener('orientationchangei', function(){ windowData.hasResized = true; });

				// Set starting width and height
				windowData.width = windowElement.innerWidth;
				windowData.height = windowElement.innerHeight;	

				// Set starting orientation
				methods.resize.getOrientation( windowData.width, windowData.height );

				// Start up the resize function
				methods.resize.event(); // Run on page load
			}
			// Scrolling
			if ( settings.detectScroll === true ){
				// Bind event			
				windowElement.addEventListener('scroll', function(){ windowData.hasScrolled = true; });

				// Set starting scroll position
				windowData.scrollPositionY = windowElement.pageYOffset;
				windowData.scrollPositionX = windowElement.pageXOffset;

				// Start it up
				methods.scroll.event();
			}
			// Start polling
			methods.poll();
		},
		/**
		 * Polyfill function so that the requestAnimationFrame function is normalized between browsers.
		 */
		setRAF: function(){
			var windowElement = window;
			windowElement.requestAnimFrame = (function(callback) {
			return 	windowElement.requestAnimationFrame || 
					windowElement.webkitRequestAnimationFrame || 
					windowElement.mozRequestAnimationFrame || 
					windowElement.oRequestAnimationFrame || 
					windowElement.msRequestAnimationFrame ||
					// Fallback to a timeout in older browsers
					function(callback) {
						windowElement.setTimeout(callback, 1000 / 60);
					};
			})();
		},
		// Resize functions
		resize: {
			/**
			 * The resize event function. Handles all of the data we're interested in and triggers the 'wt.resize' event.
			 * @private
			 */
			event: function(){
				// Calculations
				var 
					windowElement = window,
					newWidth = windowElement.innerWidth,
					newHeight = windowElement.innerHeight,
					oldWidth = windowData.width,
					oldHeight = windowData.height,
					widthChanged = ( newWidth !== oldWidth ),
					heightChanged = ( newHeight !== oldHeight ),
					widthDelta = newWidth - oldWidth,
					heightDelta = newHeight - oldHeight;
				
				// Set orientation
				methods.resize.getOrientation( newWidth, newHeight );

				// Our event data
				var eventObject = {
					changed: { width: widthChanged, height: heightChanged },
					dimensions: { width: newWidth, height: newHeight },
					delta: { width: widthDelta, height: heightDelta },
					orientation: windowData.orientation
				};
				// Kick off the event
				methods.events.triggerCustom( windowElement, 'wt.resize', eventObject);
				// Update the window data
				windowData.width = newWidth;
				windowData.height = newHeight;
			},
			/**
			 * Gets the orientation of the viewport with matchMedia and using width/height as fallback. Puts the result into the windowData.orientation
			 * @param {number} width  The width of the window
			 * @param {number} height The height of the window
			 * @private
			 */
			getOrientation: function( width, height ){
				var windowElement = window;
				// Use match media if available. Much more accurate.
				if ( windowElement.matchMedia !== undefined ){
					if ( windowElement.matchMedia("(orientation: landscape)").matches ){ windowData.orientation = 'landscape'; }
					if ( windowElement.matchMedia("(orientation: portrait)").matches ){ windowData.orientation = 'portrait'; }
				}
				// Fallback to just using the dimensions
				else {
					if ( width > height || width === height ){ windowData.orientation = 'landscape'; }
					if ( width < height ){ windowData.orientation = 'portrait'; }
				}
			}
		},
		// Scrolling functions
		scroll: {
			/**
			 * The scrolling event function. Handles all of the data we're interested in and triggers the 'wt.scroll' event.
			 * @private
			 */
			event: function(){
				// Calculations
				var 
					windowElement = window,
					scrollY = windowElement.pageYOffset,
					scrollX = windowElement.pageXOffset,
					documentHeight = document.body.scrollHeight,
					documentWidth = document.body.scrollWidth,
					scrollPercentYRaw = ( scrollY / ( documentHeight - windowData.height ) ) * 100,
					scrollPercentXRaw = ( scrollX / ( documentWidth - windowData.width ) ) * 100,
					scrollPercentY = ( scrollPercentYRaw > 100 ) ? 100 : scrollPercentYRaw,
					scrollPercentX = ( scrollPercentXRaw > 100 ) ? 100 : scrollPercentXRaw,
					scrollDeltaY = scrollY - windowData.scrollPositionY,
					scrollDeltaX = scrollX - windowData.scrollPositionX;

				// Our event data
				var eventObject = {
					delta: { y: scrollDeltaY, x: scrollDeltaX },
					percent: { y: scrollPercentY, x: scrollPercentX }
				};
				// Kick off the event
				methods.events.triggerCustom( windowElement, 'wt.scroll', eventObject);
				// Update the window data
				windowData.scrollPositionY = scrollY;
				windowData.scrollPositionX = scrollX;
			}
		},
		/**
		 * Polling function that constantly runs in the background. The polling function will use rAF or setInterval, depending on user options.
		 * @private
		 */
		poll: function(){
			// Check if we're using rAF
			if ( settings.useRAF ){
				methods.checkForChanges(); // Check for changes
				requestAnimFrame( methods.poll ); // Run another poll when ready. Uses our polyfill function.
			}
			// Use setInterval instead
			else {
				// Check for changes using the polling time in the settings.
				setInterval( methods.checkForChanges, settings.pollingTime);
			}
		},
		/**
		 * Function to run at every polling time to see if anything changed since the last poll time.
		 * If something did change and we want to know about it, change the windowData appropriately so we can emit our event.
		 * @private
		 */
		checkForChanges: function(){
			// Check if we've scrolled and if we're interested
			if ( windowData.hasScrolled && settings.detectScroll === true ){
				methods.scroll.event(); // Do our scroll event
				windowData.hasScrolled = false; // Reset the boolean
			}
			// Check if we've resized and if we're interested
			if ( windowData.hasResized && settings.detectResize === true ){
				methods.resize.event(); // Do our resize event
				windowData.hasResized = false; // Reset the boolean
			}
		},
		// Special events functions
		events: {
			/**
			 * CustomEvent polyfill from MDN. Creates the custom event function for older browsers.
			 * @source: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
			 * @private
			 */
			polyfill: function () {
				function CustomEvent ( event, params ) {
					params = params || { bubbles: false, cancelable: false, detail: undefined };
					var evt = document.createEvent( 'CustomEvent' );
					evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
					return evt;
				}
				CustomEvent.prototype = window.Event.prototype;
				window.CustomEvent = CustomEvent;
			},
			/**
			 * Set off our custom events from the plugin.
			 * @param  {Object} el          The document element to attach the event to.
			 * @param  {String} eventName   The name of the event (in our case, "wt.resize").
			 * @param  {Object} eventObject The event data to include.
			 */
			triggerCustom: function( el, eventName, eventObject ){
				var event = new CustomEvent(eventName, {detail: eventObject});
				el.dispatchEvent(event);
			}
		}
	};
 
	/**
	 * Initialize Plugin
	 * @public
	 * @param {Object} options User settings
	 */
	Windowwt.init = function ( options ) {
 
		// feature test
		if ( !supports ) return;
 
		// Options
		settings = extend( settings || defaults, options || {} );  // Merge user options with defaults

		// Start it up
		methods.init();
 
	};
 
	//
	// Public APIs
	//
 
	return WindowThrottle;
 
});