# Transparency
A full-conversion theme meant to take advantage of a transparent client to reveal whatever lovely desktop wallpaper you may have. The color scheme is centered around black, red, and white whenever possible. I still need to get around to editing icons!

![Channel Chat](https://i.imgur.com/109rkgO.png)
![Friends Chat](https://i.imgur.com/UPvMxMJ.png)
![Settings](https://i.imgur.com/sDEUL8z.png)
<img src="/Themes/Transparency/TransparencyThemePreview.gif?raw=true">
###### Enabling Client Transparency
1. Open `index.js` located under `%LocalAppData%\Discord\<version number>\resources\app`
2. Change `transparent` (line 498) to `true`
3. Delete the `backgroundColor` line (line 493)
4. Add `app.commandLine.appendSwitch('enable-transparent-visuals');` on line 82
5. Restart Discord completely and make sure you have a transparent theme!

###### Notable Visual Plugins
* Date Viewer - hammy                                      https://betterdiscord.net/ghdl?id=901
* HorizontalCode - spthiel                                 https://betterdiscord.net/ghdl?id=1004
* ReadAllNotificationsButton - DevilBro            https://betterdiscord.net/ghdl?id=887
