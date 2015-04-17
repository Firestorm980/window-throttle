/**
 * jQuery Window Throttle
 * @author: Jon Christensen (Firestorm980)
 * @github: https://github.com/Firestorm980/WindowThrottle
 * @version: 0.1
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
		pollingTime: 150, // Uses setInterval
		useRAF: true // Uses requestAnimationFrame
	};

	$.windowThrottle = function(options){
		var settings = $.extend({}, defaults, options);

		var windowData = {
			hasResized: false,
			hasScrolled: false,
			width: 0,
			height: 0,
			scrollPosition: 0
		};

		var methods = {
			/**
			 * init
			 * ----
			 * Plugin startup function.
			 */
			init: function(){
				var $window = jQuery(window);

				$window.on('scroll', function(){ windowData.hasScrolled = true; });
				$window.on('resize', function(){ windowData.hasResized = true; });

				windowData.width = $window.width();
				windowData.height = $window.height();

				methods.resize.init();
				methods.scroll.init();
			},
			resize: {
				init: function(){
					methods.resize.event(); // Run on page load
					methods.poll();
				},
				event: function(){
					var 
						$window = jQuery(window),
						newWidth = $window.width(),
						newHeight = $window.height(),
						oldWidth = windowData.width,
						oldHeight = windowData.height,
						widthChanged = ( newWidth !== oldWidth ),
						heightChanged = ( newHeight !== oldHeight );

					var eventObject = {
						type: 'throttle.resize',
						widthChanged: widthChanged,
						heightChanged: heightChanged,
						width: newWidth,
						height: newHeight
					};

					$window.trigger( eventObject );
					windowData.width = $window.width();
					windowData.height = $window.height();
				}
			},
			scroll: {
				init: function(){
					methods.scroll.event(); // Run on page load
					methods.poll();
				},
				event: function(){
					var 
						$window = jQuery(window),
						scrollTop = $window.scrollTop(),
						documentHeight = jQuery(document).height(),
						scrollPercent = scrollTop / documentHeight,
						scrollDelta = windowData.scrollPosition - scrollTop;

					var eventObject = {
						type: 'throttle.scroll',
						delta: scrollDelta,
						percent: scrollPercent
					};

					$window.trigger( eventObject );
				}
			},
			poll: function(){
				var polling = false;
				if ( settings.useRAF ){
					methods.checkForChanges();
					requestAnimationFrame( methods.poll );
				}
				else if ( !polling ){
					polling = true;
					setInterval( methods.checkForChanges, settings.pollingTime);
				}
			},
			checkForChanges: function(){
				if ( windowData.hasScrolled ){
					methods.scroll.event();
					windowData.hasScrolled = false;
				}
				if ( windowData.hasResized ){
					methods.resize.event();
					windowData.hasResized = false;
				}
			}
		};

		// Start everything
		methods.init();

		// Public Methods
		return {
			/**
			 * load
			 * ----
			 * Programically load in a new page. Treats it like a link, adding a new history entry.
			 * 
			 * @param  {[string]} url [The URL of the page to load.]
			 */
			load: function(url){
				var samePage = checkSamePage( currentLocation, url);
				if ( typeof url === 'string' && !samePage){
					methods.loadResource(url, true);
				}
			}
		};
	};
})( jQuery );