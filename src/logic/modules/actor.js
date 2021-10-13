'use strict'
import * as config from '../../settings/config'
import * as t from '../tools/tools'
import * as Images from '../tools/images'


export class Actor {
	constructor(ctx, width, height, startX, startY, speed, fillColor, image) {
		this.c = ctx
		this.width = width
		this.height = height
		this.x = startX
		this.y = startY
		this.fillColor = fillColor

		this.speed = speed


		this.image = image
		this.assets = new Array
		Images.addImage(this.assets, this.image, this.x, this.y, config.gridCellSize, config.gridCellSize)
		
	}

	draw() {
		this.c.drawImage(this.assets[0][0], this.x, this.y, this.width, this.height)
	}

	getActorCords() {
		return {
			xMin: this.x,
			xMax: this.x + this.width,
			yMin: this.y,
			yMax: this.y + this.height,
		}
	}

	selfColide(target) {
		t.colides(this, target)

		console.log('I colided')
	}

	move(direction) {
		if (direction === 'left') {
			this.x -= this.speed
		}

		if (direction === 'right') {
			this.x += this.speed
		}

		if (direction === 'up') {
			this.y -= this.speed
		}

		if (direction === 'down') {
			this.y += this.speed
		}
	}
}

module.exports = Actor