// Dimentions
export const currentWindowHeight = document.documentElement.clientHeight
// currentWindowWidth = document.documentElement.clientWidth,
export const gridWidthSections = 11
export const gridHeightSections = 12

// Calculates a good height based on the user' screen height (current screen height)
export const desiredHight = (currentWindowHeight - (currentWindowHeight * 10) / 100)
export const gridCellSize = desiredHight / gridHeightSections
// desiredWidth = (currentWindowWidth - (currentWindowWidth * 40) / 100) / 1.05, // Calculates the width of the game field based on the calculated height and using an aspect ration 12 =11
export const desiredWidth = gridCellSize * gridWidthSections

// Scoring
export const safeZoneScore = 600
export const laneTravelScore = 10
export const bonusScore = 50

// Others
export const roundTimeLimit = 30
export const assetsFolderPath = '../../assets/'
export const ARROW_MAP = {
	// Up
	38: 'up',
	87: 'up',
	119: 'up',
	
	// Down
	40: 'down',
	83: 'down',
	115: 'down',

	// Left
	37: 'left',
	65: 'left',
	97: 'left',

	// Right
	39: 'right',
	68: 'right',
	100: 'right'
}