Window Throttle
===============
##The overdone window event plugin

Window Throttle (WT) normalizes and throttles the window scroll and resize events between browsers while also offering some great event data so that you stop calculating values and just get things done. WT uses Request Animation Frame during window events to get the best performance and timing. It is made entirely with vanilla JS, but has support for jQuery events. As of version 1.3, WT also supports optional debouncing. WT returns the following data:

####Scroll
- Scroll percentage in either direction on the page (event.percent)
- Scroll delta in either direction from the previous polling position (event.delta)
- Scroll position in either direction (event.scroll)

####Resize
- Orientation, landscape or portrait (event.orientation)
- A boolean of if the width or height changed (event.changed.width, event.changed.height)
- Delta in width and height from previous polling position (event.delta.width, event.delta.height)
- The new dimensions of the window (event.dimensions.width, event.dimensions.height)

#Getting Started
####Installation
Load the WT script before your custom scripts.

```HTML
<script src="/path-to-source/windowThrottle.js"></script>
```

Or load the jQuery WT script after you load jQuery on your pages.


```HTML
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="/path-to-source/jquery.windowThrottle.js"></script>
```

####Use
It's important that you bind to the "wt.resize" and "wt.scroll" events before starting up the plugin. This way, the events will fire immediately when the page is ready, allowing your scripts to work their magic as soon as possible. You'll want to bind the window to the custom events that come from WT like so: 

```HTML
<script>
	(function($) {

        window.addEventListener('wt.resize', function(event){ 
			// Do your stuff here
			// Access the data using the event object (ex. "event.detail.orientation")
        }, false);
        window.addEventListener('wt.scroll', function(event){
			// Do your stuff here
			// Access the data using the event object (ex. "event.detail.delta")        	
        }, false);

        WindowThrottle.init({ /* Options here */ });

	})();
</script>
```

With jQuery:

```HTML
<script>
	jQuery(document).ready(function($) {
		jQuery(window).on('wt.resize', function(event){ 
			// Do your stuff here
			// Access the data using the event object (ex. "event.orientation")
		});
		jQuery(window).on('wt.scroll', function(event){ 
			// Do your stuff here
			// Access the data using the event object (ex. "event.delta")
		});

		jQuery.WindowThrottle({ /* Options here */ });
	});
</script>
```

##### Event Data
Here are two examples of the event data returned when one of the custom events is triggered. Keep in mind that when using the vanilla version the event object is slightly different. You'll need to access data with "event.details", where jQuery you'll just need "event".

###### Scrolling
```Javascript
{
	delta: { y: 0, x: 0 },
	percent: { y: 0, x: 0 },
	scroll: { y: 0, x: 0 }
}
```
###### Resize
```Javascript
{
	changed: { width: false, height: false },
	dimensions: { width: 1280, height: 720 },
	delta: { width: 0, height: 0 },
	orientation: 'landscape'
}
```

#### Options
These are the options currently available for WT:

| Option       | Type   | Default              | Description                                                       |
|--------------|--------|----------------------|-------------------------------------------------------------------|
| `detectResize`  | `boolean` | `true`         | Bind the resize event |
| `detectScroll`  | `boolean` | `true`         | Bind the scroll event |
| `scrollClass`   | `string`  | `wt-scrolling` | Class that will be added to the `html` element during scroll |
| `resizeClass`   | `string`  | `wt-resize`    | Class that will be added to the `html` element during resize |
| `debounce`      | `boolean` | `false`        | Debounce the events instead of throttle them. Disables the `wt.scrollEnd` and `wt.resizeEnd` events |
| `debounceTime`  | `number`  | `250`          | Controls sensitivity of the debouncer. Smaller number is more sensitive. Also controls sensitivity of the "end" events when `debounce` is set to `false` |

#### Events

##### End Events
As of version 1.3, additional events will now fire at the end of both scrolling and resizing. They are `wt.scrollEnd` and `wt.resizeEnd` respectively. This can give you the opportunity to bind events *after* those interactions are completed. Notice that this is very similar and could be used similarly to debouncing. The difference being that when debouncing is on, no events will fire at all *during* the interaction. Since the `wt.scroll` and `wt.resize` events would fire at the same time with deboucning on, the end events are disabled when the `debounce` option is `true`.

#### Methods
There are now multiple methods for WT.

##### Init
Starts up the plugin. Put in options from above if you'd like to change them.

```Javascript
WindowThrottle.init({ // options... });
```

##### Is
Returns a boolean value based on if the user is currently scrolling or resizing. This could be useful if you'd like something to happen in response to these events, but not while a user is actively interacting with the page.

```Javascript
// Check if user is currently scrolling
WindowThrottle.is('scrolling');

// Check if user is currently resizing
WindowThrottle.is('resizing');
```

## Changelog

####1.3.1
- Fixed an issue with 'classList' and IE9. IE9 doesn't support that and it's methods, so implemented a fallback.

####1.3
- Removed legacy polling in favor of always using requestAnimationFrame with a fallback.
- Added debouncing as an option. Only fires an event at the end of interaction vs multiple events during.
- Added `wt.scrollEnd` and `wt.resizeEnd` events.
- Added the `WindowThrottle.is()` method as a boolean check.
- Added classes during events that can be optionally changed. This could be useful for deactivating certain styles while interaction is occuring.
- Further code impovements and organization interally.

####1.2
- Added scrolling data for page position (essentially `scrollTop` and `scrollLeft`)
- Added another demo for optimization and performance use (testing for rAF).

####1.1
- Added scrolling data for the horizontal axis.
- Fixed some inconsistencies in the functions being used for calculations.

####1.0
Initial release.
