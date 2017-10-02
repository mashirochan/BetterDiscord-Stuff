//META{"name":"FixVersionSpacing"}*//
var FixVersionSpacing = (function() {

	class FixVersionSpacing {
		getName() { return "FixVersionSpacing"; }

		getDescription() { return "Plugin that fixes Jiiks' poor grammatical skills."; }

		getAuthor() { return "Mashiro-chan"; }

		getVersion() { return "1.0.0"; }

		load() {}

		start() {
			$('.button-1aU9q1').on('click.FixVersionSpacing', this.addSpaces);
			console.log(this.getName() + ' loaded. Current version: ' + this.getVersion());
		}

		unload() {}
		
		stop() {
			$("*").off(".FixVersionSpacing");
		}
		
		addSpaces() {
			setTimeout(function() {
				let e = document.querySelector('#bd-settings-sidebar > span > span');
				e.innerHTML = e.innerHTML.replace('by', ' by ');
			}, 500);
		}
	}
	
	return FixVersionSpacing;
})();