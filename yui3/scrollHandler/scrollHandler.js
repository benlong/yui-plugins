
/**
* Todo's: 
*   Revisit event publishing - goal is to only test for cases and fire events of interest - not all cases/events all the time
*   Add lower/upper threshold events - fires before top and before bottom
*   Setup config handlers - interesting events and threshold formula
*   Setup pub interface for add/remove subscribers, 
*   Once add()/use() works inline, removed hardcoded namespace assignment to Y.plugin.scrollHandler
*   
*/

YUI.add("scrollHandler", function(Y) {
    
    // strings
    var NAMESPACE_PLUGIN = "plugin",
        NAMESPACE_SCROLLER = "sh",
        EVENT_TYPE_SCROLL = 'scroll',
        EVENT_SCROLLED_UP = 'scrolledUp',
        EVENT_SCROLLED_DOWN = 'scrolledDown'
        EVENT_SCROLLED_TO_TOP = 'scrolledToTop',
        EVENT_SCROLLED_TO_BOTTOM = 'scrolledToBottom',
        
        PROP_SCROLL_TOP = 'scrollTop',
        PROP_SCROLL_HEIGHT = 'scrollHeight',
        PROP_PAUSED = 'paused',
        PROP_SCROLLER_HEIGHT = 'scrollerHeight',
        PROP_LAST_SCROLL_TOP = 'lastScroll',
        
        STYLE_HEIGHT = 'height';
    

    var ScrollEventPublisher = function() {
        this.addScrollEvent = function(etype) {
            this.publish(etype);
        }
        return this;
    };
    Y.augment(ScrollEventPublisher, Y.Event.Target);
    
    
    var ScrollHandler = function(config) {
        
        var sh = this;
        var scrollingNode = config.owner;
        
        // smoke if you got'em (bail if you don't)    
        if (!scrollingNode) {
            return; //bail; todo: unplug?
        }
        
        // public event interface - todo: allow specific events to be passed in config
        sh.events = new ScrollEventPublisher();
        sh.events.addScrollEvent(EVENT_SCROLLED_UP);
        sh.events.addScrollEvent(EVENT_SCROLLED_DOWN);
        sh.events.addScrollEvent(EVENT_SCROLLED_TO_TOP);
        sh.events.addScrollEvent(EVENT_SCROLLED_TO_BOTTOM);

        // init properties
        sh._unpause();
        sh._setLastScrollTop(scrollingNode.get(PROP_SCROLL_TOP));
        sh._setScrollerHeight(parseInt(scrollingNode.getComputedStyle(STYLE_HEIGHT), 10));
        
        
        // attach handlers
        sh._attachHandler(scrollingNode, EVENT_TYPE_SCROLL, sh._onScroll, sh);
        
    }; 
    
    ScrollHandler.NS = NAMESPACE_SCROLLER;
    
    ScrollHandler.prototype = {
        
        _attachHandler: function(n, eventType, handler, scope) {
            
            n.on(eventType, handler, scope);
            
        },
        
        
        _getScrollTop: function(n) {
            
            return n.get(PROP_SCROLL_TOP);
            
        },
        
        
        _getContentHeight: function(n) {
            
            return n.get(PROP_SCROLL_HEIGHT);
            
        },


        _set: function(prop, val) {
            
            var sh = this;
            sh[prop] = val;
        
        },
        
        
        _pause: function() {
            
            var sh = this;
            sh._set(PROP_PAUSED, true);
        
        },
        
        
        _unpause: function() {
            
            var sh = this;
            sh._set(PROP_PAUSED, false);
            
        },
        
        
        _setScrollerHeight: function(iScrollerHeight) {
            
            var sh = this;
            sh._set(PROP_SCROLLER_HEIGHT, iScrollerHeight);
            
        },
        
        
        _getScrollerHeight: function() {
            
            var sh = this;
            return sh[PROP_SCROLLER_HEIGHT];
            
        },
        
        
        _setLastScrollTop: function(iScrollTop) {
            
            var sh = this;
            sh._set(PROP_LAST_SCROLL_TOP, iScrollTop);
            
        },
        
        
        _getLastScrollTop: function() {
            
            var sh = this;
            return sh[PROP_LAST_SCROLL_TOP];
            
        },
        
        
        _onScroll: function(event) {
            
            var sh = this;
            var target = event.target;
            var attr = {
                target: target,
                scrollerTop: sh._getScrollTop(target),
                contentHeight: sh._getContentHeight(target),
                scrollerHeight: sh._getScrollerHeight(target)
            }
        
            
            if (attr.scrollerTop > sh._getLastScrollTop()) {

                sh.events.fire(EVENT_SCROLLED_DOWN, attr);
                
                if (attr.contentHeight - attr.scrollerHeight === attr.scrollerTop) {
                
                    sh.events.fire(EVENT_SCROLLED_TO_BOTTOM, attr);
                
                }

            }else{
                
                sh.events.fire(EVENT_SCROLLED_UP, attr);
                
                if (attr.scrollerTop === 0) {
                
                    sh.events.fire(EVENT_SCROLLED_TO_TOP, attr);
                
                }
            
            }
            
            
            sh._setLastScrollTop(attr.scrollerTop);
        
        }
    
    }
    
    
    Y.namespace(NAMESPACE_PLUGIN);
    
    Y.plugin.scrollHandler = ScrollHandler;
    
    
}, "0.1", {requires: ['node']});