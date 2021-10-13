'use strict'

// Tools
import * as config from '../../settings/config'

export class Sound {
	constructor(src, volume) {
		this.sound = document.createElement("audio")
		this.sound.src = src
		this.sound.setAttribute("preload", "auto")
		this.sound.setAttribute("controls", "none")
		
		// this.sound.setAttribute("volume", volume ? volume : "0.5")
		this.sound.volume = volume ? volume : "0.5"
		
		this.sound.style.display = "none"
		document.body.appendChild(this.sound)
	}


	play() {
		this.sound.play()
	}
	
	stop() {
		this.sound.pause()
	}
}

module.exports = Sound