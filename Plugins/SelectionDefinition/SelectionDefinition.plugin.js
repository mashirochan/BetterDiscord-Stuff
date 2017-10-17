//META { "name": "SelectionDefinition" } *//
var SelectionDefinition = (function() {

	class SelectionDefinition {

		constructor() {
			this.stylesheet_name = "sd-stylesheet";
			this.stylesheet = `
			.sd-popup {position: absolute; white-space: pre-line; color: white; background: rgba(50, 50, 50, 0.7); padding: 6px; border-radius: 8px; display: none}
			.sd-word {font-weight: bold}
			.sd-pro {margin-left: 8px; font-size: 13px; color: rgba(255, 255, 255, 0.8) font-family: 'Roboto', arial, sans-serif}
			.sd-def {display: block; font-size: 12px; color: rgba(255, 255, 255, 0.7)}
			`;
		}

		getName() { return "SelectionDefinition"; }

		getDescription() { return "Plugin that provides a definition for selected words upon hover."; }

		getAuthor() { return "Mashiro-chan"; }

		getVersion() { return "1.0.0"; }

		load() {
			this.checkForUpdate();
		}

		start() {
			this.clientRect = [];
			this.oldSelectionText;
			this.wordData = {};
			
			$('.app').append('<div class="sd-popup">');
			$('.sd-popup').append('<span class="sd-word">').append('<span class="sd-pro">').append('<span class="sd-def">');
			
			$(document).on('mouseup.SelectionDefinition', () => {
				let selection = window.getSelection();
				let tempClientRect = selection.getRangeAt(0).getClientRects()[0];
				if (selection.anchorNode != null && tempClientRect && tempClientRect.width != 0) this.clientRect = tempClientRect;
			});
			
			$(document).on('mousemove.SelectionDefinition', ev => this.showPopup(ev));
			
			BdApi.clearCSS(this.stylesheet_name);
			BdApi.injectCSS(this.stylesheet_name, this.stylesheet);
			console.log(this.getName() + ' loaded. Current version: ' + this.getVersion());
			this.checkForUpdate();
		}

		stop() {
			$(document).off(".SelectionDefinition");
			$('[class^="sd-"]').remove();
			BdApi.clearCSS(this.stylesheet_name);
		}

		showPopup(ev) {
			$('.sd-popup').hide();
			if (ev.pageX >= this.clientRect.left && ev.pageX <= this.clientRect.right && ev.pageY >= this.clientRect.top  && ev.pageY <= this.clientRect.bottom) {
				let selectionText = this.getSelectionText();
				if (selectionText == '' || /([^a-z ])+/ig.test(selectionText)) $('sd-popup').hide();
				else {
					if (selectionText != this.oldSelectionText) this.wordData = this.getWordData(selectionText);
					this.oldSelectionText = selectionText;
					
					$('.sd-popup').show();
					$('.sd-word').text(this.wordData.word);
					$('.sd-pro').text('/' + this.wordData.pronunciation + '/');
					$('.sd-def').html(this.wordData.type + ' · <i>"' + this.wordData.definition + '."</i>');
					let newTop = this.clientRect.top - $('.sd-popup').outerHeight();
					let newLeft = this.clientRect.left;
					$('.sd-popup').css({"top": newTop, "left": newLeft});
				}
			}
		}

		getWordData(word) {
			let url = 'od-api.oxforddictionaries.com:443/api/v1/entries/en/'+ word.replace(/ /g, '_') + '/regions=us';
			let returnData = {
				word: '',
				definition: '',
				pronunciation: '',
				example: '',
				error: false;
			};
			
			$.ajax({
				url: 'https://cors-anywhere.herokuapp.com/' + url,
				type: 'GET',
				async: false,
				beforeSend: xhr => {
					xhr.setRequestHeader("Accept", "application/json");
					xhr.setRequestHeader("app_id", "4af625b3");
					xhr.setRequestHeader("app_key", "7d494264980005442c4ce94953da8105");
				},
				success: (data) => {
					try {
						returnData.word = data.results[0].word;
						returnData.type = data.results[0].lexicalEntries[0].lexicalCategory;
						returnData.definition = data.results[0].lexicalEntries[0].entries[0].senses[0].definitions[0];
						returnData.pronunciation = data.results[0].lexicalEntries[0].pronunciations[0].phoneticSpelling;
						returnData.example = data.results[0].lexicalEntries[0].entries[0].senses[0].examples[0].text;
					} catch (e) {
						console.error('SelectionDefinition: one or more data parameters could not be returned!');
					}
				},
				error: err => {
					returnData.error = true;
					console.error('SelectionDefinition: error retrieving data on that word or phrase!');
				}
			});
			return returnData;
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
