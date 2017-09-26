//META { "name": "HorizontalCode" } *//
var HorizontalCode = (function() {

    class HorizontalCode {
        getName() { return "HorizontalCodeScroll"; }

        getDescription() { return "Plugin for horizontal scrolling in Codeblocks."; }

        getAuthor() { return "Mashiro-chan"; }

        getVersion() { return "1.0.0"; }

        start() {
            if (document.getElementById('app-mount').addEventListener) {
                // IE9, Chrome, Safari, Opera
                document.getElementById('app-mount').addEventListener("mousewheel", scrollHorizontally, false);
                // Firefox
                document.getElementById('app-mount').addEventListener("DOMMouseScroll", scrollHorizontally, false);
            } else {
                // IE 6/7/8
                document.getElementById('app-mount').attachEvent("onmousewheel", scrollHorizontally);
            }
        }

        stop() {
			BdApi.clearCSS("HorizontalCode");
		}
    }

    function getCodeBelowMouse(e) {

        var x = e.clientX,
            y = e.clientY,
            elementMouseIsOver = document.elementFromPoint(x, y);

        var currentStack = 0;
        var maxStack = 10;

        while (elementMouseIsOver.tagName !== 'HTML' && currentStack <= maxStack) {
            currentStack = currentStack + 1;
            if (elementMouseIsOver.tagName == 'CODE' && hasScrollBar(elementMouseIsOver)) {
                return elementMouseIsOver;
            }

            elementMouseIsOver = elementMouseIsOver.parentElement;
        }

        return null;
    }

    function scrollHorizontally(e) {
        e = window.event || e;
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        var elementToScroll = getCodeBelowMouse(e);
        if (elementToScroll !== null) {
            elementToScroll.scrollLeft -= (delta * 40);
            e.preventDefault();
        }
    }

    function hasScrollBar(e) {
        return e.scrollWidth > e.clientWidth;
    }

    return HorizontalCode;
})();