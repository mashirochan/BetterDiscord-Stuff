//META { "name": "EmoteBlacklistRedux" } *//
var EmoteBlacklistRedux = (function() {

	class EmoteBlacklistRedux {

		constructor() {
			this.stylesheet_name = "ebr_stylesheet";
			this.stylesheet = `.blacklist {display: none; position: absolute; width: 15px; height: 15px; left: -7px; top: -7px; background-color: #303030; border: none; border-radius: 5px; cursor: pointer}
			.blacklist:after {position: absolute; top: 0; bottom: 0; left: 0; right: 0; content: '\\d7'; font-size: 19px; color: #FFF; line-height: 15px; text-align: center}
			.emotewrapper:hover .blacklist {display: block}`;
		}

		getName() { return "EmoteBlacklistRedux"; }

		getDescription() { return "A re-creation of Jiik's Emote Blacklist, now with user friendliness in mind."; }

		getAuthor() { return "Mashiro-chan"; }

		getVersion() { return "1.0.2"; }

		load() {
			this.checkForUpdate();
		}

		start() {
			window.ebrEnabled = true;			
			
			this.resetBemotes();
			
			$(document).on('mouseover.EmoteBlacklistRedux', '.emotewrapper', this.addButton.bind(this));
			
			BdApi.clearCSS(this.stylesheet_name);
			BdApi.injectCSS(this.stylesheet_name, this.stylesheet);
			
			console.log(this.getName() + ' loaded. Current version: ' + this.getVersion());
			this.checkForUpdate();
		}

		stop() {
			window.ebrEnabled = false;
			$('.blacklist').remove();
			$(document).off('mouseover.EmoteBlacklistRedux', '.emotewrapper');
			BdApi.clearCSS(this.stylesheet_name);
			this.clear();
		}

		resetBemotes() {
			let blacklist = bdPluginStorage.get("EmoteBlacklistRedux", "blacklist");
			blacklist = blacklist ? blacklist : [];

			if (blacklist === null) return console.log('EmoteBlacklistRedux: emote blacklist is empty!');
			
			blacklist.forEach(emote => {
				this.removeEmote(emote);
				this.addEmote(emote);
			});
		}

		addButton(event) {
			let emotewrapper = $(event.target).closest('.emotewrapper');
			if (!emotewrapper.children(".blacklist").length) {
				emotewrapper.prepend(`<button class="blacklist" onclick=BdApi.getPlugin("EmoteBlacklistRedux").addToBlacklist(event) title="Blacklist">`);
			}
		}

		addToBlacklist(event) {
			let blacklist = bdPluginStorage.get("EmoteBlacklistRedux", "blacklist");
			blacklist = blacklist ? blacklist : [];
			let emote = $(event.target).siblings(".emote").attr("alt");
			$('.emote[alt="' + emote + '"]').parent().replaceWith(emote);
			
			if (!blacklist.includes(emote)) blacklist.push(emote);
			
			bdPluginStorage.set("EmoteBlacklistRedux", "blacklist", blacklist.filter(Boolean));
			this.resetBemotes();
		}

		addEmote(emote) {
			window.bemotes.push(emote);
		}

		removeEmote(emote) {
			let index = window.bemotes.indexOf(emote);
			if (index > -1) {
				window.bemotes.splice(index, 1);
			}
		}

		getSettingsPanel() {
			let blacklist = bdPluginStorage.get("EmoteBlacklistRedux", "blacklist");
			blacklist = blacklist ? blacklist : [];
			
			let title = this.getName() + ' v' + this.getVersion() + ' by ' + this.getAuthor();
			let html = '';
			html += '<span class="ebr-title" style="color: #fff">' + title + '</span>';
			html += '<textarea id="ebr-textarea" style="width:100%; min-height:200px;">';
			if (blacklist !== null) {
				blacklist.forEach(item => {
					html += item + "\n";
				});
			}
			html += '</textarea>';
			html += '<span class="ebr-desc" style="color: #fff">Add emote names here to blacklist (1 per line) </span>';
			html += '<button class="ebr-save" style="float: right" onclick=BdApi.getPlugin("EmoteBlacklistRedux").save()>Save</button>';
			return html;
		}

		save() {
			this.clear();
			let blacklist = [];
			
			$("#ebr-textarea").val().split("\n").forEach(item => { 
				blacklist.push(item);
			});
			
			bdPluginStorage.set("EmoteBlacklistRedux", "blacklist", blacklist.filter(Boolean));
			if (window.ebrEnabled) {
				this.resetBemotes();
			}
		}

		clear() {
			let blacklist = bdPluginStorage.get("EmoteBlacklistRedux", "blacklist");
			blacklist = blacklist ? blacklist : [];
			 
			if (blacklist === null) return;
			blacklist.forEach(emote => {
				this.removeEmote(emote);
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

	return EmoteBlacklistRedux;
})();
