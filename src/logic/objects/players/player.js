'use strict'

// Tools
import * as config from '../../../settings/config'
import Actor from '../../modules/actor'
import * as t from '../../tools/tools'
import Sound from '../../tools/sound'

// Audio assets
import carHitAsset from '../../../../assets/sd/audio/sounds/carHit.wav'
import drownAsset from '../../../../assets/sd/audio/sounds/drown.wav'



export class Player extends Actor {
	constructor(ctx, width, height, startX, startY, speed, fillColor, image, lives) {
		super(ctx, width, height, startX, startY, speed, fillColor, image)

		//set default player speed to a grid step which is 20px bigger than the initial actor size
		this.speed = speed || this.width + 20
		this.isSafe = false
		this.startX = this.x
		this.startY = this.y
		this.lives = lives
		this.score = 0
		this.hiscore = 0
		this.bestLane = 0
		this.time = config.roundTimeLimit
		this.carHit = new Sound(carHitAsset)
		this.drown = new Sound(drownAsset)
	}

	toggleSafe() {
		this.isSafe != this.isSafe
	}

	resetTime() {
		this.time = config.roundTimeLimit
	}

	getPlayerLane() {
		return t.getLine(this.y)
	}

	resetPosition() {
		this.x = this.startX
		this.y = this.startY
	}

	laneScore(difficultiyMultiplier) {
		let invertedLaneCount = Math.floor((config.gridHeightSections - 2) - this.getPlayerLane())

		if(invertedLaneCount > this.bestLane) {
			this.bestLane = invertedLaneCount
			this.score += config.laneTravelScore  * (difficultiyMultiplier * 0.5)
			console.log('Added score')
		}
	}

	kill() {
		this.resetPosition()
		this.lives -= 1
		this.carHit.play()
	}
}

module.exports = Player