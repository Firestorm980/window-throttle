jQuery Window Throttle
======================
##The overdone window event plugin

jQuery Window Throttle (jQWT) normalizes and throttles the window scroll and resize events between browsers while also offering some great event data so that you stop calculating values and just get things done. jQWT uses either a custom interval timeout or Request Animation Frame to poll the window for any changes in size or scroll position. jQWT returns the following data:

####Scroll
- Scroll percentage down the page (event.percent)
- Scroll delta from the previous polling position (event.delta)

####Resize
- Orientation, landscape or portrait (event.orientation)
- A boolean of if the width or height changed (event.changed.width, event.changed.height)
- Delta in width and height from previous polling position (event.delta.width, event.delta.height)
- The new dimensions of the window (event.dimensions.width, event.dimensions.height)

#Getting Started
####Installation
Load the jQWT script after you load jQuery on your pages and initiate it.

```HTML
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="/path-to-source/jquery.windowThrottle.js"></script>
```

####Use
It's important that you bind to the "throttle.resize" and "throttle.scroll" events before starting up the plugin. This way, the events will fire immediately when the page is ready, allowing your scripts to work their magic as soon as possible. You'll want to bind the window to the custom events that come from jQWT like so: 
```HTML
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="/path-to-source/jquery.windowThrottle.js"></script>
<script>
	jQuery(document).ready(function($) {
		jQuery(window).on('throttle.resize', function(event){ 
			// Do your stuff here
			// Access the data using the event object (ex. "event.orientation")
		});
		jQuery(window).on('throttle.scroll', function(event){ 
			// Do your stuff here
			// Access the data using the event object (ex. "event.delta")
		});

		$.windowThrottle();
	});
</script>
```

#####Event Data
Here are two examples of the event data returned when one of the custom events is triggered.

######Scrolling
```Javascript
event: {
	delta: 0,
	percent: 0	
}
```
######Resize
```Javascript
event: {
	changed: { width: false, height: false },
	dimensions: { width: 1280, height: 720 },
	delta: { width: 0, height: 0 },
	orientation: 'landscape'
}
```

####Options
These are the options currently available for jQWT:

| Option       | Type   | Default        | Description                                                             |
|--------------|--------|----------------|-------------------------------------------------------------------------|
| `detectResize`  | `boolean` | `true`   | Bind the resize event               |
| `detectScroll`  | `boolean` | `true`   | Bind the scroll event |
| `pollingTime`   | `number`  | `150`    | Set the amount of time between polling in milliseconds. Disabled if `useRAF` is `true`. |
| `useRAF`        | `boolean` | `false`  | Use window.requestAnimationFrame. Overrides `pollingTime`. Falls back to setTimeout in older browsers. |