# What is this?
DOM5 is a Vanilla JS DOM manipulation library for modern (Chrome 5+, Firefox 3.6+, IE9+) browsers with a jQuery-like chainable syntax.

# How does it work?
DOM5 creates a mixin in the prototype chains of the DOM elements & the document itself:
```
before: DOMNode -> ... -> HTMLElement.prototype -> Element.prototype -> ...
after: DOMNode -> ... -> HTMLElement.prototype -> {DOM5} -> Element.prototype -> ...
```
After this you can access all methods of DOM5 in context of the current DOMNode at the same time with using the native DOM elements' stuff like "appendChild", "style", "addEventListener" etc. For the list of these methods look into [lib/dom5.js](https://github.com/1999/dom5/blob/master/lib/dom5.js), it's really simple.

# I don't like mixins in the prototype chains
You can also use [DOM2](http://github.com/1999/dom2) library which has a similar syntax and adds "$" (get DOM element) and "$$" (get all DOM elements) functions to window. Using these functions you can get objects associated with the DOM nodes (HTMLElements or NodeLists).

# Usage
```javascript
document.addEventListener("DOMContentLoaded", function () {
	var elem = document.createElement("span");
	elem.innerHTML = "smth";

	// native syntax
	if (document.body.hasChildNodes()) {
		document.body.insertBefore(elem, document.body.firstChild);
	} else {
		document.body.appendChild(elem);
	}

	// DOM5, the same action
	document.body.prepend(elem);
}, false);
```