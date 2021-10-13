'use strict'

// Tools
import * as config from '../../settings/config'

// Function to use in the fill map array
// ----------------
// TODO: Create a map grid object instead of keeping a multidimentional array

export function addImage(target, src, x, y, width, height) {
	// Map object arr:
	// [0] new Image()
	// [1] image.src
	// [2] x pos
	// [3] y pos
	// [4] width
	// [5] height

	let imageElement = []

	imageElement.push(new Image())
	imageElement[imageElement.length-1].src = src

	imageElement.push(x)
	imageElement.push(y)

	imageElement.push(width)
	imageElement.push(height)

	target.push(imageElement)

	// return imageElement
}
