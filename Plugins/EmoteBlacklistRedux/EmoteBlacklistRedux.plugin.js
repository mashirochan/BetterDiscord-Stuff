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

		getVersion() { return "1.0.0"; }

		load() { }

		start() {
			window.ebrEnabled = true;			
			
			this.resetBemotes();
			
			$(document).on('mouseover.EmoteBlacklistRedux', '.emotewrapper', this.addButton.bind(this));
			
			BdApi.clearCSS(this.stylesheet_name);
			BdApi.injectCSS(this.stylesheet_name, this.stylesheet);
			
			console.log(this.getName() + ' loaded. Current version: ' + this.getVersion());
		}

		stop() {
			window.ebrEnabled = false;
			$('.blacklist').remove();
			$('*').off('.EmoteBlacklistRedux');
			BdApi.clearCSS(this.stylesheet_name);
			this.clear();
		}
		
		resetBemotes() {
			let blacklist = bdPluginStorage.get("EmoteBlacklistRedux", "blacklist");

			if (blacklist === null) return console.log('EmoteBlacklistRedux: emote blacklist is empty!');
			blacklist.forEach(emote => {
				this.removeEmote(emote);
				this.addEmote(emote);
			});
		}
	
		addButton() {
			$('.blacklist').remove();
			$('.emotewrapper').prepend(`<button class="blacklist" onclick=BdApi.getPlugin("EmoteBlacklistRedux").test() title="Blacklist">`);
		}
		
		test() {
			console.log(true);
		}
		
		addToBlacklist() {
			let blacklist = bdPluginStorage.get("EmoteBlacklistRedux", "blacklist");
			let emote = $('.emotewrapper .emote').attr('alt');
			
			if (!blacklist.includes(emote)) blacklist.push(emote);
			
			bdPluginStorage.set("EmoteBlacklistRedux", "blacklist", blacklist.filter(Boolean));
			this.resetBemotes();
			
			console.log('window.bemotes: ' + window.bemotes);
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
		
		clear() {
			let emotes = bdPluginStorage.get("EmoteBlacklistRedux", "blacklist");
			 
			if (emotes === null) return;
			emotes.forEach(emote => {
				this.removeEmote(emote);
			});
		}
		
		getSettingsPanel() {
			let emotes = bdPluginStorage.get("EmoteBlacklistRedux", "blacklist").filter(Boolean);

			let html = '';
			html += '<h2 style="color: #fff">Emote Blacklist Redux</2>';
			html += '<textarea id="ebr-textarea" style="width:100%; min-height:200px;">';
			if (emotes !== null) {
				emotes.forEach(item => {
					html += item + "\n";
				});
			}
			html += '</textarea>';
			html += '<button onclick=BdApi.getPlugin("EmoteBlacklistRedux").save()>Save</button>';
			html += '<span style="color: #fff">Add emote names here to blacklist (1 per line)</span>';
			return html;
		}
		
		save() {
			this.clear();
			let blacklist = [];
			
			$("#ebr-textarea").val().split("\n").forEach(item => { 
				blacklist.push(item);
			});
			
			let clean_blacklist = blacklist.filter(Boolean);
			
			
			bdPluginStorage.set("EmoteBlacklistRedux", "blacklist", blacklist);
			if (window.ebrEnabled) {
				this.resetBemotes();
			}
		}
	}

	return EmoteBlacklistRedux;
})();
