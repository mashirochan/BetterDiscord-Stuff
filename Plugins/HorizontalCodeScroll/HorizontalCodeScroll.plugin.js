//META { "name": "HorizontalCodeScroll" } *//
var HorizontalCodeScroll = (function() {

	class HorizontalCodeScroll {

		constructor() {
			this.stylesheet_name = "hcs-stylesheet";
			this.stylesheet = `
			.theme-dark .message-group .comment .markup pre {white-space: pre; overflow-x: auto}
			.hcs-settings {position: relative}
			.hcs-title {position: absolute; top: -30px; font-family: "Whitney", bold, sans-serif; display: block; max-height: 12px; font-size: 12px; font-weight: 700; width: 400px; color: #87909C; padding-bottom: 17px; border-bottom: 1px solid #3f4146}
			.hcs-speedLabel {position: absolute; left: 10px; top: 5px; color: #b0b6b9}
			#hcs-speedInput {position: absolute; left: 100px; top: 3px; border: none; border-radius: 8px; padding-left: 8px; color: rgba(255, 255, 255, 0.7); width: 40px; background: rgba(100, 100, 100, 0.5)}
			#hcs-speedInput:focus {outline: none; box-shadow: 0 0 3pt 2pt rgba(114, 137, 218, 0.7)}
			#hcs-speedInput:disabled {color: rgba(255, 255, 255, 0.3); background: rgba(100, 100, 100, 0.2)}
			.hcs-typeLabel {position: absolute; left: 10px; top: 40px; color: #b0b6b9}
			#hcs-typeInput {position: absolute; left: 95px; top: 39px; border: none; border-radius: 8px; padding-left: 8px; color: rgba(255, 255, 255, 0.7); width: auto; background: rgba(100, 100, 100, 0.5)}
			#hcs-typeInput:focus {outline: none; box-shadow: 0 0 3pt 2pt rgba(114, 137, 218, 0.7)}
			.hcs-lockLabel {position: absolute; left: 160px; top: 5px; color: #b0b6b9}
			#hcs-lockInput {position: absolute; left: 245px; top: 4px; border: none; border-radius: 8px; padding-left: 8px; color: rgba(255, 255, 255, 0.7); width: auto; background: rgba(100, 100, 100, 0.5)}
			#hcs-lockInput:focus {outline: none; box-shadow: 0 0 3pt 2pt rgba(114, 137, 218, 0.7)}
			.hcs-save {position: absolute; right: 5px; top: 41px; color: #fff; background-color: #7289da; border-radius: 5px; height: 30px; width: 60px}
			`;
		}

		getName() { return "HorizontalCodeScroll"; }

		getDescription() { return "Plugin for horizontal scrolling in Codeblocks."; }

		getAuthor() { return "Mashiro-chan, spthiel"; }

		getVersion() { return "1.0.8"; }

		load() {
			this.checkForUpdate();
		}

		start() {
			this.setListener();
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

		scrollHorizontally(e, scrollSpeed, scrollType, scrollLock) {
			e = window.event || e;
			let elementToScroll = this.getCodeBelowMouse(e);
			if (elementToScroll !== null) {
				let delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
				let maxScrollLeft = elementToScroll.scrollWidth - elementToScroll.clientWidth;
				if (scrollType == 'Manual') {
					elementToScroll.scrollLeft -= (delta * scrollSpeed);
				} else {
					elementToScroll.scrollLeft -= (delta * this.getScrollMultipler(elementToScroll));
				}
				if (elementToScroll.scrollLeft != maxScrollLeft && elementToScroll.scrollLeft != 0 && scrollLock === 'Disabled') e.preventDefault();
				else if (scrollLock === 'Enabled') e.preventDefault();
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
			let settings = bdPluginStorage.get("HorizontalCodeScroll", "settings");
			let scrollSpeed = (settings && settings[0]) ? settings[0] : 200;
			let scrollType = (settings && settings[1]) ? settings[1] : 'Manual';
			let scrollLock = (settings && settings[2]) ? settings[2] : 'Enabled';
			
			let title = this.getName() + ' v' + this.getVersion() + ' by ' + this.getAuthor();
			let html = '';
			html += '<div class="hcs-settings">';
			html += '<span class="hcs-title">' + title + '</span>';
			html += '<label class="hcs-speedLabel" for="hcs-speedInput">Scroll Speed</label>';
			
			if (scrollType == 'Automatic')
				html += '<input type="text" id="hcs-speedInput" value="' + scrollSpeed + '" disabled>';
			else
				html += '<input type="text" id="hcs-speedInput" value="' + scrollSpeed + '">';

			html += '<label class="hcs-typeLabel" for="hcs-typeInput">Scroll Type</label>';
			html += '<select id="hcs-typeInput" onchange=BdApi.getPlugin("HorizontalCodeScroll").updateSettings() name="scroll type">';
			html += '<option value="Manual"' + (scrollType == 'Manual' ? 'selected' : '') + '>Manual</option>';
			html += '<option value="Automatic"' + (scrollType == 'Automatic' ? 'selected' : '') + '>Automatic</option>';
			html += '</select>';
			
			html += '<label class="hcs-lockLabel" for="hcs-lockInput">Scroll Lock</label>';
			html += '<select id="hcs-lockInput" name="scroll lock">';
			html += '<option value="Enabled"' + (scrollLock == 'Enabled' ? 'selected' : '') + '>Enabled</option>';
			html += '<option value="Disabled"' + (scrollLock == 'Disabled' ? 'selected' : '') + '>Disabled</option>';
			html += '</select>';
			
			html += '<button class="hcs-save" onclick=BdApi.getPlugin("HorizontalCodeScroll").save()>Save</button>';
			html += '</div>';
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
			let scrollLock = $('#hcs-lockInput').val();
			bdPluginStorage.set("HorizontalCodeScroll", "settings", [scrollSpeed, scrollType, scrollLock]);
			this.setListener();
		}
		
		setListener() {
			let settings = bdPluginStorage.get("HorizontalCodeScroll", "settings");
			let scrollSpeed = (settings && settings[0]) ? settings[0] : 200;
			let scrollType = (settings && settings[1]) ? settings[1] : 'Manual';
			let scrollLock = (settings && settings[2]) ? settings[2] : 'Enabled';
			
			$('*').off('.HorizontalCodeScroll');
			$('#app-mount').on('mousewheel.HorizontalCodeScroll', e => this.scrollHorizontally(e, scrollSpeed, scrollType, scrollLock));
		}

		checkForUpdate() {
			const githubRaw = "https://raw.githubusercontent.com/mashirochan/Mashiro-chan/master/Plugins/" + this.getName() + "/" + this.getName() + ".plugin.js";
			$.get(githubRaw, (result) => {
				let ver = result.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i);
				if (!ver) return;
				ver = ver.toString().replace(/"/g, "");
				ver = ver.split(".");
				let lver = this.getVersion().split(".");
				let hasUpdate = false;
				if (ver[0] > lver[0]) hasUpdate = true;
				else if (ver[0] == lver[0] && ver[1] > lver[1]) hasUpdate = true;
				else if (ver[0] == lver[0] && ver[1] == lver[1] && ver[2] > lver[2]) hasUpdate = true;
				if (hasUpdate) this.showUpdateNotice(this.getName());
				else this.removeUpdateNotice(this.getName());
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
					$('.win-buttons').animate({ top: 0 }, 400, "swing", () => { $('.win-buttons').css("top", "").removeClass("win-buttons-notice"); });
					$('#pluginNotice').slideUp({ complete: () => { $('#pluginNotice').remove(); }});
				});
			}
			let pluginNoticeID = this.getName() + '-notice';
			if (!$('#' + pluginNoticeID).length) {
				let pluginNoticeElement = $('<span id="' + pluginNoticeID + '">');
				pluginNoticeElement.html('<a href="' + updateLink + '" target="_blank">' + this.getName() + '</a>');
				if ($('#outdatedPlugins').children('span').length) $('#outdatedPlugins').append("<span class='separator'>, </span>");
				$('#outdatedPlugins').append(pluginNoticeElement);
			}
		}

		removeUpdateNotice() {
			let notice = $('#' + this.getName() + '-notice');
			if (notice.length) {
				if (notice.next('.separator').length) notice.next().remove();
				else if (notice.prev('.separator').length) notice.prev().remove();
				notice.remove();
			}
			if (!$('#outdatedPlugins').children('span').length) $('#pluginNoticeDismiss').click();
		}
	}

	return HorizontalCodeScroll;
})();
