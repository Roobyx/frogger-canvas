'use strict'

// Tools
import * as config from '../../settings/config'

export function line(desiredRow, npPadding) {
	if(npPadding) {
		return config.gridCellSize * desiredRow
	} else {
		return config.gridCellSize * desiredRow + 10
	}
}

export function getLine(currentPos, npPadding) {
	if(npPadding) {
		return currentPos / config.gridCellSize
	} else {
		return (currentPos - 10) / config.gridCellSize
	}
}

export function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

// Collision using objects
export function colides(target_1, target_2) {
	// console.log('Got objects: ', target_1, target_2)

	let topEdge1 = target_1.y + target_1.height,
		rightEdge1 = target_1.x + target_1.width,
		leftEdge1 = target_1.x,
		bottomEdge1 = target_1.y,
		topEdge2 = target_2.y + target_2.height,
		rightEdge2 = target_2.x + target_2.width,
		leftEdge2 = target_2.x,
		bottomEdge2 = target_2.y
	
	if( leftEdge1 < rightEdge2 && rightEdge1 > leftEdge2 && bottomEdge1 < topEdge2 && topEdge1 > bottomEdge2) {
		console.log('COLIDES')
		return true
	}
	
	// console.log('NO COLLISION')
	return false
}