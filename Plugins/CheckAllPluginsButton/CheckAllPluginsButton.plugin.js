//META { "name": "CheckAllPluginsButton" } *//
var CheckAllPluginsButton = (function() {

	class CheckAllPluginsButton {
		
		constructor() {
			this.stylesheet_name = "cap-stylesheet";
			this.stylesheet = `.cap-check {height: 19px; width: auto; float: right; margin-bottom: 19px; border-radius: 5px; color: #fff; font-size: 13px; background: #7289da; cursor: pointer; padding: 1px 6px}
			.cap-uncheck {height: 19px; width: auto; float: right; margin-bottom: 19px; border-radius: 5px; color: #fff; font-size: 13px; background: #7289da; cursor: pointer; padding: 1px 6px; margin-left: 8px}`;
		}
		
		getName() { return "CheckAllPluginsButton"; }

		getDescription() { return "Plugin that adds check all and uncheck all buttons to the plugins menu."; }

		getAuthor() { return "Mashiro-chan"; }

		getVersion() { return "1.0.8"; }

		load() {
			this.checkForUpdate();
		}

		start() {
			$('.app').on('click.CheckAllPluginsButton', '#bd-settings-sidebar .ui-tab-bar-item:contains("Plugins")', this.addButtons.bind(this));
			$('.app').on('click.CheckAllPluginsButton', '#bd-settings-sidebar .ui-tab-bar-item:not(:contains("Plugins")), .side-2nYO0F .item-3879bf', this.removeButtons.bind(this));
			BdApi.clearCSS(this.stylesheet_name);
			BdApi.injectCSS(this.stylesheet_name, this.stylesheet);
			console.log(this.getName() + ' loaded. Current version: ' + this.getVersion());
			this.checkForUpdate();
		}

		stop() {
			$('*').off('.CheckAllPluginsButton');
			$('.cap-check').remove();
			$('.cap-uncheck').remove();
			BdApi.clearCSS(this.stylesheet_name);
		}	

		addButtons() {
			setTimeout(function() {
				$('.cap-check').remove();
				$('.cap-uncheck').remove();
				$('.content-column.default').prepend(`<button class="cap-check" onclick=BdApi.getPlugin("CheckAllPluginsButton").checkAllPlugins()>Check All</button>`)
					.prepend(`<button class="cap-uncheck" onclick=BdApi.getPlugin("CheckAllPluginsButton").uncheckAllPlugins()>Uncheck All</button>`);
			}, 50);
		}

		removeButtons() {
			$('.cap-check').remove();
			$('.cap-uncheck').remove();
		}

		checkAllPlugins() {
			$('input:checkbox:not(:checked)').trigger('click');
		}

		uncheckAllPlugins() {
			$('.bda-slist').find('li').each((_, entry) => {
				if ($(entry).find('.bda-name').text().indexOf('CheckAllPluginsButton') == -1) {
					$(entry).find('input:checkbox:checked').trigger('click');
				}
			});
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

	return CheckAllPluginsButton;
})();
