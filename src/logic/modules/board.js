'use strict'
import * as config from '../../settings/config'
import * as Images from '../tools/images'
import * as t from '../tools/tools'


import ground_purple from '../../../assets/sd/terrain/ground_purple.png'
import ground_green_small from '../../../assets/sd/terrain/ground_green_small.png'
import ground_green_big from '../../../assets/sd/terrain/ground_green_big.png'
import water_main from '../../../assets/sd/terrain/water.png'
import road from '../../../assets/sd/terrain/road.png'


// Board related logic
// ----------------


export function generateMapArray(mapArray) {
	// Create a new array for the map (using heightSections from config)
	// ----------------
	// let map = new Array(config.gridHeightSections)

	// Build map array
	// ----------------
	for (let mapRow = 0; mapRow < mapArray.length; mapRow++) {
		mapArray[mapRow] = []

		for (let mapColumn = 0; mapColumn < config.gridWidthSections; mapColumn++) {
			
			// Fill row 2 with green ground
			// ----------------
			if(mapRow === 1) {
				if(mapColumn % 2) {
					Images.addImage(mapArray[mapRow], ground_green_small, t.line(mapColumn, true), t.line(mapRow, true), config.gridCellSize, config.gridCellSize)
				} else {
					Images.addImage(mapArray[mapRow], ground_green_big, t.line(mapColumn, true), t.line(mapRow, true), config.gridCellSize, config.gridCellSize)
				}
			}

			// Fill row 2 to 6 with water
			// ----------------
			if( mapRow === 2 || mapRow === 3 || mapRow === 4) {
				Images.addImage(mapArray[mapRow], water_main, t.line(mapColumn, true), t.line(mapRow, true), config.gridCellSize, config.gridCellSize)
			}

			// Fill row 2 to 6 with water
			// ----------------
			if(mapRow === 6 || mapRow === 7 || mapRow === 8 || mapRow === 9 || mapRow === 110) {
				Images.addImage(mapArray[mapRow], road, t.line(mapColumn, true), t.line(mapRow, true), config.gridCellSize, config.gridCellSize)
			}

			// Fill row 10 and 5 with purple ground
			// ----------------
			if(mapRow === 10 || mapRow === 5) {
				Images.addImage(mapArray[mapRow], ground_purple, t.line(mapColumn, true), t.line(mapRow, true), config.gridCellSize, config.gridCellSize)
			}
		}
	}

	return mapArray

}


