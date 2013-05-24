
/*
 * aciSortable jQuery Plugin v1.1.0
 * http://acoderinsights.ro
 *
 * Copyright (c) 2013 Dragos Ursu
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Require jQuery Library >= v1.7.1 http://jquery.com
 * + aciPlugin >= v1.2.0 https://github.com/dragosu/jquery-aciPlugin
 *
 * Date: May Fri 24 10:00 2013 +0200
 */

/*
 * Note: there is a placeholder that is always shown on the valid drop-targets 
 * and a helper that folows the mouse pointer on drag. You can offset the helper
 * by using CSS margins or you can hide it with CSS. The invalid non-draggable 
 * items and the invalid drop targets will not show the placeholder. Also the
 * placeholder is not shown for silly drop-targets like before and after the
 * dragged item itself, the parent dragged over his childrens and when dragging 
 * ouside of the top sortable container.
 * 
 * Use the options callback functions to implement your wanted functionality into
 * aciSortable. By using the options callbacks - you can:
 * + prevent a item to be dragged (see options.before);
 * + init the placeholder/helper based on the dragged item (see options.start);
 * + prevent a item to be dropped to a target (see options.valid);
 * + do something when in the drag (see options.drag);
 * + create/remove a child container when in the drag (so that the dragged item
 *   can be added as children of an item without a child container,
 *   see options.create/options.remove);
 * + set the dragged item to the final drop position (see options.end).
 */

(function($, window, undefined) {

    // default options

    var options = {
        container: 'ul',                                    // selector for the container element (need to be direct parent of 'item')
        item: 'li',                                         // selector for the item element - the sortable items (need to be direct children of 'container')
        distance: 4,                                        // mouse pointer min-distance to consider for drag operations
        handle: '*',                                        // selector for the sortable handle (by default 'mousedown' event over any element is accepted)
        disable: 'a,input,textarea,select,option,button',   // selector for elements that should not start a drag operation on 'mousedown' event over them
        child: null,                                        // [0..100] % from item height/width to consider for container creation (for items without a child container)
        // use NULL to disable creating child containers (the 'draggable' need to be TRUE to be able to create child containers)
        childHolder: '<ul class="aciSortableChild"></ul>',  // HTML markup for the child container (to be created when hovering over a item without a child container)
        childHolderSelector: '.aciSortableChild',           // selector for the container added to a item and used to remove the container (need to match the 'childHolder')
        exclude: null,                                      // selector for containers/items to be excluded from the drop targets/draggable items
        vertical: true,                                     // BOOL to tell if it's vertical or horizontal sortable
        placeholder: '<li class="aciSortablePlaceholder"><div></div></li>',   // HTML markup for showing up the placeholder (when in the drag operation)
        placeholderSelector: '.aciSortablePlaceholder',                       // selector for the placeholder (need to match the 'placeholder')
        helper: '<div class="aciSortableHelper"></div>',                      // HTML markup for showing up the helper (following the mouse pointer)
        helperSelector: '.aciSortableHelper',                                 // selector for the helper (need to match the 'helper')
        relative: false,                                                      // if FALSE then helper top/left will be on mouse cursor position
        // if TRUE will be relative to the starting drag point
        draggable: true,                                                      // if FALSE then the items can only be sorted inside the same container
        gluedPlaceholder: false,                                              // if TRUE then the placeholder will always be visible
        connectDrop: null,                                                    // selector for other sortables to connect this sortable with (as drop targets)
        scroll: 0.4,                                                          // the scroll factor to use (speed[pixels/50ms] = drag-distance * options.scroll)
        /**
         * Called before start dragging.
         * @param jQuery item The sorted element
         * @returns bool FALSE for non-draggable items
         */
        before: function(item) {
            if (this._instance.options.exclude) {
                // test if excluded from drag
                var container = this.containerFrom(item);
                return !container.is(this._instance.options.exclude) && !item.is(this._instance.options.exclude);
            }
            return true;
        },
        /**
         * Called one time just before dragging (the helper content should be set here).
         * @param jQuery item The sorted element
         * @param jQuery placeholder The placeholder element
         * @param jQuery helper The element that follows the mouse pointer
         */
        start: function(item, placeholder, helper) {
            var clone = item.clone();
            clone.children(this._instance.options.container).remove();
            // copy item text to the helper
            helper.html(clone.text());
        },
        /**
         * Called to check the drop target.
         * @param jQuery item The sorted element
         * @param jQuery hover The element under the mouse pointer
         * @param bool/NULL before TRUE if the drop target is before the 'hover' item (NULL if 'isContainer' is TRUE)
         * @param bool isContainer TRUE if 'hover' is a empty container (not a item)
         * @param jQuery helper The element that follows the mouse pointer
         * @returns bool FALSE for a invalid drop target
         */
        valid: function(item, hover, before, isContainer, helper) {
            if (this._instance.options.exclude) {
                // test if excluded from drop
                if (isContainer) {
                    return !hover.is(this._instance.options.exclude);
                } else {
                    var container = this.containerFrom(hover);
                    return !container.is(this._instance.options.exclude) && !hover.is(this._instance.options.exclude);
                }
            }
            return true;
        },
        /**
         * Called when in the drag operation (after the reposition of the placeholder).
         * @param jQuery item The sorted element
         * @param jQuery placeholder The placeholder element (inserted into the DOM)
         * @param bool isValid TRUE if the current drop-target is valid
         * @param jQuery helper The element that follows the mouse pointer
         */
        drag: function(item, placeholder, isValid, helper) {
            // there is no default implementation
        },
        /**
         * Called to create a child container when hovering over a item.
         * @param jQuery item The sorted element
         * @param jQuery hover The element under the mouse pointer
         * @returns bool TRUE if the container was created
         */
        create: function(item, hover) {
            // append a new child container
            hover.append(this._instance.options.childHolder);
            return true;
        },
        /**
         * Called when the child container should be removed.
         * @param jQuery item The sorted element
         * @param jQuery hover The element with the created container
         */
        remove: function(item, hover) {
            // remove the child container
            hover.children(this._instance.options.childHolderSelector).remove();
        },
        /**
         * Called on drag end (the item should be repositioned here based on the placeholder).
         * @param jQuery item The sorted element
         * @param jQuery placeholder The placeholder element (need to be detached)
         * @param jQuery helper The element that follows the mouse pointer (need to be detached)
         */
        end: function(item, placeholder, helper) {
            // test if placeholder is inserted into the DOM
            if (placeholder.parent().length) {
                // add the item after placeholder
                placeholder.after(item).detach();
            }
            helper.detach();
        }
    };

    // aciSortable plugin core

    var aciSortable = {
        // add extra data
        __extend: function() {
            $.extend(this._instance, {
                sorting: false,     // tell if the drag was started
                item: null,         // hold the dragged item
                hoverItem: null,    // hold the hovered item (where the mouse cursor is)
                isContainer: false, // TRUE when 'hoverItem' is an empty container (not a item)
                pointStart: null,   // starting mouse coords
                pointNow: null,     // current mouse coords
                placeholder: null,  // hold the placeholder (may not be inserted in the DOM)
                helper: null,       // hold the helper (may not be inserted in the DOM)
                relative: null,     // starting mouse offset (if options.relative was TRUE)
                children: null,     // hold the last item with a created container
                scroll: false       // hold the scroll state
            });
        },
        // init
        init: function() {
            var _this = this;
            if (this.wasInit()) {
                return;
            }
            // bind events to respond to the drag operation
            this._instance.jQuery.on('mousedown' + this._instance.nameSpace, this._instance.options.item, function(event) {
                // mousedown on a item
                var target = $(event.target);
                if (!target.is(_this._instance.options.handle) || target.is(_this._instance.options.disable)) {
                    return;
                }
                if (!target.is(_this._instance.options.disable)) {
                    // prevent text selection
                    event.preventDefault();
                }
                if (target.is(_this._instance.options.container)) {
                    // no drag for containers 
                    $(window.document.body).css('cursor', 'no-drop');
                } else {
                    _this._delayStart(event);
                }
            }).on('mousemove' + this._instance.nameSpace, this._instance.options.item, function(event) {
                // mousemove over a item
                if (_this._instance.sorting) {
                    event.stopPropagation();
                    var item = _this.itemFrom(event.target);
                    if (_this._instance.item.has(item).length) {
                        // the parent can't be dropped over his childrens
                        _this._instance.hoverItem = null;
                    } else {
                        _this._instance.hoverItem = item;
                    }
                    _this._instance.isContainer = false;
                }
                _this._drag(event);
            }).on('mousemove' + this._instance.nameSpace, this._instance.options.container, function(event) {
                // mousemove over a sortable container
                if (_this._instance.sorting) {
                    event.stopPropagation();
                    var container = _this.containerFrom(event.target);
                    if (_this.isEmpty(container) && !_this._instance.item.has(container).length) {
                        // allow empty container to be a drop target
                        _this._instance.hoverItem = container;
                        _this._instance.isContainer = true;
                        _this._drag(event);
                    }
                }
            });
            this._initConnect();
            // ensure we proceess on move/end outside of container
            $(window.document).bind('mousemove' + this._instance.nameSpace + this._instance.index, function(event) {
                // mousemove outside of the sortable
                if (_this._instance.sorting) {
                    // can't drag outside of container
                    _this._instance.hoverItem = null;
                    _this._drag(event);
                }
            }).on('mousemove' + this._instance.nameSpace + this._instance.index, this._instance.options.helperSelector, function(event) {
                // mousemove over the helper
                if (_this._instance.sorting) {
                    var element = _this._fromCursor(event);
                    if (element) {
                        _this._instance.jQuery.trigger($.Event('mousemove', {
                            target: element,
                            pageX: event.pageX,
                            pageY: event.pageY
                        }));
                    }
                }
            }).bind('selectstart' + this._instance.nameSpace + this._instance.index, function(event) {
                if (_this._instance.sorting) {
                    // prevent text selection
                    event.preventDefault();
                }
            }).bind('mouseup' + this._instance.nameSpace + this._instance.index, function() {
                // drag ends here
                if (_this._instance.sorting) {
                    _this._end();
                } else {
                    _this._instance.item = null;
                    $(window.document.body).css('cursor', 'default');
                }
            });
            this._super();
        },
        // get element from cursor
        _fromCursor: function(event) {
            if (this._instance.helper && this._instance.helper.parent().length) {
                if ($(event.target).closest(this._instance.options.helperSelector).length) {
                    this._instance.helper.hide();
                    var element = window.document.elementFromPoint(event.clientX, event.clientY);
                    this._instance.helper.show();
                    if (element && (element != window.document.body)) {
                        return element;
                    }
                }
            }
            return null;
        },
        // init connect sortables
        _initConnect: function() {
            var _this = this;
            if (this._instance.options.connectDrop) {
                $(window.document).on('mousemove' + this._instance.nameSpace + 'connect' + this._instance.index, this._instance.options.connectDrop, function(event) {
                    // mousemove over the related sortables
                    if (_this._instance.sorting && !_this._instance.jQuery.has(element).length) {
                        var element = $(event.target);
                        if (!element.is(_this._instance.options.connectDrop)) {
                            element = element.closest(_this._instance.options.connectDrop);
                        }
                        _this._connect(element);
                    }
                });
            }
        },
        // done connect sortables
        _doneConnect: function() {
            $(window.document).off(this._instance.nameSpace + 'connect' + this._instance.index);
        },
        // trigger event
        _trigger: function(eventName, params) {
            var event = $.Event('acisortable');
            this._instance.jQuery.trigger(event, [this, eventName, params]);
            return !event.isDefaultPrevented();
        },
        // call options callback
        _call: function(callbackName, params) {
            var toArray = [];
            for (var i in params) {
                toArray.push(params[i]);
            }
            var result = true;
            if (this._instance.options[callbackName]) {
                result = this._instance.options[callbackName].apply(this, toArray);
            }
            if (!this._trigger(callbackName, params)) {
                result = false;
            }
            return result;
        },
        // connect with other sortable
        _connect: function(element) {
            var sortable = element.aciSortable('api');
            if (sortable.wasInit()) {
                sortable._instance.item = this._instance.item
                sortable._instance.pointStart = this._instance.pointStart;
                sortable._instance.relative = this._instance.relative;
                sortable._instance.helper = this._instance.helper.clone();
                var dummy = $('<div style="display:none"></div>');
                $(window.document.body).append(dummy);
                this._instance.item = dummy;
                this._instance.placeholder.detach();
                this._instance.helper.detach();
                this._end();
                dummy.remove();
                sortable._start();
            }
        },
        // test if this sortable has item
        hasItem: function(item) {
            return this._instance.jQuery.has(item).length > 0;
        },
        // get the sortable top container from element
        sortableFrom: function(element) {
            if (this._instance.jQuery.has(element).length) {
                return this._instance.jQuery;
            }
            if (this._instance.options.connectDrop) {
                return $(element).closest(this._instance.options.connectDrop);
            }
            return $();
        },
        // return item from element
        itemFrom: function(element) {
            var item = $(element);
            if (item.is(this._instance.options.item)) {
                return item;
            }
            return $(element).closest(this._instance.options.item);
        },
        // return container from element
        containerFrom: function(element) {
            var item = $(element);
            if (item.is(this._instance.options.container)) {
                return item;
            }
            return $(element).closest(this._instance.options.container);
        },
        // test if item has childrens
        hasChildrens: function(item) {
            return item.children(this._instance.options.container).children(this._instance.options.item).length > 0;
        },
        // test if item has container
        hasContainer: function(item) {
            return item.children(this._instance.options.container).length > 0;
        },
        // test if container is empty
        isEmpty: function(container) {
            return !container.children(this._instance.options.item).length;
        },
        // start drag with a delay
        _delayStart: function(event) {
            var item = this.itemFrom(event.target)
            if (this._call('before', {
                item: item
            })) {
                this._instance.item = item;
                this._instance.pointStart = {
                    x: event.pageX,
                    y: event.pageY
                };
                if (this._instance.options.relative) {
                    var top = $(window).scrollTop();
                    var left = $(window).scrollLeft();
                    var rect = this._instance.item.get(0).getBoundingClientRect();
                    this._instance.relative = {
                        x: rect.left + left - event.pageX,
                        y: rect.top + top - event.pageY
                    };
                } else {
                    this._instance.relative = {
                        x: 0,
                        y: 0
                    };
                }
                this._drag(event);
            } else {
                $(window.document.body).css('cursor', 'no-drop');
            }
        },
        // start drag
        _start: function() {
            this._instance.sorting = true;
            if (!this._instance.placeholder) {
                this._instance.placeholder = $(this._instance.options.placeholder);
            }
            if (!this._instance.helper) {
                this._instance.helper = $(this._instance.options.helper);
            }
            this._call('start', {
                item: this._instance.item,
                placeholder: this._instance.placeholder,
                helper: this._instance.helper
            });
            if (this._instance.options.gluedPlaceholder) {
                this._instance.item.after(this._instance.placeholder);
            }
            $(window.document.body).append(this._instance.helper);
            $(window.document.body).css('cursor', 'move');
        },
        // check if should update the position
        _minDistance: function() {
            return (window.Math.abs(this._instance.pointStart.x - this._instance.pointNow.x) > this._instance.options.distance) ||
                    (window.Math.abs(this._instance.pointStart.y - this._instance.pointNow.y) > this._instance.options.distance);
        },
        // process drag
        _drag: function(event) {
            this._instance.pointNow = {
                x: event.pageX,
                y: event.pageY
            };
            if (this._instance.sorting) {
                // we started sorting
                this._helper();
                if (this._minDistance()) {
                    this._placeholder();
                }
            } else if (this._instance.item) {
                // sorting not yet started
                if (this._minDistance()) {
                    this._start();
                }
            }
        },
        // called on drag
        _onDrag: function(isValid) {
            this._call('drag', {
                item: this._instance.item,
                placeholder: this._instance.placeholder,
                isValid: isValid,
                helper: this._instance.helper
            });
        },
        // test if drag position is valid
        _isValid: function(before) {
            if (!this._instance.options.draggable && this.hasItem(this._instance.item) && (this._instance.isContainer || (this.containerFrom(this._instance.item).get(0) !=
                    this.containerFrom(this._instance.hoverItem).get(0)))) {
                return false;
            }
            if (this._call('valid', {
                item: this._instance.item,
                hover: this._instance.hoverItem,
                before: before,
                isContainer: this._instance.isContainer,
                helper: this._instance.helper
            })) {
                $(window.document.body).css('cursor', 'move');
                return true;
            }
            return false;
        },
        // called to create a child container
        _onCreate: function() {
            this._onRemove();
            if (this._call('create', {
                item: this._instance.item,
                hover: this._instance.hoverItem
            })) {
                this._instance.childItem = this._instance.hoverItem;
                // select the added container
                this._instance.hoverItem = this._instance.hoverItem.children(this._instance.options.childHolderSelector);
                this._instance.isContainer = true;
                this._placeholder();
                return true;
            }
            return false;
        },
        // called to remove a container
        _onRemove: function() {
            if (this._instance.childItem) {
                if (this._instance.placeholder) {
                    this._instance.placeholder.detach();
                }
                if (!this.hasChildrens(this._instance.childItem)) {
                    this._call('remove', {
                        item: this._instance.item,
                        hover: this._instance.childItem
                    });
                }
                this._instance.childItem = null;
            }
        },
        // update placeholder
        _placeholder: function() {
            this._instance.pointStart = this._instance.pointNow;
            if (this._instance.hoverItem) {
                if (this._instance.hoverItem.is(this._instance.options.placeholderSelector)) {
                    return;
                }
                if (this._instance.isContainer) {
                    // if the placeholder in an empty container
                    if (this._isValid(null)) {
                        this._instance.hoverItem.append(this._instance.placeholder);
                        this._onDrag(true);
                        return;
                    }
                } else if (this._instance.hoverItem.get(0) != this._instance.item.get(0)) {
                    // do not show if hover is the dragged item
                    var before = false, create = false;
                    var rect = this._instance.hoverItem.get(0).getBoundingClientRect();
                    if (this._instance.options.vertical) {
                        var scroll = $(window).scrollTop();
                        if (this._instance.options.child && (this._instance.options.draggable || !this.hasItem(this._instance.item)) && !this.hasContainer(this._instance.hoverItem)) {
                            // check if we should create a container
                            var distance = (rect.bottom - rect.top) * this._instance.options.child / 200;
                            if ((this._instance.pointNow.y > scroll + rect.top + distance) && (this._instance.pointNow.y < scroll + rect.bottom - distance)) {
                                create = true;
                            }
                        }
                        // check if should be before the hover one
                        if (this._instance.pointNow.y < scroll + rect.top + (rect.bottom - rect.top) / 2) {
                            before = true;
                        }
                    } else {
                        var scroll = $(window).scrollLeft();
                        if (this._instance.options.child && (this._instance.options.draggable || !this.hasItem(this._instance.item)) && !this.hasContainer(this._instance.hoverItem)) {
                            // check if we should create a container
                            var distance = (rect.right - rect.left) * this._instance.options.child / 200;
                            if ((this._instance.pointNow.x > scroll + rect.left + distance) || (this._instance.pointNow.x < scroll + rect.right - distance)) {
                                create = true;
                            }
                        }
                        // check if should be before the hover one
                        if (this._instance.pointNow.x < scroll + rect.left + (rect.right - rect.left) / 2) {
                            before = true;
                        }
                    }
                    if (before) {
                        // do not show it after or before the dragged item
                        var prevItem = this._instance.hoverItem.prev(this._instance.options.item);
                        if (!prevItem.length || !this._instance.item.is(':visible') || this._instance.options.gluedPlaceholder || (prevItem.get(0) != this._instance.item.get(0))) {
                            if (this._isValid(true)) {
                                if (create && this._onCreate()) {
                                    return;
                                }
                                this._instance.hoverItem.before(this._instance.placeholder);
                                this._onDrag(true);
                                return;
                            }
                        }
                    } else {
                        // do not show it after or before the dragged item
                        var nextItem = this._instance.hoverItem.next(this._instance.options.item);
                        if (!nextItem.length || !this._instance.item.is(':visible') || this._instance.options.gluedPlaceholder || (nextItem.get(0) != this._instance.item.get(0))) {
                            if (this._isValid(false)) {
                                if (create && this._onCreate()) {
                                    return;
                                }
                                this._instance.hoverItem.after(this._instance.placeholder);
                                this._onDrag(true);
                                return;
                            }
                        }
                    }
                }
            }
            // no drop-target
            if (!this._instance.options.gluedPlaceholder) {
                this._instance.placeholder.detach();
            }
            $(window.document.body).css('cursor', 'no-drop');
            this._onDrag(false);
        },
        // process scrolling
        _scroll: function() {
            if (this._instance.scroll) {
                return;
            }
            this._instance.scroll = true;
            var scroll = this._instance.jQuery.get(0).scrollHeight;
            var height = this._instance.jQuery.height();
            if (scroll > height) {
                var top = $(window).scrollTop();
                var rect = this._instance.jQuery.get(0).getBoundingClientRect();
                if (this._instance.pointNow.y < top + rect.top) {
                    var now = this._instance.jQuery.scrollTop();
                    if (now > 0) {
                        var distance = top + rect.top - this._instance.pointNow.y;
                        this._instance.jQuery.get(0).scrollTop = Math.max(now - distance * this._instance.options.scroll, 0);
                    }
                } else if (this._instance.pointNow.y > top + rect.bottom) {
                    var now = this._instance.jQuery.scrollTop();
                    if (now + height < scroll) {
                        var distance = this._instance.pointNow.y - (top + rect.bottom);
                        this._instance.jQuery.get(0).scrollTop = Math.min(now + distance * this._instance.options.scroll, scroll - height);
                    }
                }
            }
            scroll = this._instance.jQuery.get(0).scrollWidth;
            var width = this._instance.jQuery.width();
            if (scroll > width) {
                var left = $(window).scrollLeft();
                var rect = this._instance.jQuery.get(0).getBoundingClientRect();
                if (this._instance.pointNow.x < left + rect.left) {
                    var now = this._instance.jQuery.scrollLeft();
                    if (now > 0) {
                        var distance = left + rect.left - this._instance.pointNow.x;
                        this._instance.jQuery.get(0).scrollLeft = Math.max(now - distance * this._instance.options.scroll, 0);
                    }
                } else if (this._instance.pointNow.x > left + rect.right) {
                    var now = this._instance.jQuery.scrollLeft();
                    if (now + width < scroll) {
                        var distance = this._instance.pointNow.x - (left + rect.right);
                        this._instance.jQuery.get(0).scrollLeft = Math.min(now + distance * this._instance.options.scroll, scroll - width);
                    }
                }
            }
            if (this._instance.sorting) {
                window.setTimeout($.proxy(function() {
                    this._instance.scroll = false;
                    this._scroll();
                }, this), 50);
            } else {
                this._instance.scroll = false;
            }
        },
        // update helper
        _helper: function() {
            if (this._instance.options.scroll) {
                this._scroll();
            }
            this._instance.helper.css({
                left: (this._instance.pointNow.x + this._instance.relative.x) + 'px',
                top: (this._instance.pointNow.y + this._instance.relative.y) + 'px'
            });
        },
        // end drag
        _end: function() {
            if (this._instance.placeholder.parent().length) {
                if ((this._instance.placeholder.prev(this._instance.options.item).get(0) == this._instance.item.get(0)) ||
                        (this._instance.placeholder.next(this._instance.options.item).get(0) == this._instance.item.get(0))) {
                    // when is before/after the dragged item
                    this._instance.placeholder.detach();
                }
            }
            var container = this.containerFrom(this._instance.item);
            this._call('end', {
                item: this._instance.item,
                placeholder: this._instance.placeholder,
                helper: this._instance.helper
            });
            this._onRemove();
            var parentItem = this.itemFrom(container);
            if (parentItem.length && !this.hasChildrens(parentItem)) {
                this._instance.childItem = parentItem;
                this._onRemove();
            }
            this._instance.sorting = false;
            this._instance.item = null;
            this._instance.hoverItem = null;
            $(window.document.body).css('cursor', 'default');
        },
        // override set option
        option: function(option, value) {
            if (this.wasInit()) {
                if ((option == 'connectDrop') && (value != this._instance.options.connectDrop)) {
                    this._doneConnect();
                    this._instance.options.connectDrop = value;
                    this._initConnect();
                }
            }
            // call the parent
            this._super(option, value);
        },
        // destroy
        destroy: function() {
            if (!this.wasInit()) {
                return;
            }
            this._instance.jQuery.off(this._instance.nameSpace);
            this._doneConnect();
            $(window.document).unbind(this._instance.nameSpace + this._instance.index).off(this._instance.nameSpace + this._instance.index);
            if (this._instance.placeholder) {
                this._instance.placeholder.detach();
            }
            if (this._instance.helper) {
                this._instance.helper.detach();
            }
            this._super();
        }
    };

    // extend the base aciPluginUi class and store into aciPluginClass.plugins
    aciPluginClass.plugins.aciSortable = aciPluginClass.aciPluginUi.extend(aciSortable, 'aciSortable');

    // publish the plugin & the default options
    aciPluginClass.publish('aciSortable', options);

})(jQuery, this);
