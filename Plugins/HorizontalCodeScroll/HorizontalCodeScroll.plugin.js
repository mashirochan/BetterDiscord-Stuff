//META { "name": "HorizontalCodeScroll" } *//
var HorizontalCodeScroll = (function() {

	class HorizontalCodeScroll {
		getName() { return "HorizontalCodeScroll"; }

		getDescription() { return "Plugin for horizontal scrolling in Codeblocks."; }

		getAuthor() { return "Mashiro-chan, spthiel"; }

		getVersion() { return "1.0.0"; }

		load() {}

		start() {
			document.getElementById('app-mount').addEventListener('mousewheel', scrollHorizontally, false);
		}

		stop() {
			document.getElementById('app-mount').removeEventListener('mousewheel', scrollHorizontally);
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
			if (elementMouseIsOver.tagName == 'CODE') {
				if (!hasScrollBar(elementMouseIsOver)) {
					return null;
				}
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

	return HorizontalCodeScroll;
})();
