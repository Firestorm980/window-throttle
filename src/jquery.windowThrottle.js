/**
 * jQuery Window Throttle
 * @author: Jon Christensen (Firestorm980)
 * @github: https://github.com/Firestorm980/WindowThrottle
 * @version: 1.1
 *
 * Licensed under the MIT License.
 */

// the semi-colon before the function invocation is a safety
// net against concatenated scripts and/or other plugins
// that are not closed properly.
;(function ( $ ) {

	// Create the defaults once
	var defaults = {
		// Options
		detectResize: true, // Set to detect resize
		detectScroll: true, // Set to detect scrolling
		pollingTime: 150, // Uses setInterval
		useRAF: false // Uses requestAnimationFrame. Falls back to a timeout.
	};

	$.WindowThrottle = function(options){
		var settings = $.extend({}, defaults, options);

		var windowData = {
			hasResized: false,
			hasScrolled: false,
			width: 0,
			height: 0,
			scrollPositionY: 0,
			scrollPositionX: 0,
			orientation: null
		};

		var methods = {
			/**
			 * init
			 * ----
			 * Plugin startup function.
			 */
			init: function(){
				var $window = jQuery(window);

				// Set rAF support
				// Normalizes the event through all browsers
				methods.setRAF();

				// Resize
				if ( settings.detectResize === true ){
					// Bind Events
					// Use resize and orientation change for mobile browsers
					$window.on('resize orientationchange', function(){ windowData.hasResized = true; });
					// Set starting width and height
					windowData.width = $window.width();
					windowData.height = $window.height();
					// Set starting orientation
					methods.resize.getOrientation( windowData.width, windowData.height );
					// Start up the resize function
					methods.resize.event(); // Run on page load
				}
				// Scrolling
				if ( settings.detectScroll === true ){
					// Bind event
					// Use scroll and touchmove for older mobile browsers
					$window.on('scroll', function(){ windowData.hasScrolled = true; });	
					// Set starting scroll position
					windowData.scrollPositionY = $window.scrollTop();
					windowData.scrollPositionX = $window.scrollLeft();	
					// Start it up
					methods.scroll.event();
				}
				// Start polling
				methods.poll();
			},
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
			resize: {
				event: function(){
					// Calculations
					var 
						$window = jQuery(window),
						newWidth = $window.width(),
						newHeight = $window.height(),
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
						type: 'wt.resize',
						changed: { width: widthChanged, height: heightChanged },
						dimensions: { width: newWidth, height: newHeight },
						delta: { width: widthDelta, height: heightDelta },
						orientation: windowData.orientation
					};
					// Kick off the event
					$window.trigger( eventObject );
					// Update the window data
					windowData.width = newWidth;
					windowData.height = newHeight;
				},
				getOrientation: function(){
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
			scroll: {
				event: function(){
					// Calculations
					var 
						$window = jQuery(window),
						scrollY = $window.scrollTop(),
						scrollX = $window.scrollLeft(),
						documentHeight = jQuery(document).height(),
						documentWidth = jQuery(document).width(),
						scrollPercentYRaw = ( scrollY / ( documentHeight - windowData.height ) ) * 100,
						scrollPercentXRaw = ( scrollX / ( documentWidth - windowData.width ) ) * 100,
						scrollPercentY = ( scrollPercentYRaw > 100 ) ? 100 : scrollPercentYRaw,
						scrollPercentX = ( scrollPercentXRaw > 100 ) ? 100 : scrollPercentXRaw,
						scrollDeltaY = scrollY - windowData.scrollPositionY,
						scrollDeltaX = scrollX - windowData.scrollPositionX;

					// Our event data
					var eventObject = {
						type: 'wt.scroll',
						delta: { y: scrollDeltaY, x: scrollDeltaX },
						percent: { y: scrollPercentY, x: scrollPercentX }
					};
					// Kick off the event
					$window.trigger( eventObject );
					// Update the window data
					windowData.scrollPositionY = scrollY;
					windowData.scrollPositionX = scrollX;
				}
			},
			poll: function(){
				// Check if we're using rAF
				if ( settings.useRAF ){
					methods.checkForChanges(); // Check for changes
					requestAnimFrame( methods.poll ); // Run another poll when ready
				}
				// Use setInterval instead
				else {
					setInterval( methods.checkForChanges, settings.pollingTime);
				}
			},
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
			}
		};

		// Start it up.
		methods.init();

		// Public Methods
		return {

		};
	};
})( jQuery );