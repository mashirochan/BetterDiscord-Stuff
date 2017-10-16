//META { "name": "SelectionDefinition" } *//
var SelectionDefinition = (function() {

	class SelectionDefinition {
		getName() { return "SelectionDefinition"; }

		getDescription() { return "Plugin that provides a definition for selected words upon hover."; }

		getAuthor() { return "Mashiro-chan"; }

		getVersion() { return "1.0.0"; }

		load() {
			this.checkForUpdate();
		}

		start() {
			var cr = [];
			console.log(this.getName() + ' loaded. Current version: ' + this.getVersion());
			$('#app-mount').append('<div id="popup"></div>');
			
			$(document).on('mouseup.SelectionDefinition', () => {
				cr = window.getSelection().getRangeAt(0).getClientRects();
			});

			$(document).on('mousemove.SelectionDefinition', ev => {
				for (var i in cr) {
					$('#popup').text('').hide();
					if (ev.pageX >= cr[i].left && ev.pageX <= cr[i].right && ev.pageY >= cr[i].top  && ev.pageY <= cr[i].bottom) {
						$('#popup').text(this.getSelectionText()).show();
						//.css({ top: cr[0].top - $('#popup').outerHeight(), left: cr[0].left })
						console.log('top: ' + (cr[0].top - $('#popup').outerHeight()));
						console.log('left: ' + cr[0].left);
						$('#popop').css("position", "absolute");
						$('#popup').css("top", () => { cr[0].top - $('#popup').outerHeight() });
						$('#popup').css("left", () => { cr[0].left });
						break;
					}
				}
			});
			this.checkForUpdate();
		}

		stop() {
			$(document).off(".SelectionDefinition");
			$('#app-mount').remove('#popup');
		}	

		test() {
			$.get()
		}

		getSelectionText() {
			var text = '';
			if (window.getSelection) {
				text = window.getSelection().toString();
			} else if (document.selection && document.selection.type != "Control") {
				text = document.selection.createRange().text;
			}
			return text;
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
	
	return SelectionDefinition;
})();
