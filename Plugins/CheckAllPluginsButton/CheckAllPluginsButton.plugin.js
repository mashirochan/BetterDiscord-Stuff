//META { "name": "CheckAllPluginsButton" } *//
var CheckAllPluginsButton = (function() {

	class CheckAllPluginsButton {
		getName() { return 'CheckAllPluginsButton'; }

		getDescription() { return 'Plugin that adds check all and uncheck all buttons to the plugins menu.'; }

		getAuthor() { return 'Mashiro-chan'; }

		getVersion() { return '1.0.2'; }

		load() {
			this.checkForUpdate();
		}

		start() {
			$(document).on('click.CheckAllPluginsButton', '#bd-settings-sidebar .ui-tab-bar-item:contains("Plugins")', this.addButtons.bind(this));
			console.log(this.getName() + ' loaded. Current version: ' + this.getVersion());
			this.checkForUpdate();
		}

		stop() {
			$('*').off('.CheckAllPluginsButton');
			$('.cap-check').remove();
			$('.cap-uncheck').remove();
		}	

		addButtons() {
			setTimeout(function() {
				$('.cap-check').remove();
				$('.cap-uncheck').remove();
				$('.content-column.default').prepend(`<button class="cap-check" onclick=BdApi.getPlugin("CheckAllPluginsButton").checkAllPlugins() style="height: 19px; width: auto; float: right; margin-bottom: 19px; border-radius: 5px; color: #fff; font-size: 13px; background: #7289da; cursor: pointer; padding: 1px 6px;">Check All</button>`)
					.prepend(`<button class="cap-uncheck" onclick=BdApi.getPlugin("CheckAllPluginsButton").uncheckAllPlugins() style="height: 19px; width: auto; float: right; margin-bottom: 19px; border-radius: 5px; color: #fff; font-size: 13px; background: #7289da; cursor: pointer; padding: 1px 6px; margin-left: 8px;">Uncheck All</button>`);
			}, 100);
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
	
	return CheckAllPluginsButton;
})();
