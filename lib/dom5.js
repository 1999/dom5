/**
 * Copyright (c) 2012-2013 Dmitry Sorin <info@staypositive.ru>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * @author Dmitry Sorin <info@staypositive.ru>
 * @license http://www.opensource.org/licenses/mit-license.html MIT License
 */
(function () {
	"use strict";

	var matchesSelectorFn = (Element.prototype.matchesSelector || Element.prototype.webkitMatchesSelector || Element.prototype.mozMatchesSelector);
	var DOM5Element = {
		find: function (selector) {
			var elem = null;
			var childNodes, i;

			if (selector.charAt(0) === ">") {
				for (var i = 0; i < this.childNodes.length; i++) {
					if (matchesSelectorFn.call(childNodes[i], selector.substr(1))) {
						elem = childNodes[i];
						break;
					}
				}
			} else {
				elem = this.querySelector(selector);
			}

			if (!elem)
				return null;

			return elem;
		},

		/**
		 * @param {String} selector btw,  "> smth.class" selectors are also supported (childNodes)
		 * @param {Function} callback invokes:
		 *		{Number} element index in NodeList, this refers to DOMNode
		 */
		findAll: function (selector, callback) {
			var elems;

			if (selector.charAt(0) === ">") {
				elems = Array.prototype.filter.call(this.childNodes, function (elem) {
					return matchesSelectorFn.call(elem, selector.substr(1));
				});
			} else {
				elems = this.querySelectorAll(selector);
			}

			Array.prototype.map.call(elems, function (elem, index) {
				callback.call(elem, index);
			});
		},

		/**
		 * Selector nodes count
		 */
		total: function (selector) {
			if (selector.charAt(0) === ">") {
				return Array.prototype.filter.call(this.childNodes, function (elem) {
					return matchesSelectorFn.call(elem, selector.substr(1));
				}).length;
			} else {
				return this.querySelectorAll(selector).length;
			}
		},

		clone: function (deep) {
			return this.cloneNode(deep);
		},

		html: function (newHTML) {
			if (newHTML !== undefined) {
				this.innerHTML = newHTML;
				return this;
			} else {
				return this.innerHTML;
			}
		},

		plaintext: function (newContent) {
			if (newContent !== undefined) {
				this.textContent = newContent;
				return this;
			} else {
				return this.textContent;
			}
		},

		empty: function () {
			return this.html("");
		},

		/**
		 * @param {HTMLElement|Array}
		 */
		append: function (elements) {
			if (elements instanceof Array) {
				var frag = document.createDocumentFragment();
				for (var i = 0; i < elements.length; i++) {
					frag.appendChild(elements[i]);
				}

				this.appendChild(frag);
			} else {
				this.appendChild(elements);
			}

			return this;
		},

		/**
		 * @param {HTMLElement|Array}
		 */
		prepend: function (elements) {
			var element;

			if (elements instanceof Array) {
				element = document.createDocumentFragment();
				for (var i = 0; i < elements.length; i++) {
					element.appendChild(elements[i]);
				}
			} else {
				element = elements;
			}

			if (this.hasChildNodes()) {
				this.insertBefore(element, this.childNodes[0]);
			} else {
				this.append(element);
			}

			return this;
		},

		/**
		 * @param {HTMLElement|Array}
		 */
		after: function (elements) {
			var element = elements;

			if (elements instanceof Array) {
				var frag = document.createDocumentFragment();
				for (var i = 0; i < elements.length; i++) {
					frag.appendChild(elements[i]);
				}

				element = frag;
			}

			if (this.nextSibling === null) {
				this.parentNode.appendChild(element);
			} else {
				this.parentNode.insertBefore(element, this.nextSibling);
			}

			return this;
		},

		/**
		 * @param {HTMLElement|Array}
		 */
		before: function (elements) {
			var element = elements;

			if (elements instanceof Array) {
				var frag = document.createDocumentFragment();
				for (var i = 0; i < elements.length; i++) {
					frag.appendChild(elements[i]);
				}

				element = frag;
			}

			this.parentNode.insertBefore(element, this);
			return this;
		},

		remove: function () {
			return this.parentNode.removeChild(this);
		},

		data: function (key, value) {
			var prop;

			if (value === undefined && typeof key === "string")
				return (this.dataset[key] || "");
			
			if (value !== undefined) {
				if (typeof value !== "string")
					value = JSON.stringify(value);

				this.dataset[key] = value;
				return this;
			}

			for (prop in key)
				this.dataset[prop] = key[prop];

			return this;
		},

		removeData: function (key) {
			delete this.dataset[key];
			return this;
		},

		/**
		 * @param {String|Array} exceptions
		 */
		clearData: function (exceptions) {
			var listExcept = (arguments.length && exceptions instanceof Array) ? exceptions : [exceptions];

			for (var prop in this.dataset) {
				if (listExcept.indexOf(prop) === -1) {
					delete this.dataset[prop];
				}
			}

			return this;
		},

		attr: function (key, value) {
			var prop;

			if (value === undefined && typeof key === "string")
				return this.getAttribute(key);

			if (value !== undefined) {
				this.setAttribute(key, value);
				return this;
			}

			for (prop in key) {
				this.setAttribute(prop, key[prop]);
			}

			return this;
		},

		removeAttr: function (key) {
			this.removeAttribute(key);
			return this;
		},

		css: function(key, value) {
			var prop;

			if (value === undefined && typeof key === "string")
				return this.style[key];
			
			if (value !== undefined) {
				this.style[key] = value;
				return this;
			}

			for (prop in key)
				this.style[prop] = key[prop];
			
			return this;
		},

		/**
		 * @param {String|Array} exceptions
		 */
		addClass: function (className) {
			if (className instanceof Array) {
				for (var i = 0; i < className.length; i++) {
					this.classList.add(className[i]);
				}
			} else {
				this.classList.add(className);
			}

			return this;
		},

		/**
		 * @param {String|Array} exceptions
		 */
		removeClass: function (className) {
			if (className instanceof Array) {
				for (var i = 0; i < className.length; i++) {
					this.classList.remove(className[i]);
				}
			} else {
				this.classList.remove(className);
			}

			return this;
		},

		/**
		 * @param {String|Array} exceptions
		 */
		clearClassList: function (exceptions) {
			var classList = Array.prototype.slice.call(this.classList, 0);
			var listExcept = (arguments.length && exceptions instanceof Array) ? exceptions : [exceptions];

			for (var i = 0; i < classList.length; i++) {
				if (listExcept.indexOf(classList[i]) === -1) {
					this.classList.remove(classList[i]);
				}
			}

			return this;
		},

		val: function (newValue) {
			if (newValue === undefined)
				return this.value;

			this.value = newValue;
			return this;
		},

		bind: function (evtType, handler) {
			this.addEventListener(evtType, handler, false);
			return this;
		},

		/**
		 * @param {String} selector
		 * @param {Function} handler invokes:
		 *		{Event} evt, this refers to selector-matching object
		 */
		liveClick: function (selector, handler) {
			var rootElem = this;
			var rootElemId = rootElem.attr("id");
			var matchChildren = (selector.charAt(0) === ">");
			var matchChildrenElems;

			// try to use native "matchesSelector" in case of: document.find("#header").liveClick("> section.class", fn)
			if (matchChildren && rootElemId) {
				matchChildren = false;
				selector = "#" + rootElemId + selector;
			}

			if (matchChildren) {
				matchChildrenElems = Array.prototype.filter.call(rootElem.childNodes, function (elem) {
					return matchesSelectorFn.call(elem, selector.substr(1));
				});
			}

			rootElem.click(function (e) {
				e.liveClicked = e.liveClicked || false;
				if (e.liveClicked)
					return;

				var target = e.target;
				var breakNeeded = false;

				while (target !== rootElem && target) {
					breakNeeded = (matchChildren)
						? matchChildrenElems.indexOf(target) !== -1
						: matchesSelectorFn.call(target, selector);

					if (breakNeeded) {
						handler.call(target, e);
						e.liveClicked = true;

						return;
					}

					target = target.parentNode;
				}
			});
		},

		closestParent: function (selector) {
			var element = this;
			var rootElem = document.documentElement;

			do {
				element = element.parentNode;
			} while (element !== rootElem && !matchesSelectorFn.call(element, selector));

			return (element === rootElem)
				? null
				: element;
		},

		/**
		 * @param {HTMLElement|String} elemOrSelector
		 */
		scrollToElem: function (elemOrSelector) {
			var self = this;
			var elem;
			var startY = this.scrollTop;
			var stopY;
			var startTime = Date.now();
			var timer = null;

			if (arguments.length) {
				if (elemOrSelector instanceof HTMLElement) {
					elem = elemOrSelector;
				} else {
					elem = this.querySelector(elemOrSelector);
					if (!elem) {
						return;
					}
				}
			} else {
				self = this.parentNode;
				startY = self.scrollTop;
				elem = this;
			}

			stopY = elem.offsetTop - startY;
			if (stopY <= 0) {
				self.scrollTop = elem.offsetTop;
				return false;
			}

			timer = setInterval(function () {
				var x = (Date.now() - startTime) / 500;
				var y, cy;

				if (x > 1)
					x = 1;

				y = ( -Math.cos( x*Math.PI ) / 2 ) + 0.5;
				cy = Math.round(startY + stopY * y);

				self.scrollTop = cy;
				if (x === 1) {
					clearInterval(timer);
				}
			}, 15);

			return false;
		},

		__proto__: Element.prototype
	};

	document.__proto__ = {
		create: function (nodeName) {
			return this.createElement(nodeName);
		},

		find: function (selector) {
			return this.querySelector(selector);
		},

		/**
		 * @param {String} selector
		 * @param {Function} callback
		 */
		findAll: function (selector, callback) {
			var elems = this.querySelectorAll(selector);

			Array.prototype.map.call(elems, function (elem, index) {
				callback.call(elem, index);
			}, this);
		},

		__proto__: document.__proto__
	};

	// extend document.body
	document.addEventListener("DOMContentLoaded", function () {
		HTMLElement.prototype.__proto__ = DOM5Element;
	}, false);
})();
