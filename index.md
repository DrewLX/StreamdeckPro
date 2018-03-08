---
# You don't need to edit this file, it's empty on purpose.
# Edit theme's home layout instead if you wanna make some changes
# See: https://jekyllrb.com/docs/themes/#overriding-theme-defaults
layout: default
---

# Beta Release

I'm still very much actively developing this app, and after a couple of months I've got something that is reasonably stable and tested by a few people. That does **not** mean it won't crash! It's very much a beta.

[Download Here](https://github.com/DrewLX/StreamdeckPro/releases)

## How to use it

1. Download the .zip file above and copy the app into your Applications folder
2. Simply quit the official Streamdeck application, probably in your menu bar.
3. Run StreamDeckPro from your Applications folder.

The usage should be pretty obvious if you are familiar with OSC. Click on a button to edit, configure what it does when you press it. There is no save, all changes are saved as you make them. Pressing a button will send the OSC.

The defaults are intentionally set to localhost (127.0.0.1) with port 53000 as this is used by QLab.

## My roadmap

While this app is currently functional, my plan is to put some work into some core features that will allow for a much more powerful controller.

* Write a button image management system, that would consist of a background, foreground and then a text layer. These could be each dynamically updated. For example the background colour could indicate a QLab's cue state (play, loaded, stopped) and the text could be the Cue's name, and another text layer for time remaining.

* Better integrate with QLab system functions. Such as Go, Next, Previous. You can do this now by setting the cue to /go but a simpler way of selecting these will speed things up.

* Add support for MIDI. Not all applications support OSC, so adding MIDI will suit some users.

* Export/Import of configuration files.

## Contact Me

If you have any bugs, suggestions or requests, feel free to email me: me@drewperry.co.uk or tweet me: DrewLX.
