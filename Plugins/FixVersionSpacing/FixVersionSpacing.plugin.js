//META{"name":"FixVersionSpacing"}*//
var FixVersionSpacing = (function() {

	class FixVersionSpacing {
		getName() { return "FixVersionSpacing"; }

		getDescription() { return "Plugin that fixes Jiiks' poor grammatical skills."; }

		getAuthor() { return "Mashiro-chan"; }

		getVersion() { return "1.0.2"; }

		load() {
			checkForUpdate();
		}

		start() {
			$('.button-1aU9q1').on('click.FixVersionSpacing', addSpaces);
			console.log(this.getName() + ' loaded. Current version: ' + this.getVersion());
			checkForUpdate();
		}
		
		stop() {
			$("*").off(".FixVersionSpacing");
		}
	}
	
	function addSpaces() {
		setTimeout(function() {
			let e = document.querySelector('#bd-settings-sidebar > span > span');
			e.innerHTML = e.innerHTML.replace('by', ' by ');
		}, 500);
	}
	
	function checkForUpdate() {
		const githubRaw = "https://raw.githubusercontent.com/mashirochan/Mashiro-chan/master/Plugins/" + getName() + "/" + getName() + ".plugin.js";
		$.get(githubRaw, (result) => {
			var ver = result.match(/"[0-9]+\.[0-9]+\.[0-9]+"/i);
			if (!ver) return;
			ver = ver.toString().replace(/"/g, "");
			this.remoteVersion = ver;
			ver = ver.split(".");
			var lver = this.getVersion().split(".");
			if (ver[0] > lver[0]) this.hasUpdate = true;
			else if (ver[0] == lver[0] && ver[1] > lver[1]) this.hasUpdate = true;
			else if (ver[0] == lver[0] && ver[1] == lver[1] && ver[2] > lver[2]) this.hasUpdate = true;
			else this.hasUpdate = false;
			if (this.hasUpdate) {
				this.showUpdateNotice();
			}
		});
	}

	function showUpdateNotice() {
		const updateLink = "https://betterdiscord.net/ghdl?url=https://github.com/mashirochan/Mashiro-chan/tree/master/Plugins/" + getName() + "/" + getName() + ".plugin.js"
		BdApi.clearCSS("pluginNoticeCSS")
		BdApi.injectCSS("pluginNoticeCSS", "#pluginNotice span, #pluginNotice span a {-webkit-app-region: no-drag;color:#fff;} #pluginNotice span a:hover {text-decoration:underline;}")
		let noticeElement = '<div class="notice notice-info" id="pluginNotice"><div class="notice-dismiss" id="pluginNoticeDismiss"></div>The following plugins have updates: &nbsp;<strong id="outdatedPlugins"></strong></div>'
		if (!$('#pluginNotice').length)  {
			$('.app.flex-vertical').children().first().before(noticeElement);
			$('.win-buttons').addClass("win-buttons-notice")
			$('#pluginNoticeDismiss').on('click', () => {
				$('.win-buttons').animate({top: 0}, 400, "swing", () => {$('.win-buttons').css("top","").removeClass("win-buttons-notice")});
				$('#pluginNotice').slideUp({complete: () => {$('#pluginNotice').remove()}});
			})
		}
		let pluginNoticeID = getName() + '-notice';
		let pluginNoticeElement = $('<span id="' + pluginNoticeID + '">');
		pluginNoticeElement.html('<a href="' + updateLink + '" target="_blank">' + getName() + '</a>');
		if (!$('#'+pluginNoticeID).length) {
			if ($('#outdatedPlugins').children('span').length) pluginNoticeElement.html(', ' + pluginNoticeElement.html());
			$('#outdatedPlugins').append(pluginNoticeElement);
		}
	}
	
	return FixVersionSpacing;
})();
