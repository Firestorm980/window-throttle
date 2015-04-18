/**
 * jQuery Window Throttle
 * @author: Jon Christensen (Firestorm980)
 * @github: https://github.com/Firestorm980/WindowThrottle
 * @version: 1.0
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

	$.windowThrottle = function(options){
		var settings = $.extend({}, defaults, options);

		var windowData = {
			hasResized: false,
			hasScrolled: false,
			width: 0,
			height: 0,
			scrollPosition: 0,
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
					methods.resize.setOrientation( windowData.width, windowData.height );
					// Start up the resize function
					methods.resize.event(); // Run on page load
				}
				// Scrolling
				if ( settings.detectScroll === true ){
					// Bind event
					// Use scroll and touchmove for older mobile browsers
					$window.on('scroll', function(){ windowData.hasScrolled = true; });	
					// Set starting scroll position
					windowData.scrollPosition = $window.scrollTop();	
					// Start it up
					methods.scroll.event();
				}
				// Start polling
				methods.poll();
			},
			setRAF: function(){
				window.requestAnimFrame = (function(callback) {
				return 	window.requestAnimationFrame || 
						window.webkitRequestAnimationFrame || 
						window.mozRequestAnimationFrame || 
						window.oRequestAnimationFrame || 
						window.msRequestAnimationFrame ||
						// Fallback to a timeout in older browsers
						function(callback) {
							window.setTimeout(callback, 1000 / 60);
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
					methods.resize.setOrientation( newWidth, newHeight );
					// Our event data
					var eventObject = {
						type: 'throttle.resize',
						changed: { width: widthChanged, height: heightChanged },
						dimensions: { width: newWidth, height: newHeight },
						delta: { width: widthDelta, height: heightDelta },
						orientation: methods.resize.getOrientation()
					};
					// Kick off the event
					$window.trigger( eventObject );
					// Update the window data
					windowData.width = newWidth;
					windowData.height = newHeight;
				},
				setOrientation: function( width, height ){
					// Use match media if available. Much more accurate.
					if ( window.matchMedia !== undefined ){
						if ( window.matchMedia("(orientation: landscape)").matches ){ windowData.orientation = 'landscape'; }
						if ( window.matchMedia("(orientation: portrait)").matches ){ windowData.orientation = 'portrait'; }
					}
					// Fallback to just using the dimensions
					else {
						if ( width > height || width === height ){ windowData.orientation = 'landscape'; }
						if ( width < height ){ windowData.orientation = 'portrait'; }
					}
				},
				getOrientation: function(){
					// Use match media if available. Much more accurate.
					if ( window.matchMedia !== undefined ){
						if ( window.matchMedia("(orientation: landscape)").matches ){ return 'landscape'; }
						if ( window.matchMedia("(orientation: portrait)").matches ){ return 'portrait'; }
					}
					// Fallback to just using the dimensions
					else {
						if ( windowData.width > windowData.height || windowData.width === windowData.height ){ return 'landscape'; }
						if ( windowData.width < windowData.height ){ return 'portrait'; }
					}
				}
			},
			scroll: {
				event: function(){
					// Calculations
					var 
						$window = jQuery(window),
						scrollTop = $window.scrollTop(),
						documentHeight = jQuery(document).height(),
						scrollPercent = Math.round( ( scrollTop / ( documentHeight - windowData.height ) ) * 100 ),
						scrollDelta = scrollTop - windowData.scrollPosition;
					// Our event data
					var eventObject = {
						type: 'throttle.scroll',
						delta: scrollDelta,
						percent: scrollPercent
					};
					// Kick off the event
					$window.trigger( eventObject );
					// Update the window data
					windowData.scrollPosition = scrollTop;
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

		// Start everything
		methods.init();

		// Public Methods
		return {

		};
	};
})( jQuery );