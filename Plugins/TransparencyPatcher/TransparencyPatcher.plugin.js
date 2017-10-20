//META { "name": "TransparencyPatcher" } *//
var TransparencyPatcher = (function() {

	class TransparencyPatcher {

		getName() { return "TransparencyPatcher"; }

		getDescription() { return "Plugin that automatically enables client transparency."; }

		getAuthor() { return "Mashiro-chan"; }

		getVersion() { return "1.0.0"; }

		load() {
			this.checkForUpdate();
		}

		start() {			
			console.log(this.getName() + ' loaded. Current version: ' + this.getVersion());
			this.checkForUpdate();
		}

		stop() {
			
		}
		
		patchForTransparency(undo) {
			var errors = '';

			let file = require('electron').remote.app.getAppPath() + '\\index.js';
			
			let line1Pattern = 'transparent: ';
			let line1Original = 'transparent: false';
			let line1New = 'transparent: true';

			let line2Pattern = 'var app = _electron2.default.app;';
			let line2ToAdd = 'app.commandLine.appendSwitch(\'enable-transparent-visuals\');';
			
			let line3Pattern = 'backgroundColor: ';
			let line3Original = 'backgroundColor: ACCOUNT_GREY';
			let line3New = 'backgroundColor: \'#00000000\'';

			//open file
			fs = require("fs");
			fs.readFile(file, "utf8", function (err,data) {
				if (err) {
					alert("Unable to read file " + file + ". See console for error object.");
					console.error("Error while reading file: ", err);
					return;
				}

				//We can easily just replace our patterns with our new lines, 
				//but that's just too easy, so let's loop through every line
				//and do unneeded error checks.
				//Yes, I wrote this afer finishing the code below.

				//cut into a billion little pieces
				var split = data.split('\r\n');

				//find the right lines
				for (var i = 0; i < split.length; i++) {
					if (split[i].indexOf(line1Pattern) !== -1) {
						var origaa = split[i];
						if (!undo) {	//false to true
							if (split[i].indexOf(line1Original) !== -1) {
								split[i] = split[i].replace(line1Original, line1New);
								console.log("Patched 'transparent: false' to true on line " + (i+1));
							} else {
								//already enabled
								console.warn("Already patched transparent: false!");
								errors += 'Already patched "transparent: false"!\n';
							}
						} else {	//true to false, undo patch
							if (split[i].indexOf(line1New) !== -1) {
								split[i] = split[i].replace(line1New, line1Original);
								console.log("Patched 'transparent: true' to false on line " + (i+1));
							} else {
								//already enabled
								console.warn("Already patched transparent: false!");
								errors += 'Already patched "transparent: false"!\n';
							}
						}
					} 
					if (split[i].indexOf(line2Pattern) !== -1) {	//found line to patch
						if (!undo) {
							if (split[i].indexOf(line2ToAdd) === -1) {	//patch not added yet
								split[i] += line2ToAdd;
								console.log("Added enable-transparent-visuals on line " + (i+1));
							} else {
								//already added
								console.warn("Already added enable-transparent-visuals!");
								errors += 'Already added "enable-transparent-visuals"!\n';
							}
						} else {
							if (split[i].indexOf(line2ToAdd) !== -1) {	//patch already added
								split[i] = line2Pattern;
								console.log("Removed enable-transparent-visuals on line " + (i+1) + " by restoring the original.");
							} else {
								//already removed
								console.warn("enable-transparent-visuals was not present on line " + (i+1) + "!");
								errors += "enable-transparent-visuals was not present on line " + (i+1) + "!\n";
							}
						}
					}
					if (split[i].indexOf(line3Pattern) !== -1) {
						var origaa = split[i];
						if (!undo) {	//false to true
							if (split[i].indexOf(line3Original) !== -1) {
								split[i] = split[i].replace(line3Original, line3New);
								console.log("Patched backgroundColor: 'ACCOUNT_GREY' to '#00000000' on line " + (i+1));
							} else {
								//already enabled
								console.warn("Already patched backgroundColor: 'ACCOUNT_GREY'!");
								errors += 'Already patched backgroundColor: "ACCOUNT_GREY"!\n';
							}
						} else {	//true to false, undo patch
							if (split[i].indexOf(line3New) !== -1) {
								split[i] = split[i].replace(line3New, line3Original);
								console.log("Patched backgroundColor: '#00000000' to 'ACCOUNT_GREY' on line " + (i+1));
							} else {
								//already enabled
								console.warn("Already patched backgroundColor: '#00000000'!");
								errors += 'Already patched backgroundColor: "#00000000"!\n';
							}
						}
					} 
				}

				//join everything again
				var toWrite = split.join('\r\n');

				//write
				fs.writeFile(file, toWrite, function(err2) {
					if(err2) {
						//alert("Unable to write file to " + file + ". See console for error object.");
						errors += "Unable to write file to " + file + ". See console for error object.";
						console.error("Error while writing file: ", err2);
					}

					console.log("The file was saved!");

					if (errors !== "")
						alert(errors, "We may or may not have some problems...\n\n" + errors);
					else
						alert("Edited config file has been written!\n\nPlease restart Discord and then reload using CTRL+R to complete the patch.", "Success!");
				}); 
			});
		};
		
		getSettingsPanel() {
			let html = '';
			html += '<h3>Settings Panel</h3>';
			let js1 = 'BdApi.getPlugin("' + this.getName() + '").patchForTransparency(false);';
			let js2 = 'BdApi.getPlugin("' + this.getName() + '").patchForTransparency(true);';
			html += 'Use these buttons to apply or remove the patch: </br>';
			html += '<button onclick="' + js1 + '">Enable patch</button>';
			html += '<button onclick="' + js2 + '">Disable patch</button>';

			return string;
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
