//META { "name": "AutoServerSelect" } *//
var AutoServerSelect = (function() {

	class AutoServerSelect {

		getName() { return "AutoServerSelect"; }

		getDescription() { return "Plugin that automatically navigates to the last server you selected upon startup."; }

		getAuthor() { return "Mashiro-chan"; }

		getVersion() { return "1.0.0"; }

		load() {
			this.checkForUpdate();
		}

		start() {
			let server = bdPluginStorage.get("AutoServerSelect", "server");
			if (!server) return;
			
			$('.guild-inner a[href^="' + server + '"]')[0].click();
			
			console.log(this.getName() + ' loaded. Current version: ' + this.getVersion());
			this.checkForUpdate();
		}

		onSwitch() {
			let server = $('.guild.selected .avatar-small').attr('href');
			server = server.match(/\/channels\/[0-9]+\//g);
			bdPluginStorage.set("AutoServerSelect", "server", server);
		}

		stop() { }

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

	return AutoServerSelect;
})();
