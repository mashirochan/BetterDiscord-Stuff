//META { "name": "HorizontalCodeScroll" } *//
var HorizontalCodeScroll = (function() {

	class HorizontalCodeScroll {
		
		constructor() {
			this.stylesheet_name = "hcs-stylesheet";
			this.stylesheet = `
			.theme-dark .message-group .comment .markup pre {white-space: pre; overflow-x: auto}
			.hcs-title {color: #fff}
			.hcs-speedLabel { }
			#hcs-speedInput { }
			.hcs-typeLabel { }
			#hcs-typeInput { }
			.hcs-save {float: right}
			`;
		}
		
		getName() { return "HorizontalCodeScroll"; }

		getDescription() { return "Plugin for horizontal scrolling in Codeblocks."; }

		getAuthor() { return "Mashiro-chan, spthiel"; }

		getVersion() { return "1.0.4"; }

		load() {
			this.checkForUpdate();
		}

		start() {
			$('#app-mount').on('mousewheel.HorizontalCodeScroll', e => this.scrollHorizontally(e));
			BdApi.clearCSS(this.stylesheet_name);
			BdApi.injectCSS(this.stylesheet_name, this.stylesheet);
			console.log(this.getName() + ' loaded. Current version: ' + this.getVersion());
			this.checkForUpdate();
		}

		stop() {
			$("*").off(".HorizontalCodeScroll");
			BdApi.clearCSS(this.stylesheet_name);
		}
		
		getCodeBelowMouse(e) {
			let x = e.clientX,
				y = e.clientY,
				elementMouseIsOver = document.elementFromPoint(x, y);

			let currentStack = 0;
			let maxStack = 10;

			while (elementMouseIsOver.tagName !== 'HTML' && currentStack <= maxStack) {
				currentStack = currentStack + 1;
				if (elementMouseIsOver.tagName == 'CODE') {
					if (!this.hasScrollBar(elementMouseIsOver)) {
						return null;
					}
					return elementMouseIsOver;
				}
				elementMouseIsOver = elementMouseIsOver.parentElement;
			}
			return null;
		}

		scrollHorizontally(e) {
			let scrollSpeed = bdPluginStorage.get("HorizontalCodeScroll", "scrollSpeed");
			let scrollType = bdPluginStorage.get("HorizontalCodeScroll", "scrollType");
			scrollSpeed = scrollSpeed ? scrollSpeed : 40;
			scrollType = scrollType ? scrollType : 'Manual';
			
			e = window.event || e;
			let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
			let elementToScroll = this.getCodeBelowMouse(e);
			if (elementToScroll !== null) {
				if (this.scrollType == 'Manual') elementToScroll.scrollLeft -= (delta * this.scrollSpeed);
				else elementToScroll.scrollLeft -= (delta * this.getScrollMultipler(elementToScroll));
				e.preventDefault();
			}
		}

		getScrollMultipler(codeblock) {
			let prototypecodeblock = $(codeblock);
			return prototypecodeblock.outerWidth() * 0.8;
		}
		
		hasScrollBar(e) {
			return e.scrollWidth > e.clientWidth;
		}
		
		getSettingsPanel() {
			let scrollSpeed = bdPluginStorage.get("HorizontalCodeScroll", "scrollSpeed");
			let scrollType = bdPluginStorage.get("HorizontalCodeScroll", "scrollType");
			scrollSpeed = scrollSpeed ? scrollSpeed : 40;
			scrollType = scrollType ? scrollType : 'Manual';
			
			let title = this.getName() + ' v' + this.getVersion() + ' by ' + this.getAuthor();
			let html = '';
			html += '<span class="hcs-title">' + title + '</span>';
			html += '<br>';
			html += '<label class="hcs-speedLabel" for="hcs-speedInput">Scroll Speed</label>';
			
			if (scrollType == 'Automatic')
				html += '<input type="text" id="hcs-speedInput" value="' + scrollSpeed + '" disabled>';
			else
				html += '<input type="text" id="hcs-speedInput" value="' + scrollSpeed + '">';

			html += '<br>';
			html += '<label class="hcs-typeLabel" for="hcs-typeInput">Scroll Type</label>';
			html += '<select id="hcs-typeInput" onchange=BdApi.getPlugin("HorizontalCodeScroll").updateSettings() name="scroll type">';
			html += '<option value="Manual"' + (scrollType == 'Manual' ? 'selected' : '') + '>Manual</option>';
			html += '<option value="Automatic"' + (scrollType == 'Automatic' ? 'selected' : '') + '>Automatic</option>';
			html += '</select>';
			html += '<button class="hcs-save" onclick=BdApi.getPlugin("HorizontalCodeScroll").save()>Save</button>';
			return html;
		}
		
		updateSettings() {
			let speedInput = $('#hcs-speedInput');
			let typeInput = $('#hcs-typeInput');
			let scrollSpeed = parseInt(speedInput.val());
			let scrollType = typeInput.val();
			
			if (scrollType == 'Automatic') speedInput.prop("disabled", true);
			else speedInput.prop("disabled", false);
		}
		
		save() {
			let scrollSpeed = parseInt($('#hcs-speedInput').val());
			let scrollType = $('#hcs-typeInput').val();
			bdPluginStorage.set("HorizontalCodeScroll", "scrollSpeed", scrollSpeed);
			bdPluginStorage.set("HorizontalCodeScroll", "scrollType", scrollType);
		}
		
		checkForUpdate() {
			const githubRaw = "https://raw.githubusercontent.com/mashirochan/Mashiro-chan/master/Plugins/" + this.getName() + "/" + this.getName() + ".plugin.js";
			$.get(githubRaw, (result) => {
				let ver = result.match(/"[0-9]+\.[0-9]+\.[0-9]+"/i);
				if (!ver) return;
				ver = ver.toString().replace(/"/g, "");
				this.remoteVersion = ver;
				ver = ver.split(".");
				let lver = this.getVersion().split(".");
				if (ver[0] > lver[0]) this.hasUpdate = true;
				else if (ver[0] == lver[0] && ver[1] > lver[1]) this.hasUpdate = true;
				else if (ver[0] == lver[0] && ver[1] == lver[1] && ver[2] > lver[2]) this.hasUpdate = true;
				else this.hasUpdate = false;
				if (this.hasUpdate) {
					this.showUpdateNotice();
				}
			});
		}

		showUpdateNotice() {
			const updateLink = "https://betterdiscord.net/ghdl?url=https://github.com/mashirochan/Mashiro-chan/blob/master/Plugins/" + this.getName() + "/" + this.getName() + ".plugin.js";
			BdApi.clearCSS("pluginNoticeCSS");
			BdApi.injectCSS("pluginNoticeCSS", "#pluginNotice span, #pluginNotice span a {-webkit-app-region: no-drag;color:#fff;} #pluginNotice span a:hover {text-decoration:underline;}");
			let noticeElement = '<div class="notice notice-info" id="pluginNotice"><div class="notice-dismiss" id="pluginNoticeDismiss"></div>The following plugins have updates: &nbsp;<strong id="outdatedPlugins"></strong></div>';
			if (!$('#pluginNotice').length)  {
				$('.app.flex-vertical').children().first().before(noticeElement);
				$('.win-buttons').addClass("win-buttons-notice");
				$('#pluginNoticeDismiss').on('click', () => {
					$('.win-buttons').animate({ top: 0 }, 400, "swing", () => { $('.win-buttons').css("top","").removeClass("win-buttons-notice"); });
					$('#pluginNotice').slideUp({ complete: () => { $('#pluginNotice').remove(); } });
				});
			}
			let pluginNoticeID = this.getName() + '-notice';
			let pluginNoticeElement = $('<span id="' + pluginNoticeID + '">');
			pluginNoticeElement.html('<a href="' + updateLink + '" target="_blank">' + this.getName() + '</a>');
			if (!$('#' + pluginNoticeID).length) {
				if ($('#outdatedPlugins').children('span').length) pluginNoticeElement.html(', ' + pluginNoticeElement.html());
				$('#outdatedPlugins').append(pluginNoticeElement);
			}
		}
	}

	return HorizontalCodeScroll;
})();
