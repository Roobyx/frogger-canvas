'use strict'

// Tools
import * as config from '../../../settings/config'
import Actor from '../../modules/actor'
import * as Images from '../../tools/images'


export class Obstacle extends Actor {
	constructor(ctx, width, height, startX, startY, speed, direction, type, fillColor, image) {
		super(ctx, width, height, startX, startY, speed, fillColor, image)
		
		this.c = ctx
		this.direction = direction
		this.type = type

		this.image = image
		this.assets = new Array
		Images.addImage(this.assets, this.image, this.x, this.y, config.gridCellSize, config.gridCellSize)
		// console.log('-----> ', this.assets[0][0])
		// this.pat = this.c.createPattern(this.assets[0][0], 'repeat-x')

	}


	// For some reason pattern only draws red color...
	// draw() {
	// 	// this.c.fillStyle = this.c.createPattern(this.assets[0][0], 'repeat-x')
	// 	// // console.log(this.pat)
	// 	// this.c.fillRect(this.x, this.y, this.width, this.height)

	// }
}

module.exports = Obstacle