//META { "name": "PasteSend" } *//
var PasteSend = (function() {

	class PasteSend {

		constructor() {
			this.stylesheet_name = "ps-stylesheet";
			this.stylesheet = `
			.ps-settings {position: relative}
			.ps-title {position: absolute; top: -30px; font-family: "Whitney", bold, sans-serif; display: block; max-height: 12px; font-size: 12px; font-weight: 700; width: 400px; color: #87909C; padding-bottom: 17px; border-bottom: 1px solid #3f4146}
			.ps-hotkeyLabel {position: absolute; left: 10px; top: 5px; color: #b0b6b9}
			#ps-hotkeyInput {position: absolute; left: 70px; top: 3px; border: none; border-radius: 8px; padding: 1px 8px 0px 8px; color: rgba(255, 255, 255, 0.7); font-size: 14px; height: 16px; background: rgba(100, 100, 100, 0.5)}
			.ps-typeLabel {position: absolute; left: 10px; top: 40px; color: #b0b6b9}
			#ps-typeInput {position: absolute; left: 95px; top: 39px; border: none; border-radius: 8px; padding-left: 8px; color: rgba(255, 255, 255, 0.7); width: auto; background: rgba(100, 100, 100, 0.5)}
			#ps-typeInput:focus {outline: none; box-shadow: 0 0 3pt 2pt rgba(255, 98, 98, 0.7)}
			.ps-change {position: absolute; left: 220px; top: -4px; color: #fff; background-color: #7289da; border-radius: 5px; height: 30px; width: 60px}
			.ps-save {position: absolute; right: 5px; top: 41px; color: #fff; background-color: #7289da; border-radius: 5px; height: 30px; width: 60px}
			.ps-item {color: rgba(255, 255, 255, 0.6); margin: 2px 0px; padding: 6px 9px; line-height: 16px; font-size: 13px; font-weight: 500;}
			.ps-item:hover {color: #FFF; background: rgba(0, 0, 0, 0.2);}
			`;
			
			this.serverContextEntryMarkup =
			`<div class="item-group">
				<div class="ps-item">
					<span>Paste and Send</span>
					<div class="hint"></div>
				</div>
			</div>`;
		}

		getName() { return "PasteSend"; }

		getDescription() { return "Plugin that automatically sends pasted text (default shortcut is Ctrl + Shift + V)."; }

		getAuthor() { return "Mashiro-chan"; }

		getVersion() { return "1.0.5"; }

		load() {
			this.checkForUpdate();
		}

		start() {
			this.setListener();
			
			this.serverContextObserver = new MutationObserver((changes, _) => {
				changes.forEach(
					(change, i) => {
						if (change.addedNodes) {
							change.addedNodes.forEach((node) => {
								if (node.nodeType == 1 && node.className.includes("contextMenu")) {
									this.onContextMenu(node);
								}
							});
						}
					}
				);
			});
			if (document.querySelector("#app-mount")) this.serverContextObserver.observe(document.querySelector("#app-mount"), {childList: true});
			
			BdApi.clearCSS(this.stylesheet_name);
			BdApi.injectCSS(this.stylesheet_name, this.stylesheet);
			
			console.log(this.getName() + ' loaded. Current version: ' + this.getVersion());
			this.checkForUpdate();
		}

		stop() {
			$('*').off('.PasteSend');
			$('*').off('.PasteSendChange');
			$('.ps-item').remove();
			BdApi.clearCSS(this.stylesheet_name);
		}

		onContextMenu(context) {
			if ($('.label-2CGfN3').length) {
				$(context).append(this.serverContextEntryMarkup);
			}
		}

		setListener() {
			let storageKeys = bdPluginStorage.get("PasteSend", "storageKeys");
			let pasteType = bdPluginStorage.get("PasteSend", "pasteType");
			storageKeys = storageKeys ? storageKeys : ["Control", "Shift", "V"];
			pasteType = pasteType ? pasteType : 'Append';
			let keys = [];
			let cooldown = 1 * 1000;
			let canUse = true;
			$('*').off('.PasteSend');
			$('*').off('.PasteSendChange');

			$('#app-mount').on('keydown.PasteSend', '.textArea-20yzAH', e => {
				if (!canUse || storageKeys.length < 1) return;
				if (!keys.includes(e.key)) keys.push(e.key);
				if (storageKeys.every(storageKey => keys.includes(storageKey))) {
					setImmediate(() => {
						this.sendMessage(storageKeys, pasteType, 'keyboard');
					});
					canUse = false;
					setTimeout(() => { canUse = true; }, cooldown);
				}
			});
			
			$('#app-mount').on('keyup.PasteSend', '.textArea-20yzAH', e => {
				keys.splice(keys.indexOf(e.key), 1);
			});
			
			$('#app-mount').on('click.PasteSend', '.ps-item', () => this.sendMessage(storageKeys, pasteType, 'context'));
		}

		sendMessage(storageKeys, pasteType, inputType) {
			let text = '';
			let clipboardText = require('electron').clipboard.readText();
			if (pasteType == 'Replace') text = clipboardText;
			else if (pasteType == 'Append') {
				text = $('.textArea-20yzAH').val();
				storageKeys.every(storageKey => {
					if (storageKey.length == 1) text = text.substring(0, text.lastIndexOf(storageKey, clipboardText.length));
				});
				if (!storageKeys.includes("V") || !storageKeys.includes("Control") || inputType == 'context') text += clipboardText;
			}
			let textarea = document.querySelector('[class*="innerEnabled"]');
			if (textarea) {
				let textinput = textarea.querySelector("textarea");
				if (textinput) {
					textinput.focus();
					textinput.selectionStart = 0;
					textinput.selectionEnd = textinput.value.length;
					document.execCommand("insertText", false, text);
					let options = { key: "Enter", code: "Enter", which: 13, keyCode: 13, bubbles: true };
					let down = new KeyboardEvent("keydown", options);
					Object.defineProperty(down, "keyCode", {value: 13});
					Object.defineProperty(down, "which", {value: 13});
					let press = new KeyboardEvent("keypress", options);
					Object.defineProperty(press, "keyCode", {value: 13});
					Object.defineProperty(press, "which", {value: 13});
					textinput.dispatchEvent(down);
					textinput.dispatchEvent(press);
				}
			}
		}

		getSettingsPanel() {
			let storageKeys = bdPluginStorage.get("PasteSend", "storageKeys");
			let pasteType = bdPluginStorage.get("PasteSend", "pasteType");
			storageKeys = storageKeys ? storageKeys : ["Control", "Shift", "V"];
			pasteType = pasteType ? pasteType : 'Append';
			
			let title = this.getName() + ' v' + this.getVersion() + ' by ' + this.getAuthor();
			let html = '';
			html += '<div class="ps-settings">';
			html += '<span class="ps-title">' + title + '</span>';
			
			html += '<label class="ps-hotkeyLabel">Hotkey</label>';
			
			let hotkeyString = '';
			for (let key in storageKeys) {
				if (key == storageKeys.length - 1) hotkeyString += storageKeys[key];
				else hotkeyString += storageKeys[key] + ' + ';
			}
			
			html += '<label id="ps-hotkeyInput">' + hotkeyString + '</label>';
			
			html += '<label class="ps-typeLabel" for="ps-typeInput">Paste Type</label>';
			html += '<select id="ps-typeInput" name="paste type">';
			html += '<option value="Append"' + (pasteType == 'Append' ? 'selected' : '') + '>Append</option>';
			html += '<option value="Replace"' + (pasteType == 'Replace' ? 'selected' : '') + '>Replace</option>';
			html += '</select>';
			
			html += '<button class="ps-change" onclick=BdApi.getPlugin("PasteSend").changeHotkey()>Change</button>';
			html += '<button class="ps-save" onclick=BdApi.getPlugin("PasteSend").save()>Save</button>';
			html += '</div>';
			return html;
		}

		changeHotkey() {
			let active = true;
			let keys = [];
			let hotkeyInput = $('#ps-hotkeyInput');
			hotkeyInput.text('');
			hotkeyInput.css('box-shadow', '0 0 3pt 2pt rgba(255, 98, 98, 0.7)');
			
			$('#app-mount').on('keydown.PasteSendChange', e => {
				if (!active || keys.includes(e.key)) return;
				keys.push(e.key);
				let keysText = '';
				for (let i in keys) {
					if (i == keys.length - 1) keysText += keys[i];
					else keysText += keys[i] + ' + ';
				}
				hotkeyInput.text(keysText);
				if (keys.length == 3) {
					active = false;
					hotkeyInput.css('box-shadow', 'none');
					$('*').off('.PasteSendChange');
				}
			});
			
			$('#app-mount').on('keyup.PasteSendChange', e => {
				active = false;
				hotkeyInput.css('box-shadow', 'none');
				$('*').off('.PasteSendChange');
			});
		}
		
		save() {
			let storageKeys = $('#ps-hotkeyInput').text().split(' + ');
			let pasteType = $('#ps-typeInput').val();
			bdPluginStorage.set("PasteSend", "storageKeys", storageKeys);
			bdPluginStorage.set("PasteSend", "pasteType", pasteType);
			this.setListener();
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

	return PasteSend;
})();
