/**
 * Window Throttle
 * @author: Jon Christensen (Firestorm980)
 * @github: https://github.com/Firestorm980/WindowThrottle
 * @version: 1.3
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
		orientation: null,
		documentHeight: 0,
		documentWidth: 0
	};

	var scheduledAnimationFrame = false;

	// Default settings
	var defaults = {
		// Options
		detectResize: true, // Set to detect resize
		detectScroll: true, // Set to detect scrolling
		scrollClass: 'wt-scrolling', // Class while scrolling
		resizeClass: 'wt-resizing', // Class while resizing
		debounce: false, // Debounce instead?
		debounceTime: 250 // Time to wait to fire for debouncing
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
				// Set starting width and height
				windowData.width = windowElement.innerWidth;
				windowData.height = windowElement.innerHeight;
				windowData.documentHeight = document.body.scrollHeight;
				windowData.documentWidth = document.body.scrollWidth;

				// Set starting orientation
				methods.resize.getOrientation( windowData.width, windowData.height );

				// Bind Events
				// Use resize and orientation change for mobile browsers
				windowElement.addEventListener('resize', methods.resize.on);
				windowElement.addEventListener('orientationchange', methods.resize.on);

				// Start up the resize function
				methods.resize.event(); // Run on page load
			}
			// Scrolling
			if ( settings.detectScroll === true ){
				// Set starting scroll position
				windowData.scrollPositionY = windowElement.pageYOffset;
				windowData.scrollPositionX = windowElement.pageXOffset;

				// Bind event			
				windowElement.addEventListener('scroll', methods.scroll.on);

				// Start it up
				methods.scroll.event();
			}
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
			timeoutClass: null,
			timeoutDebounce: null,
			lastEventObject: false,
			/**
			 * Function that starts handling the raw event for us.
			 * @private
			 */
			on: function(){
				var htmlEl = document.querySelector('html');
				// Set so we know we've resized.
				windowData.hasResized = true;
				// If using rAF, do some different checking.
				if ( !settings.debounce ){
					methods.checkAnimationFrame();
				}
				else {
					if ( methods.resize.timeoutDebounce ) {
						clearTimeout( methods.resize.timeoutDebounce );
					}
					methods.resize.timeoutDebounce = setTimeout( methods.resize.event, settings.debounceTime );
				}
				
				// Set the resize class if it isn't there
				if ( !htmlEl.classList.contains(settings.resizeClass) ){
					htmlEl.classList.add(settings.resizeClass);
				}
			},
			/**
			 * The resize event function. Handles all of the data we're interested in and triggers the 'wt.resize' event.
			 * @private
			 */
			event: function(){
				// Calculations
				var 
					windowElement = window,
					// New document dimensions to store
					newDocumentHeight = document.body.scrollHeight,
					newDocumentWidth = document.body.scrollWidth,
					// Get the width and height
					newWidth = windowElement.innerWidth,
					newHeight = windowElement.innerHeight,
					eventObject = methods.resize.getEventObject();

				// Kick off the event
				requestAnimFrame( function(){ 
					// Trigger vanilla
					methods.events.triggerCustom( windowElement, 'wt.resize', eventObject); 
					// Trigger jQuery
					if ( window.jQuery ){
						jQuery(window).trigger( eventObject );
					}
					methods.resize.lastEventObject = eventObject;
					// Reset timeout for class
					methods.resize.resetTimeout( 100 );
					// Reset frame
					scheduledAnimationFrame = false;
				} );
				
				// Update the window data for the next pass
				windowData.width = newWidth;
				windowData.height = newHeight;
				windowData.documentHeight = newDocumentHeight;
				windowData.documentWidth = newDocumentWidth;
				// Reset our vars
				windowData.hasResized = false;
			},
			/**
			 * Grab all our event data in one spot.
			 * @return {object} [An array like event object for us to use.]
			 */
			getEventObject: function(){
				// Calculations
				var 
					// New document dimensions to store
					newDocumentHeight = document.body.scrollHeight,
					newDocumentWidth = document.body.scrollWidth,
					// Get the width and height
					windowElement = window,
					newWidth = windowElement.innerWidth,
					newHeight = windowElement.innerHeight,
					oldWidth = windowData.width,
					oldHeight = windowData.height,
					// Compare the width and height
					widthChanged = ( newWidth !== oldWidth ),
					heightChanged = ( newHeight !== oldHeight ),
					// Find the change in the width and height
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

				// Include type for jQuery
				if ( window.jQuery ){
					eventObject.type = 'wt.resize';
				}

				return eventObject;
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
			},
			/**
			 * Controls a timeout that we have during the event.
			 * Mainly controls a class during scrolling for optional style changes.
			 * @param  {[number]} pollingTime The timeout length to set.
			 */
			resetTimeout: function( pollingTime ){
				if ( methods.resize.timeoutClass ){
					clearTimeout( methods.resize.timeoutClass );
				}
				methods.resize.timeoutClass = setTimeout(function removeResizeClass(){ 
					var eventObject = ( !methods.resize.lastEventObject ) ? methods.resize.getEventObject() : methods.resize.lastEventObject;

					// Remove the resize class
					document.querySelector('html').classList.remove(settings.resizeClass); 

					// Fire off our end resize event.
					// Trigger vanilla
					methods.events.triggerCustom( window, 'wt.resizeEnd', eventObject);
					// Trigger jQuery
					if ( window.jQuery ){
						jQuery(window).trigger( eventObject );
					}
				}, pollingTime);
			}
		},
		// Scrolling functions
		scroll: {
			timeoutClass: null,
			timeoutDebounce: null,
			lastEventObject: false,
			/**
			 * Function that starts handling the raw event for us.
			 * @private
			 */
			on: function(){
				var htmlEl = document.querySelector('html');
				// Set so we know we've scrolled.
				windowData.hasScrolled = true;
				// If using rAF, do some different checking.
				if ( !settings.debounce ){
					methods.checkAnimationFrame();
				}
				else {
					if ( methods.scroll.timeoutDebounce ) {
						clearTimeout( methods.scroll.timeoutDebounce );
					}
					methods.scroll.timeoutDebounce = setTimeout( methods.scroll.event, settings.debounceTime );
				}

				// Set the scrolling class if it isn't there
				if ( !htmlEl.classList.contains(settings.scrollClass) ){
					htmlEl.classList.add(settings.scrollClass);
				}
			},
			/**
			 * The scrolling event function. Handles all of the data we're interested in and triggers the 'wt.scroll' event.
			 * @private
			 */
			event: function(){
				// Calculations
				var 
					windowElement = window,
					// Raw scroll down the page
					scrollY = windowElement.pageYOffset,
					scrollX = windowElement.pageXOffset,
					eventObject = methods.scroll.getEventObject();

				// Kick off the event
				requestAnimFrame( function(){ 
					// Trigger vanilla
					methods.events.triggerCustom( windowElement, 'wt.scroll', eventObject);
					// Trigger jQuery
					if ( window.jQuery ){
						jQuery(window).trigger( eventObject );
					}
					methods.scroll.lastEventObject = eventObject;
					// Reset timeout for class
					methods.scroll.resetTimeout( 100 );
					// Reset frame
					scheduledAnimationFrame = false;
				} );
				
				// Update the window data for the next pass
				windowData.scrollPositionY = scrollY;
				windowData.scrollPositionX = scrollX;
				// Reset our vars
				windowData.hasScrolled = false;
			},
			/**
			 * Grab all our event data in one spot.
			 * @return {object} [An array like event object for us to use.]
			 */
			getEventObject: function(){
				// Calculations
				var 
					windowElement = window,
					// Raw scroll down the page
					scrollY = windowElement.pageYOffset,
					scrollX = windowElement.pageXOffset,
					// Scroll percentage down the page
					documentHeight = windowData.documentHeight,
					documentWidth = windowData.documentWidth,
					scrollPercentYRaw = ( scrollY / ( documentHeight - windowData.height ) ) * 100,
					scrollPercentXRaw = ( scrollX / ( documentWidth - windowData.width ) ) * 100,
					scrollPercentY = methods.scroll.getScrollPercent( scrollPercentYRaw ),
					scrollPercentX = methods.scroll.getScrollPercent( scrollPercentXRaw ),
					// Compare current and previous positions, give us the change
					scrollDeltaY = scrollY - windowData.scrollPositionY,
					scrollDeltaX = scrollX - windowData.scrollPositionX;

				// Our event data
				var eventObject = {
					delta: { y: scrollDeltaY, x: scrollDeltaX },
					percent: { y: scrollPercentY, x: scrollPercentX },
					scroll: { y: scrollY, x: scrollX }
				};

				// Include type for jQuery
				if ( window.jQuery ){
					eventObject.type = 'wt.scroll';
				}

				return eventObject;
			},
			/**
			 * Normalizes the raw scroll percentage on either end so that it stays within a 0-100 range.
			 * @param  {[number]} rawPercent The raw percentage calculated
			 * @return {[number]}            The normalized percentage
			 */
			getScrollPercent: function( rawPercent ){
				var percent = 0; // Our eventual percent

				if ( rawPercent < 0 ){ percent = 0; } // If its smaller than 0, keep it at 0
				else if ( rawPercent > 100 ){ percent = 100; } // If its bigger than 100, keep it at 100
				else { percent = rawPercent; } // Otherwise, give us what you got

				return percent; // Return it
			},
			/**
			 * Controls a timeout that we have during the event.
			 * Mainly controls a class during scrolling for optional style changes.
			 * @param  {[number]} pollingTime The timeout length to set.
			 */
			resetTimeout: function( pollingTime ){
				if ( methods.scroll.timeoutClass ){
					clearTimeout( methods.scroll.timeoutClass );
				}
				methods.scroll.timeoutClass = setTimeout(function removeScrollClass(){ 
					var eventObject = ( !methods.scroll.lastEventObject ) ? methods.scroll.getEventObject() : methods.scroll.lastEventObject;

					// Remove the scrolling class
					document.querySelector('html').classList.remove(settings.scrollClass); 

					// Throw out a scrollEnd event. 
					// Trigger vanilla
					methods.events.triggerCustom( window, 'wt.scrollEnd', eventObject);
					// Trigger jQuery
					if ( window.jQuery ){
						jQuery(window).trigger( eventObject );
					}
				}, pollingTime);
			}
		},
		/**
		 * Polling function that constantly runs in the background. The polling function will use setInterval.
		 * @private
		 */
		poll: function(){
			// Check if we're using rAF
			if ( !settings.useRAF ){
				// Check for changes using the polling time in the settings.
				setInterval( methods.checkForChanges, settings.pollingTime);
			}
		},
		/**
		 * Function runs at every native scroll and resize event.
		 * It checks if we're currently working on a frame. If we aren't, it queues up a new one with the event.
		 * @private
		 */
		checkAnimationFrame: function(){
			// Is there already a frame being processed?
			// If not, keep going
			if ( !scheduledAnimationFrame ){
				// We're processing a frame. Make sure we don't double up.
				scheduledAnimationFrame = true; 
				// Do we want scroll events?
				if ( windowData.hasScrolled && settings.detectScroll === true ){
					methods.scroll.event(); // Do our scroll event
				}
				// Do we want resize events?
				if ( windowData.hasResized && settings.detectResize === true ){
					methods.resize.event(); // Do our resize event
				}
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
	WindowThrottle.init = function ( options ) {
 
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