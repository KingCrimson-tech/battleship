const Player = require("../models/Player")
const Ship = require("../models/Ship")

class GameManager {
  constructor() {
    this.player = new Player("real")
    this.computer = new Player("computer")
    this.currentPlayer = this.player
    this.gamePhase = "setup" // 'setup', 'playing', 'gameOver'
    this.shipsToPlace = [
      { name: "Carrier", length: 5 },
      { name: "Battleship", length: 4 },
      { name: "Cruiser", length: 3 },
      { name: "Submarine", length: 3 },
      { name: "Destroyer", length: 2 },
    ]
    this.currentShipIndex = 0
    this.currentDirection = "horizontal"
  }

  getCurrentShip() {
    if (this.currentShipIndex >= this.shipsToPlace.length) {
      return null
    }
    return this.shipsToPlace[this.currentShipIndex]
  }

  placePlayerShip(startCoord, direction = this.currentDirection) {
    const shipData = this.getCurrentShip()
    if (!shipData) return false

    try {
      const ship = new Ship(shipData.length)
      this.player.gameboard.placeShip(ship, startCoord, direction)
      this.currentShipIndex++
      return true
    } catch (error) {
      console.error("Error placing ship:", error.message)
      return false
    }
  }

  placeComputerShips() {
    const ships = [
      new Ship(5), // Carrier
      new Ship(4), // Battleship
      new Ship(3), // Cruiser
      new Ship(3), // Submarine
      new Ship(2), // Destroyer
    ]

    for (const ship of ships) {
      let placed = false
      let attempts = 0

      while (!placed && attempts < 100) {
        const direction = Math.random() < 0.5 ? "horizontal" : "vertical"
        const maxRow = direction === "vertical" ? 10 - ship.length : 9
        const maxCol = direction === "horizontal" ? 10 - ship.length : 9

        const startCoord = [Math.floor(Math.random() * (maxRow + 1)), Math.floor(Math.random() * (maxCol + 1))]

        try {
          this.computer.gameboard.placeShip(ship, startCoord, direction)
          placed = true
        } catch (error) {
          attempts++
        }
      }
    }
  }

  randomPlacePlayerShips() {
    // Reset player board
    this.player.gameboard.placedShips = []
    this.currentShipIndex = 0

    const ships = this.shipsToPlace.map((shipData) => new Ship(shipData.length))

    for (const ship of ships) {
      let placed = false
      let attempts = 0

      while (!placed && attempts < 100) {
        const direction = Math.random() < 0.5 ? "horizontal" : "vertical"
        const maxRow = direction === "vertical" ? 10 - ship.length : 9
        const maxCol = direction === "horizontal" ? 10 - ship.length : 9

        const startCoord = [Math.floor(Math.random() * (maxRow + 1)), Math.floor(Math.random() * (maxCol + 1))]

        try {
          this.player.gameboard.placeShip(ship, startCoord, direction)
          placed = true
          this.currentShipIndex++
        } catch (error) {
          attempts++
        }
      }
    }
  }

  startGame() {
    if (this.currentShipIndex < this.shipsToPlace.length) {
      return false // Not all ships placed
    }

    this.placeComputerShips()
    this.gamePhase = "playing"
    return true
  }

  playerAttack(coord) {
    if (this.gamePhase !== "playing" || this.currentPlayer !== this.player) {
      return false
    }

    try {
      this.player.attack(this.computer, coord)

      if (this.computer.gameboard.allShipsSunk()) {
        this.gamePhase = "gameOver"
        return { success: true, gameOver: true, winner: "player" }
      }

      this.currentPlayer = this.computer
      return { success: true, gameOver: false }
    } catch (error) {
      console.error("Attack error:", error.message)
      return { success: false, error: error.message }
    }
  }

  computerAttack() {
    if (this.gamePhase !== "playing" || this.currentPlayer !== this.computer) {
      return null
    }

    try {
      const attackCoord = this.computer.randomAttack(this.player)

      if (this.player.gameboard.allShipsSunk()) {
        this.gamePhase = "gameOver"
        return { coord: attackCoord, gameOver: true, winner: "computer" }
      }

      this.currentPlayer = this.player
      return { coord: attackCoord, gameOver: false }
    } catch (error) {
      console.error("Computer attack error:", error.message)
      return null
    }
  }

  resetGame() {
    this.player = new Player("real")
    this.computer = new Player("computer")
    this.currentPlayer = this.player
    this.gamePhase = "setup"
    this.currentShipIndex = 0
    this.currentDirection = "horizontal"
  }

  toggleDirection() {
    this.currentDirection = this.currentDirection === "horizontal" ? "vertical" : "horizontal"
  }

  canPlaceShip(startCoord, direction = this.currentDirection) {
    const shipData = this.getCurrentShip()
    if (!shipData) return false

    const boardSize = 10
    const coordinates = []

    for (let i = 0; i < shipData.length; i++) {
      let coord
      if (direction === "horizontal") {
        coord = [startCoord[0], startCoord[1] + i]
        if (startCoord[1] + i >= boardSize) {
          return false
        }
      } else {
        coord = [startCoord[0] + i, startCoord[1]]
        if (startCoord[0] + i >= boardSize) {
          return false
        }
      }

      // Check for overlap
      for (const placed of this.player.gameboard.placedShips) {
        if (placed.coordinates.some(([x, y]) => x === coord[0] && y === coord[1])) {
          return false
        }
      }
      coordinates.push(coord)
    }

    return coordinates
  }
}

module.exports = GameManager
