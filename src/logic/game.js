'use strict'

// Tools
// ----------------

import * as config from '../settings/config'
// import assets from '../settings/assetLibrary.json'

import * as t from './tools/tools'
import * as Images from './tools/images'
// import Sound from './tools/sound'
import Player from './objects/players/player'
import Obstacle from './objects/obstacles/obstacle'
import * as Board from './modules/board'


// Image assets
// ----------------
// Terrain
import flag from '../../assets/sd/terrain/flag.png'
import startScreen from '../../assets/sd/others/start.jpg'

// Actors
import frogImage from '../../assets/sd/actors/player/frog.png'

import car1_right from '../../assets/sd/actors/obstacles/car1_right.png'
import car1_left from '../../assets/sd/actors/obstacles/car1_left.png'

import car2_right from '../../assets/sd/actors/obstacles/car2_right.png'
import car2_left from '../../assets/sd/actors/obstacles/car2_left.png'

import truck_right from '../../assets/sd/actors/obstacles/truck_right.png'
import truck_left from '../../assets/sd/actors/obstacles/truck_left.png'

import log from '../../assets/sd/actors/obstacles/log.png'
import logX2 from '../../assets/sd/actors/obstacles/logX2.png'
import logX3 from '../../assets/sd/actors/obstacles/logX3.png'

import turtle_right from '../../assets/sd/actors/obstacles/turtle_right.png'
import turtle_left from '../../assets/sd/actors/obstacles/turtle_left.png'


// Audio assets
// ----------------
import backgroundMusicAsset from '../../assets/sd/audio/music/background.mp3'
// import newLiveAsset from '../../assets/sd/audio/sounds/newLive.wav'
import coinAsset from '../../assets/sd/audio/sounds/coin.wav'
// import carHitAsset from '../../assets/sd/audio/sounds/carHit.wav'
import drownAsset from '../../assets/sd/audio/sounds/drown.wav'
import jumpAsset from '../../assets/sd/audio/sounds/jump.wav'
import outOfTimeAsset from '../../assets/sd/audio/sounds/outOfTime.wav'


// ----------------
// Set up
// ----------------
let map = Board.generateMapArray(new Array(config.gridHeightSections))



// ----------------
// TODO: Move to a separate file (or preferably move everything above this to a seperate file)
// ----------------

export class Game {
	constructor(canvas, width, height, mode, volume, difficultiyMultiplier) {
		canvas.width = width
		canvas.height = height
		this.width = width
		this.height = height
		this.initialVolume = volume
		this.volume = this.initialVolume
		this.difficultiyMultiplier = difficultiyMultiplier


		this.globalAssets = new Array
		// Convert flag to image and add to asssets array
		Images.addImage(this.globalAssets, flag, 0, 0, config.gridCellSize, config.gridCellSize)
		Images.addImage(this.globalAssets, startScreen, 0, 0, this.width, this.height)


		// Sounds
		// ----------------
		this.backgroundMusic = new Audio(backgroundMusicAsset, this.volume)
		this.jump = new Audio(jumpAsset, this.volume)
		// this.carHit = new Audio(carHitAsset, this.volume)
		this.drown = new Audio(drownAsset, this.volume)
		// this.coin = new Audio(coinAsset, this.volume)
		// this.newLive = new Audio(newLiveAsset, this.volume)
		this.outOfTime = new Audio(outOfTimeAsset, this.volume)
		
		this.applyVolume(volume)
		this.backgroundMusic.play()

		// Main canvas
		// ----------------
		this.c = canvas.getContext('2d')
		this.drawStart = true
		console.log(this.drawStart)


		// Init player
		// ----------------
		this.player = new Player(this.c, config.gridCellSize - 20, config.gridCellSize - 20, 
								t.line(5), config.gridCellSize * 10 + 10, 0, 'pink', frogImage, 6)



		this.obstacles = []
		// Lanes have:
		// Status: True if there is currently an obstacle on it and False if there isnt
		// Second element keeps a copy of the object currently in the lane (mainly to reduce number of checks needed for the collision detection)
		// ----------------
		this.roadLanes = [
						[false, []],
						[false, []],
						[false, []],
						[false, []]
					]

		this.waterLanes = [
						[false, []],
						[false, []],
						[false, []]
					]

		this.safeZones = []
		// Safe Zones array map:
		// 0: index
		// 1: x
		// 2: safe/not safe - for the player
		// 3: visited/not visited - by the player

		// Calculate safe zones
		let safeZoneCounter = 0

		for (let i = 0; i < config.gridWidthSections; i++) {

			if(i % 2) {
				let safeZone = [safeZoneCounter, safeZoneCounter + config.gridCellSize, true, false]
				this.safeZones.push(safeZone)
			} else {
				let safeZone = [safeZoneCounter, safeZoneCounter + config.gridCellSize, false, false]
				this.safeZones.push(safeZone)
			}
			
			safeZoneCounter += config.gridCellSize
		}
		// console.log('Safe x: ', this.safeZones)

		// Possible modes:
		// 'god', 'prod', 'debug'
		this.mode = mode

		// Possible game states:
		// 'start', 'running', 'paused', 'ended'
		this.gameState = 'running'
		// this.gameStage = 'menu'
		this.setState('menu')


		document.addEventListener('keydown', this.keydown.bind(this))
		document.addEventListener('touchstart', this.startTouch, false)
		document.addEventListener('touchmove', this.moveTouch, false)

		// Swipe Up / Down / Left / Right
		this.initialSwipeX = null
		this.initialSwipeY = null

		this.startTimer = new Date().getTime()
		this.now = this.startTimer = new Date().getTime(),
		this.oneMinuteFromNow = new Date().getTime() + 60
		this.countdownTimer = this.oneMinuteFromNow - this.startTimer
		this.timeLeft = config.roundTimeLimit,
		this.timeGraphicInitialWidth = config.roundTimeLimit * 10

		this.drawBoard()
	}

	updateTime() {
		this.now = this.startTimer = new Date().getTime()
		let timeDistance = this.countdownTimer = this.oneMinuteFromNow - this.now

		if(this.countdownTimer === 0) {
			this.startTimer = new Date().getTime()
			this.oneMinuteFromNow = new Date().getTime() + 60
		} else {
			this.countdownTimer = Math.floor((timeDistance % (1000 * 60)) / 1000)
		}

		this.timeLeft = config.roundTimeLimit + this.countdownTimer
		this.timeGraphicInitialWidth += this.timeLeft - this.timeGraphicInitialWidth
		
		if(this.timeLeft === 0) {
			if(this.mode !== 'god') {
				this.outOfTime.play()
				this.player.kill()
				this.oneMinuteFromNow = new Date().getTime() + 60
			}
		}
	}

	resetTime() {
		this.oneMinuteFromNow = new Date().getTime() + 60
	}

	play() {
		// console.log('Main loop')
		// clear the whole canvas to draw before drawning
		// ----------------
		this.clear()

		// Update on each tick
		// ----------------
		this.drawBoard()

		this.drawEnemies()
		this.drawStats()

		this.manipulateEnemies()

		if(this.mode !== 'god') {
			this.checkColisions()
		}

		this.updateTime()

		this.player.draw()


		if(this.mode === 'debug') {
			this.drawDebugGrid()
		}

		// Main Game loop
		// ----------------
		if(this.gameState === 'menu') {
			this.stateManager('start')
			console.log('in Menu')

		} else if(this.gameState === 'running') {
			// console.log('In running')
			// Run loop animation
			// ----------------
			requestAnimationFrame(this.play.bind(this))
		} else {
			this.stateManager('lose')
			// console.log('In lost')
		}

		if(this.player.lives === 0) {
			this.stateManager('lose')
		}
	}

	// Checks and states
	// --------------
	checkState() {
		if(this.player.lives < 1) {
			return false
		}
		return true
	}

	// Check the player's lane
	// Check that lane's obstacle's position
	// If there is collision - act on it accordingly
	checkColisions() {
		let currentPlayerLane = Math.ceil(this.player.getPlayerLane())

		if(currentPlayerLane > 5 && currentPlayerLane < 10) {
			if(t.colides(this.player, this.roadLanes[Math.abs(Math.ceil(this.player.getPlayerLane() - 6))][1])) {
				this.player.kill()
			}
		}

		if(currentPlayerLane > 1 && currentPlayerLane < 5) {
			let currentObstacle = this.waterLanes[Math.abs(Math.ceil(this.player.getPlayerLane() - 2))][1]

			if(t.colides(this.player, currentObstacle)) {
				this.player.isSafe = true

				if(currentObstacle.direction === 'left') {
					this.player.x -= currentObstacle.speed
				} else {
					this.player.x += currentObstacle.speed
				}

			} else {
				this.drown.play()
				this.player.isSafe = false
				this.player.kill()
			}
		}
	}



	// Check if the player has landed on a safe zone
	checkSafeZone() {
		let currentPlayerLane = Math.ceil(this.player.getPlayerLane())

		if(currentPlayerLane === 1) {
			let zonesCompleted = 1
			
			for (let i = 1; i < this.safeZones.length; i += 2) {
				if(this.safeZones[i][3]) {
					zonesCompleted += 1
				}
				
				if(zonesCompleted === (this.safeZones.length - 1)/2) {
					this.stateManager('win')
				}
			}

			for (let i = 1; i < this.safeZones.length; i += 2) {
				if(this.player.x + 10 > this.safeZones[i][0] && this.player.x < (this.safeZones[i][0] + config.gridCellSize)) {
					if(this.safeZones[i][2]) {
						this.player.score += config.safeZoneScore * (this.difficultiyMultiplier * 0.5)
						this.safeZones[i][3] = true
						this.resetTime()
						
						this.player.resetPosition()
						this.safeZones[i][2] = false
					} else {
						this.player.kill()
					}
					break
				}
			}
		}
	}

	setState(state) {
		this.gameState = state
	}




// Sounds controls


	applyVolume(amount) {
		this.backgroundMusic.volume = amount
		this.jump.volume = amount
		this.drown.volume = amount
		this.outOfTime.volume = amount

		// this.coin.volume = amount
		// this.newLive.volume = amount
		// this.carHit.volume = amount
	}

	soundLevel(option) {
		if(option === 'toggle') {
			if(this.volume) {
				this.initialVolume = this.volume
				this.volume = 0
				this.applyVolume(0)
			} else {
				this.volume = this.initialVolume
				this.applyVolume(this.initialVolume)
			}
		} else if(option === '-') {
			if(this.volume > 0) {
				this.volume -= 0.1
				this.applyVolume(this.volume)
			}
		} else if(option === '+') {
			if(this.volume < 1) {
				this.volume += 0.1
				this.applyVolume(this.volume)
			}
		}
	}







	fillScreen() {
		this.c.fillRect(0, 0, this.width, this.height)
	}

	stateManager(state) {
		let xScreenCenter = this.width / 2,
			yScreenCenter = this.height / 2

		this.c.font = '48px serif'
		

		if(state === 'lose') {
			console.log('Lose case')
			this.c.fillStyle = '#000000'
			game.fillScreen()
	
			this.c.beginPath()
			this.c.fillStyle = 'red'
			this.c.fillText("Congratulations!", xScreenCenter - 150, yScreenCenter)
			this.c.fillText("You failed successfully!", xScreenCenter - 220, yScreenCenter + 50)
			this.setState('ended')

		} else if(state === 'win') {
			console.log('Win case')
			this.c.fillStyle = '#4286f4'
			game.fillScreen()
	
			this.c.beginPath()
			this.c.fillStyle = '#ffffff'
			this.c.fillText("Congratulations!", xScreenCenter - 150, yScreenCenter)
			this.c.fillText("You completed this level!", xScreenCenter - 220, yScreenCenter + 50)
			this.setState('ended')

		} else if(state === 'start') {
			console.log('Start screen')
			this.c.fillStyle = '#88d8b0'
			game.fillScreen()

			this.c.drawImage(this.globalAssets[1][0], 0, 0,  this.width, this.height)
			

			this.drawStart = true

			this.c.font = '64px Arcade Classic' || '64px serif'
			this.c.beginPath()
			this.c.fillStyle = '#ffffff'
			// this.c.fillText("Frogger!", xScreenCenter - 230, yScreenCenter - 300)
			this.c.fillText("Frogger!", 50, 100)

			this.c.font = '24px Arcade Classic' || '24px serif'
			this.c.fillStyle = 'blue'
			this.c.fillText("Please choose", 50, 500)
			this.c.fillText("a difficulty between 1-9", 50, 600)

			// this.c.fillText("Please choose", xScreenCenter - 170, yScreenCenter + 100)
			// this.c.fillText("a difficulty between 1-9", 100, yScreenCenter + 200)
		}
	}

	// Drawing
	// ----------------
	drawBoard() {
		// Drawn the black background:
		// ----------------
		this.c.fillStyle = '#000000'

		// params: x, y, width, height
		// ----------------
		this.c.fillRect(0, 0, this.width, this.height)

		// Drow map array
		// ----------------
		// TODO: Optimize to skip empty rows
		for (let mapRow = 0; mapRow < map.length; mapRow++) {
			for (let mapColumn = 0; mapColumn < config.gridWidthSections; mapColumn++) {
				if( typeof map[mapRow][mapColumn] !== 'undefined') {
					let current = map[mapRow][mapColumn]
					this.c.drawImage(current[0], current[1], current[2], current[3], current[4])
				}
			}
		}

		if(this.mode === 'debug') {
			for (let i = 0; i < this.safeZones.length; i++) {
				if(this.safeZones[i][2]) {
					this.c.fillStyle = 'yellow'
				} else {
					this.c.fillStyle = 'red'
				}
	
				this.c.fillRect(this.safeZones[i][0], config.gridCellSize, config.gridCellSize, config.gridCellSize)
			}
		}

		for (let sz = 0; sz < this.safeZones.length; sz++) {
			if(this.safeZones[sz][3]) {
				this.c.drawImage(this.globalAssets[0][0], this.safeZones[sz][0], config.gridCellSize, config.gridCellSize, config.gridCellSize)
			}
		}

		if(this.drawStart) {
			this.c.drawImage(this.globalAssets[1][0], 0, 0,  this.width, this.height)
		}

	}
	
	drawStats() {
		let bottomStatFirstRow = this.height - (config.gridCellSize - 40 * (config.gridCellSize/100) ),
			bottomStatSecondRow = this.height - (config.gridCellSize - 80 * (config.gridCellSize/100) )

		// Player Lives
		this.c.beginPath()
		this.c.font = '24px serif'
		this.c.fillStyle = 'white'
		this.c.fillText('Lives:', 10, 28)


		// TOP:

		// Player lives
		this.c.fillText(this.player.lives, 10, 54)

		// Time
		this.c.fillText('Time left:', this.width / 2 - 50, 28)
		// this.c.fillText(this.timeLeft, this.width / 2 - 50, 54)
		this.c.fillStyle = 'green'
		this.c.fillRect(this.width / 2 - 120, 40, this.timeGraphicInitialWidth * 10, 10)
		this.c.stroke()
		this.c.fillStyle = 'white'

		// Current score
		this.c.fillText('Current score', this.width - 150, 28)
		this.c.fillText(this.player.score, this.width - 150, 54)


		// BOTTOM:
		// Best score
		this.c.fillText('Best score:', this.width - 150, bottomStatFirstRow)
		this.c.fillText(this.player.score, this.width - 150, bottomStatSecondRow)

		// Best lane
		this.c.fillText('Best lane:', 10, bottomStatFirstRow)
		this.c.fillText(this.player.bestLane, 10, bottomStatSecondRow)

		// Best lane
		this.c.fillText('Sound volume:', this.width / 2 - 80, bottomStatFirstRow)
		this.c.fillText(this.volume.toFixed(2), this.width / 2 - 80, bottomStatSecondRow)

	}

	
	drawEnemies() {
		for (let i = 0; i < this.obstacles.length; i++) {
			
			// TODO: User image rotation to rotate image according to direction instead of loading multiple versions of an image

			// if(this.obstacles[i].direction === 'left') {

			// 	this.obstacles[i].width = -(this.obstacles[i].width) / 2
			// 	console.log(this.obstacles[i].width)

			// }

			this.obstacles[i].draw()

			// if(this.obstacles[i].direction === 'left') {
			// 	this.c.restore()
			// }
		}
	}










	// Obstacle manipulation
	// ----------------
	spawnObstacle(y, widthMultiplier, speed, direction, type, fillColor, image) {
		let tempObstacle = new Obstacle(this.c, 
										widthMultiplier ? config.gridCellSize * widthMultiplier - 20 : config.gridCellSize - 20, 
										config.gridCellSize - 20, 
										direction === 'right' ? (widthMultiplier ? -config.gridCellSize * widthMultiplier : -config.gridCellSize) : this.width + config.gridCellSize ,
										y, 
										speed, 
										direction,
										type,
										fillColor, 
										image)

		// Add the spawned obsstacle to the obstacle array
		// ----------------
		this.obstacles.push(tempObstacle)

		// Set the current lane as busy
		// ----------------
		if(tempObstacle.type === 'car') {
			this.roadLanes[Math.ceil(t.getLine(tempObstacle.y) - 6)][0] = true
			this.roadLanes[Math.ceil(t.getLine(tempObstacle.y) - 6)][1] = tempObstacle
		} else if(tempObstacle.type === 'log' || tempObstacle.type === 'turtle') {
			this.waterLanes[Math.ceil(t.getLine(tempObstacle.y) - 2)][0] = true
			this.waterLanes[Math.ceil(t.getLine(tempObstacle.y) - 2)][1] = tempObstacle
		}
	}


	manipulateEnemies() {
		for (let i = 0; i < this.obstacles.length; i++) {
			let enemy = this.obstacles[i]
			
			// Move the enemies
			// ----------------
			enemy.move(enemy.direction)

			// Delete enemies that are out of the board
			// ----------------
			if(enemy.direction === 'right') {
				if(enemy.x > this.width + enemy.width * 2) {
					this.obstacles.splice(i, 1)
					
					if(enemy.type === 'car') {
						this.roadLanes[Math.ceil(t.getLine(enemy.y) - 6)][0] = false
						this.roadLanes[Math.ceil(t.getLine(enemy.y) - 6)][1] = 'undefined'
					} else {
						this.waterLanes[Math.ceil(t.getLine(enemy.y) - 2)][0] = false
						this.waterLanes[Math.ceil(t.getLine(enemy.y) - 2)][1] = 'undefined'
					}
				}
			} else {
				if(enemy.x < (enemy.width * 2) * -1) {
					this.obstacles.splice(i, 1)
					if(enemy.type === 'car') {
						this.roadLanes[Math.ceil(t.getLine(enemy.y) - 6)][0] = false
						this.roadLanes[Math.ceil(t.getLine(enemy.y) - 6)][1] = 'undefined'
					} else {
						this.waterLanes[Math.ceil(t.getLine(enemy.y) - 2)][0] = false
						this.waterLanes[Math.ceil(t.getLine(enemy.y) - 2)][1] = 'undefined'
					}
				}
			}
		}


		// Spawn randomly generated obstacles if there is an empty lane
		// TODO: Currently using as main enemy spawner - Remove/reuse when there is a "level gnerator"
		// ----------------
		if(this.mode === 'debug' || this.mode === 'prod') {

			// Spawning road lane obstacles
			for (let i = 0; i < this.roadLanes.length; i++) {
				if(!this.roadLanes[i][0]) {
					// let randRow = t.line(	t.getRandomInt(6, 9) ),
					let randLength = t.getRandomInt(1, 3),
						randSpeed = t.getRandomInt(1, 20 * this.difficultiyMultiplier),
						randDirection = t.getRandomInt(0,2) % 2 ? 'left' : 'right',
						// Color is not used anymore
						randColor =  '#'+(Math.random()*0xFFFFFF<<0).toString(16),
						image,
						imageVariation = t.getRandomInt(1, 3)



						// TODO: Improve this:
						// improve it together with - User image rotation to rotate image according to direction instead of loading multiple versions of an image

						if(randLength > 1) {
							if(randDirection === 'left') {
								image = truck_left
							} else {
								image = truck_right
							}
						} else {
							if(randDirection === 'left') {
								if(imageVariation === 1) {
									image = car1_left
								} else {
									image = car2_left
								}
							} else {
								if(imageVariation === 1) {
									image = car1_right
								} else {
									image = car2_right
								}
							}
						}
					
					this.spawnObstacle(t.line(i + 6),
										randLength,
										randSpeed,
										randDirection,
										'car',
										randColor,
										image
										)
				}
			}


			// Spawning water lane obstacles
			for (let i = 0; i < this.waterLanes.length; i++) {
				if(!this.waterLanes[i][0]) {
					// let randRow = t.line(	t.getRandomInt(6, 9) ),
					let randLength = t.getRandomInt(1, 4),
						randSpeed = t.getRandomInt(1.5, 5.5 * this.difficultiyMultiplier),
						randDirection = t.getRandomInt(0,2) % 2 ? 'left' : 'right',
						// Color is not used anymore
						randColor =  '#'+(Math.random()*0xFFFFFF<<0).toString(16),
						image

						// TODO: Improve this:
						// improve it together with - User image rotation to rotate image according to direction instead of loading multiple versions of an image
						if(randLength === 1) {
							image = log
						} else if(randLength === 2) {
							image = logX2
						} else {
							image = logX3
						}
					
					this.spawnObstacle(t.line(i + 2), randLength, randSpeed, randDirection, 'log', randColor, image)
				}
			}
		}
	}


	// User controls
	// ---------------------


	// Touch device controls:
	// ---------------------
	// startTouch(e) {
	// 	this.initialSwipeX = e.touches[0].clientX
	// 	this.initialSwipeY = e.touches[0].clientY
	// }

	// moveTouch(e) {
	// 	if (this.initialSwipeX === null) {
	// 		return
	// 	}
	
	// 	if (this.initialSwipeY === null) {
	// 		return
	// 	}
	
	// 	let currentX = e.touches[0].clientX,
	// 		currentY = e.touches[0].clientY,
	// 		diffX = this.initialSwipeX - currentX,
	// 		diffY = this.initialSwipeY - currentY
	
	// 	if (Math.abs(diffX) > Math.abs(diffY)) {
	// 		// sliding horizontally
	// 		if (diffX > 0) {
	// 			// swiped left
	// 			console.log("swiped left")
	// 			this.player.move('left')

	// 		} else {
	// 			// swiped right
	// 			console.log("swiped right")
	// 			this.player.move('right')

	// 		}
	// 	} else {
	// 		// sliding vertically
	// 		if (diffY > 0) {
	// 			// swiped up
	// 			console.log("swiped up")
	// 			this.player.move('up')

	// 		} else {
	// 			// swiped down
	// 			console.log("swiped down")
	// 			this.player.move('down')

	// 		}
	// 	}
	
	// 	this.initialSwipeX = null
	// 	this.initialSwipeY = null

	// 	e.preventDefault()
	// }


	keydown(e) {
		// console.log(e.code)

		if(this.gameState === 'menu') {
			if(event.code.includes('Digit') && event.code.replace(/\D/g,'') > 0) {
				this.difficultiyMultiplier = event.code.replace(/\D/g,'')
				this.drawStart = false
				this.setState('running')
				this.play()
			}
		}

		if(e.code === 'KeyM') {
			this.soundLevel('toggle')
		}
		
		if(e.code === 'Equal' || e.code === 'NumpadAdd') {
			this.soundLevel('+')
		}

		if(e.code === 'Minus' || e.code === 'NumpadSubtract') {
			this.soundLevel('-')
		}


		if(this.gameState === 'running') {
			let arrow = config.ARROW_MAP[e.keyCode],
			correction = Math.floor((this.player.x + (this.player.width / 2)) / config.gridCellSize)

			this.jump.play()


			if (arrow === 'left') {
				if((this.player.x - this.player.speed) > 0) {
					this.player.move('left')
				}
			}

			if (arrow === 'right') {
				if( (this.player.x + this.player.speed) < this.c.canvas.width) {
					this.player.move('right')

				}
			}

			if (arrow === 'up') {
				if( (this.player.y - this.player.speed) > config.gridCellSize) {
					this.player.move('up')
					this.checkSafeZone()
					this.player.x = config.gridCellSize * correction + 10
					this.player.laneScore(this.difficultiyMultiplier)
				}
			}

			if (arrow === 'down') {
				if( (this.player.y + this.player.speed) < this.c.canvas.height - config.gridCellSize) {
					this.player.move('down')
					this.player.x = config.gridCellSize * correction + 10
				}
			}
		}
	}




	
	// Just lines to show the grid
	// ----------------
	drawDebugGrid() {
		for (let i = 0; i < config.gridWidthSections; i++) {

			this.c.beginPath()
			this.c.strokeStyle = '#ff0000';
			this.c.moveTo(config.gridCellSize * i, 0)
			this.c.lineTo(config.gridCellSize * i, this.height)
			this.c.stroke()
		}

		for (let i = 0; i < config.gridHeightSections; i++) {
			this.c.beginPath()
			this.c.strokeStyle = '#ff0000';
			this.c.moveTo(0, config.gridCellSize * i)
			this.c.lineTo(this.width, config.gridCellSize * i)
			this.c.stroke()
		}
	}
	
	clear() {
		// Clear the canvas
		// ----------------
		this.c.clearRect(0, 0, this.width, this.height)
	}
}


// ----------------
// Initiate the game
// ----------------

let ctx = document.getElementsByTagName('canvas')[0]
let game = new Game(ctx, config.desiredWidth, config.desiredHight, 'prod', 0, 1)
//				(canvas, width, height, mode, volume, difficultiyMultiplier)


game.play()
