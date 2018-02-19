//META { "name": "TransparencyPatcher" } *//
var TransparencyPatcher = (function() {

	class TransparencyPatcher {

		constructor() {
			this.stylesheet_name = "tp-stylesheet";
			this.stylesheet = `
			.tp-settings {position: relative}
			.tp-title {position: absolute; top: -30px; font-family: "Whitney", bold, sans-serif; display: block; max-height: 12px; font-size: 12px; font-weight: 700; width: 400px; color: #87909C; padding-bottom: 17px; border-bottom: 1px solid #3f4146}
			.tp-label {position: absolute; left: 10px; top: 25px; color: #b0b6b9}
			.tp-enable {position: absolute; left: 120px; top: 18px; color: #fff; background-color: #7289da; border-radius: 5px; height: 30px; width: 60px}
			.tp-disable {position: absolute; left: 200px; top: 18px; color: #fff; background-color: #7289da; border-radius: 5px; height: 30px; width: 60px}
			`;
		}

		getName() { return "TransparencyPatcher"; }

		getDescription() { return "Plugin that automatically enables client transparency."; }

		getAuthor() { return "Mashiro-chan"; }

		getVersion() { return "1.0.1"; }

		load() {
			this.checkForUpdate();
		}

		start() {
			BdApi.clearCSS(this.stylesheet_name);
			BdApi.injectCSS(this.stylesheet_name, this.stylesheet);
			console.log(this.getName() + ' loaded. Current version: ' + this.getVersion());
			this.checkForUpdate();
		}

		stop() {
			BdApi.clearCSS(this.stylesheet_name);
		}

		patchForTransparency(enable) {
			let app = require('electron').remote.app;
			let isCanary = false;
			
			if (process.argv0.includes('Canary')) isCanary = true;
			let appDataPath = app.getAppPath().substring(0, app.getAppPath().indexOf('Local')) + 'Roaming\\';
			
			let file = appDataPath + 'discord' + (isCanary ? 'canary' : '') + '\\' + app.getVersion() + '\\modules\\discord_desktop_core\\core\\app\\mainScreen.js';
			
			let line1Pattern = 'transparent: ';

			let line2Pattern = 'var splashScreen = _interopRequireWildcard(_splashScreen);';
			let line2ToAdd = '_electron.app.commandLine.appendSwitch(\'enable-transparent-visuals\');';
			
			let line3Pattern = 'title: \'Discord\',';
			let line3ToRemove = 'backgroundColor: ACCOUNT_GREY,';

			var fs = require("fs");
			fs.readFile(file, "utf8", (err, data) => {
				if (err) {
					console.error('TransparencyPatcher: error when reading file: ' + file, err);
					return;
				}
				
				let fileLines = data.split('\r\n');
				
				let line1Index = fileLines.findIndex(e => { return e.includes(line1Pattern); });
				if (enable && fileLines[line1Index].includes('true') || !enable && fileLines[line1Index].includes('false')) console.log('Transparent has already been set to ' + (enable ? 'true' : 'false') + '!');
				else {
					fileLines[line1Index] = '    transparent: ' + (enable ? 'true' : 'false') + ',';
					console.log('Transparent successfully set to ' + enable + '!');
				}
				
				let line2Index = fileLines.findIndex(e => { return e.includes(line2Pattern); });
				if (enable && fileLines[line2Index + 1].includes(line2ToAdd) || !enable && !fileLines[line2Index + 1].includes(line2ToAdd)) console.log('Transparent visuals have already been ' + (enable ? 'enabled' : 'disabled') + '!');
				else {
					if (enable) fileLines.splice(line2Index + 1, 0, line2ToAdd);
					else if (!enable) fileLines.splice(line2Index + 1, 1);
					console.log('Transparent visuals successfully ' + (enable ? 'enabled' : 'disabled') + '!');
				}
				
				let line3Index = fileLines.findIndex(e => { return e.includes(line3Pattern); });
				if (enable && !fileLines[line3Index + 1].includes(line3ToRemove) || !enable && fileLines[line3Index + 1].includes(line3ToRemove)) console.log('Background color has already been ' + (enable ? 'removed' : 'added') + '!');
				else {
					if (enable) fileLines.splice(line3Index + 1, 1);
					else if (!enable) fileLines.splice(line3Index + 1, 0, '    ' + line3ToRemove);
					console.log('Background color successfully ' + (enable ? 'removed' : 'added') + '!');
				}
				
				let toWrite = fileLines.join('\r\n');

				fs.writeFile(file, toWrite, err2 => {
					if (err2) console.error('TransparencyPatcher: error when reading file: ' + file, err2);
					else {
						console.log("The file was saved!");
						app.relaunch();
						app.exit();
					}
				}); 
			});
		}

		getSettingsPanel() {
			let title = this.getName() + ' v' + this.getVersion() + ' by ' + this.getAuthor();
			let html = '';
			html += '<div class="tp-settings">';
			html += '<span class="tp-title">' + title + '</span>';
			html += '<span class="tp-label">Transparency</span>';
			html += '<button class="tp-enable" onclick=BdApi.getPlugin("TransparencyPatcher").patchForTransparency(true)>Enable</button>';
			html += '<button class="tp-disable" onclick=BdApi.getPlugin("TransparencyPatcher").patchForTransparency(false)>Disable</button>';
			html += '</div>';
			return html;
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

	return TransparencyPatcher;
})();
