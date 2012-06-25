(function() {
	var createdPrototypes = {}, // созданные прототипы вида (NODENAME1 => proto1, NODENAME2 => proto2, ...)
		HTMLExtendedElement;

	/*
	 * Конструктор нового прототипа для DOM-элементов
	 *
	 * @constructor
	 * @this {HTMLExtendedElement}
	 * @param {HTMLElement}
	 */
	HTMLExtendedElement = function(proto) {
		this.find = function(selector) {
			var elem = null,
				childNodes, i, upperCasedNodeName,
				matchesSelectorFn = (this.webkitMatchesSelector || this.matchesSelector);

			if (selector.charAt(0) === ">") {
				childNodes = this.childNodes;

				for (i = 0; i < childNodes.length; i++) {
					if (matchesSelectorFn.call(childNodes[i], selector.substr(1))) {
						elem = childNodes[i];
						break;
					}
				}
			} else {
				elem = this.querySelector(selector);
			}

			if (elem === null) {
				return null;
			}

			if ((elem instanceof HTMLExtendedElement) === false) {
				upperCasedNodeName = elem.nodeName.toUpperCase();

				if (createdPrototypes[upperCasedNodeName] === undefined) {
					createdPrototypes[upperCasedNodeName] = new HTMLExtendedElement(elem.__proto__);
				}

				elem.__proto__ = createdPrototypes[upperCasedNodeName];
			}

			return elem;
		};

		/**
		 * Расширенный querySelectorAll с проходом по списку полученных элементов
		 *
		 * @param {String} selector селектор, также поддерживаются селекторы вида "> smth.class" (непосредственные childNodes)
		 * @param {Function} callback принимает в качестве аргумента индекс элемента при проходе списка, this указывает на сам элемент 
		 * @return {Void}
		 */
		this.findAll = function(selector, callback) {
			var elems, output,
				matchesSelectorFn = (this.webkitMatchesSelector || this.matchesSelector);

			if (selector.charAt(0) === ">") {
				elems = Array.prototype.filter.call(this.childNodes, function(elem) {
					return matchesSelectorFn.call(elem, selector.substr(1));
				});
			} else {
				elems = this.querySelectorAll(selector);
			}

			Array.prototype.map.call(elems, function(elem, index) {
				var upperCasedNodeName;

				if ((elem instanceof HTMLExtendedElement) === false) {
					upperCasedNodeName = elem.nodeName.toUpperCase();

					if (createdPrototypes[upperCasedNodeName] === undefined) {
						createdPrototypes[upperCasedNodeName] = new HTMLExtendedElement(elem.__proto__);
					}

					elem.__proto__ = createdPrototypes[upperCasedNodeName];
				}

				callback.call(elem, index);
			}, this);
		};

		/**
		 * Количество нод, попадающих под селектор
		 *
		 * @param {String} selector селектор, также поддерживаются селекторы вида "> smth.class" (непосредственные childNodes)
		 */
		this.total = function(selector) {
			var matchesSelectorFn = (this.webkitMatchesSelector || this.matchesSelector);

			if (selector.charAt(0) === ">") {
				return Array.prototype.filter.call(this.childNodes, function(elem) {
					return matchesSelectorFn.call(elem, selector.substr(1));
				}).length;
			} else {
				return this.querySelectorAll(selector).length;
			}
		};

		this.clone = function(deep) {
			var elem = this.cloneNode.apply(this, Array.prototype.slice.call(arguments, 0)),
				upperCasedNodeName;
			
			if ((elem instanceof HTMLExtendedElement) === false) {
				upperCasedNodeName = elem.nodeName.toUpperCase();

				if (createdPrototypes[upperCasedNodeName] === undefined) {
					createdPrototypes[upperCasedNodeName] = new HTMLExtendedElement(elem.__proto__);
				}

				elem.__proto__ = createdPrototypes[upperCasedNodeName];
			}

			return elem;
		};

		this.html = function(newHTML) {
			if (newHTML !== undefined) {
				this.innerHTML = newHTML;
				return this;
			} else {
				return this.innerHTML;
			}
		};

		this.plaintext = function(newContent) {
			if (newContent !== undefined) {
				this.textContent = newContent;
				return this;
			} else {
				return this.textContent;
			}
		};

		this.empty = function() {
			return this.html("");
		};

		this.scrollToElem = function(elemOrSelector) {
			var self = this,
				elem,
				startY = this.scrollTop,
				stopY,
				startTime = Date.now(),
				timer = null;

			if (arguments.length) {
				if (elemOrSelector instanceof HTMLElement) {
					elem = elemOrSelector;
				} else {
					elem = this.querySelector(elemOrSelector);
					if (elem === null) {
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

			// TODO requestAnimationFrame
			timer = setInterval(function() {
				var x = (Date.now() - startTime) / 500,
					y, cy;

				if (x > 1) {
					x = 1;
				}

				y = ( -Math.cos( x*Math.PI ) / 2 ) + 0.5;
				cy = Math.round(startY + stopY * y);

				self.scrollTop = cy;
				if (x === 1) {
					clearInterval(timer);
				}
			}, 15);

			return false;
		};

		this.append = function(elements) {
			if (elements instanceof Array) {
				var frag = document.createDocumentFragment();

				elements.forEach(function(elem) {
					frag.appendChild(elem);
				});

				this.appendChild(frag);
			} else {
				this.appendChild(elements);
			}
			
			return this;
		};

		this.prepend = function(elements) {
			var element;

			if (elements instanceof Array) {
				element = document.createDocumentFragment();

				elements.forEach(function(elem) {
					element.appendChild(elem);
				});
			} else {
				element = elements;
			}

			if (this.hasChildNodes()) {
				this.insertBefore(element, this.childNodes[0]);
			} else {
				this.append(element);
			}

			return this;
		};

		this.after = function(elements) {
			var childToAppend = elements;

			if (elements instanceof Array) {
				var frag = document.createDocumentFragment();

				elements.forEach(function(elem) {
					frag.appendChild(elem);
				});

				childToAppend = frag;
			}

			if (this.nextSibling === null) {
				this.parentNode.appendChild(childToAppend);
			} else {
				this.parentNode.insertBefore(childToAppend, this.nextSibling);
			}

			return this;
		};

		this.before = function(element) {
			this.parentNode.insertBefore(element, this);
			return this;
		};

		this.remove = function() {
			return this.parentNode.removeChild(this);
		};

		this.data = function(key, value) {
			var prop;

			if (value === undefined && typeof key === "string") {
				return (this.dataset[key] || "");
			}
			
			if (value !== undefined) {
				if (typeof value !== "string") {
					value = JSON.stringify(value);
				}

				this.dataset[key] = value;
				return this;
			}

			for (prop in key) {
				if (key.hasOwnProperty(prop)) {
					this.dataset[prop] = key[prop];
				}
			}
			
			return this;
		};

		this.removeData = function(key) {
			delete this.dataset[key];
			return this;
		};

		this.clearData = function(exceptions) {
			var listExcept = (arguments.length && exceptions instanceof Array) ? exceptions : [exceptions],
				prop;

			for (prop in this.dataset) {
				if (listExcept.indexOf(prop) === -1) {
					delete this.dataset[prop];
				}
			}

			return this;
		};

		this.attr = function(key, value) {
			var prop;

			if (value === undefined && typeof key === "string") {
				return this.getAttribute(key);
			}

			if (value !== undefined) {
				this.setAttribute(key, value);
				return this;
			}

			for (prop in key) {
				if (key.hasOwnProperty(prop)) {
					this.setAttribute(prop, key[prop]);
				}
			}
			
			return this;
		};

		this.removeAttr = function(key) {
			this.removeAttribute(key);
			return this;
		};

		this.css = function(key, value) {
			var prop;

			if (value === undefined && typeof key === "string") {
				return this.style[key];
			}
			
			if (value !== undefined) {
				this.style[key] = value;
				return this;
			}

			for (prop in key) {
				if (key.hasOwnProperty(prop)) {
					this.style[prop] = key[prop];
				}
			}
			
			return this;
		};

		this.addClass = function(className) {
			if (className instanceof Array) {
				className.forEach(function(simpleClassName) {
					this.classList.add(simpleClassName);
				}, this);
			} else {
				this.classList.add(className);
			}
			
			return this;
		};

		this.removeClass = function(className) {
			if (className instanceof Array) {
				className.forEach(function(simpleClassName) {
					this.classList.remove(simpleClassName);
				}, this);
			} else {
				this.classList.remove(className);
			}

			return this;
		};

		this.clearClassList = function(exceptions) {
			var classList = Array.prototype.slice.call(this.classList, 0),
				listExcept = (arguments.length && exceptions instanceof Array) ? exceptions : [exceptions];

			classList.forEach(function(className) {
				if (listExcept.indexOf(className) === -1) {
					this.classList.remove(className);
				}
			}, this);

			return this;
		};

		this.val = function(newValue) {
			if (newValue === undefined) {
				return this.value;
			} else {
				this.value = newValue;
				return this;
			}
		};

		this.click = function(handler) {
			if (typeof handler === "function") {
				this.addEventListener("click", handler, false);
			} else {
				var protoClickFn = this.__proto__.__proto__.click;
				if (protoClickFn !== undefined && typeof protoClickFn === "function") {
					protoClickFn.call(this);
				} else {
					var evt = document.createEvent('MouseEvents');
					evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
						
					this.dispatchEvent(evt);
				}

				
			}
			
			return this;
		};

		/**
		 * @param {String} selector селектор, также поддерживаются селекторы вида "> smth.class" (непосредственные childNodes)
		 * @param {Function} handler обработчик, принимающий оригинальный Event как параметр, this указывает на объект, который подходит под описание selector
		 */
		this.liveClick = function(selector, handler) {
			var rootElem = this,
				rootElemId = rootElem.attr("id"),
				matchChildren = (selector.charAt(0) === ">"),
				matchChildrenElems,
				matchesSelectorFn = (rootElem.webkitMatchesSelector || rootElem.matchesSelector);

			// пытаемся использовать нативный matchesSelector в случаях вида document.find("#header").liveClick("> section.class", fn)
			if (matchChildren && rootElemId !== null) {
				matchChildren = false;
				selector = "#" + rootElemId + selector;
			}

			if (matchChildren) {
				matchChildrenElems = Array.prototype.filter.call(rootElem.childNodes, function(elem) {
					return matchesSelectorFn.call(elem, selector.substr(1));
				});
			}

			rootElem.click(function(e) {
				e.liveClicked = e.liveClicked || false;
				if (e.liveClicked) {
					return;
				}

				var target = e.target,
					breakNeeded = false;

				while (target !== rootElem && target !== null) {
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
		};

		this.closestParent = function(selector) {
			var element = this,
				rootElem = document.documentElement,
				matchesSelectorFn = (element.webkitMatchesSelector || element.matchesSelector);

			do {
				element = element.parentNode;
			} while (element !== rootElem && matchesSelectorFn.call(element, selector) === false);
			
			return (element === rootElem)
				? null
				: element;
		};

		this.__defineGetter__("parentNode", function() {
			return document.extend(this.parentNode);
		});

		this.__defineGetter__("firstChild", function() {
			return document.extend(this.firstChild);
		});

		this.__defineGetter__("lastChild", function() {
			return document.extend(this.lastChild);
		});

		this.__defineGetter__("nextSibling", function() {
			return document.extend(this.nextSibling);
		});

		this.__defineGetter__("previousSibling", function() {
			return document.extend(this.previousSibling);
		});

		this.__proto__ = {
			__proto__: proto
		};
	};

	/**
	 * Расширение прототипа HTMLDocument с помощью методов find/findAll/create/total
	 */
	document.__proto__ = {
		/**
		 * @return расширенный HTMLElement
		 */
		create: function(nodeName) {
			var elem = this.createElement(nodeName),
				upperCasedNodeName = nodeName.toUpperCase(),
				prop;

			// создаем прототип и наполняем его данными
			if (createdPrototypes[upperCasedNodeName] === undefined) {
				createdPrototypes[upperCasedNodeName] = new HTMLExtendedElement(elem.__proto__);
			}

			elem.__proto__ = createdPrototypes[upperCasedNodeName];
			return elem;
		},

		/**
		 * @return расширенный HTMLElement
		 */
		find: function(selector) {
			var elem = this.querySelector(selector),
				upperCasedNodeName;

			if (elem === null) {
				return null;
			}

			if ((elem instanceof HTMLExtendedElement) === false) {
				upperCasedNodeName = elem.nodeName.toUpperCase();

				// создаем прототип и наполняем его данными
				if (createdPrototypes[upperCasedNodeName] === undefined) {
					createdPrototypes[upperCasedNodeName] = new HTMLExtendedElement(elem.__proto__);
				}

				elem.__proto__ = createdPrototypes[upperCasedNodeName];
			}

			return elem;
		},

		/**
		 * @param {String} selector
		 * @param {Function} callback по очереди принимает {HTMLExtendedElement} ноды из querySelectorAll
		 */
		findAll: function(selector, callback) {
			var elems = this.querySelectorAll(selector),
				output;

			Array.prototype.map.call(elems, function(elem, index) {
				var upperCasedNodeName;

				if ((elem instanceof HTMLExtendedElement) === false) {
					upperCasedNodeName = elem.nodeName.toUpperCase();

					// создаем прототип и наполняем его данными
					if (createdPrototypes[upperCasedNodeName] === undefined) {
						createdPrototypes[upperCasedNodeName] = new HTMLExtendedElement(elem.__proto__);
					}

					elem.__proto__ = createdPrototypes[upperCasedNodeName];
				}

				callback.call(elem, index);
			}, this);
		},

		/**
		 * @return {Number} количество элементов, попадающих под селектор
		 */
		total: function(selector) {
			return this.querySelectorAll(selector).length;
		},

		extend: function(nodeElem) {
			var upperCasedNodeName;

			if (nodeElem.nodeType !== Node.ELEMENT_NODE) {
				return nodeElem;
			}

			if ((nodeElem instanceof HTMLExtendedElement) === false) {
				upperCasedNodeName = nodeElem.nodeName.toUpperCase();

				// создаем прототип и наполняем его данными
				if (createdPrototypes[upperCasedNodeName] === undefined) {
					createdPrototypes[upperCasedNodeName] = new HTMLExtendedElement(nodeElem.__proto__);
				}

				nodeElem.__proto__ = createdPrototypes[upperCasedNodeName];
			}

			return nodeElem;
		},

		__proto__: document.__proto__
	};

	Image.prototype = new HTMLExtendedElement(Image.prototype);
	Audio.prototype = new HTMLExtendedElement(Audio.prototype);

	// расширяем базовый объект body
	document.addEventListener("DOMContentLoaded", function() {
		document.extend(document.body);
	}, false);
})();
