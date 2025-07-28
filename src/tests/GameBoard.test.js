const Ship = require("../models/Ship")
const GameBoard = require("../models/GameBoard")

describe("GameBoard", () => {
  it("should place a ship at the correct coordinates (horizontal)", () => {
    const gameBoard = new GameBoard()
    const ship = new Ship(3)
    gameBoard.placeShip(ship, [2, 2], "horizontal")
    // Check coord
    const placed = gameBoard.placedShips.find((p) => p.ship === ship)
    expect(placed.coordinates).toEqual([
      [2, 2],
      [2, 3],
      [2, 4],
    ])
  })

  it("should place a ship at the correct coordinates (vertical)", () => {
    const gameBoard = new GameBoard()
    const ship = new Ship(2)
    gameBoard.placeShip(ship, [1, 1], "vertical")
    const placed = gameBoard.placedShips.find((p) => p.ship === ship)
    expect(placed.coordinates).toEqual([
      [1, 1],
      [2, 1],
    ])
  })

  it("should register a hit on the correct ship", () => {
    const gameBoard = new GameBoard()
    const ship1 = new Ship(2)
    const ship2 = new Ship(3)
    gameBoard.placeShip(ship1, [0, 0], "horizontal")
    gameBoard.placeShip(ship2, [1, 0], "horizontal")
    gameBoard.receiveAttack([1, 1])
    expect(ship2.hits).toBe(1)
    expect(ship1.hits).toBe(0)
  })

  it("should record a miss when attacking empty coordinates", () => {
    const gameBoard = new GameBoard()
    const ship = new Ship(2)
    gameBoard.placeShip(ship, [0, 0])
    gameBoard.receiveAttack([5, 5])
    expect(gameBoard.missedAttacks).toContainEqual([5, 5])
  })

  it("should not record a miss when a ship is hit", () => {
    const gameBoard = new GameBoard()
    const ship = new Ship(2)
    gameBoard.placeShip(ship, [0, 0])
    gameBoard.receiveAttack([0, 0])
    expect(gameBoard.missedAttacks).not.toContainEqual([0, 0])
  })

  it("should report all ships sunk when all have been hit", () => {
    const gameBoard = new GameBoard()
    const ship1 = new Ship(1)
    const ship2 = new Ship(1)
    gameBoard.placeShip(ship1, [0, 0])
    gameBoard.placeShip(ship2, [1, 1])
    gameBoard.receiveAttack([0, 0])
    gameBoard.receiveAttack([1, 1])
    expect(gameBoard.allShipsSunk()).toBe(true)
  })

  it("should report not all ships sunk if at least one is not sunk", () => {
    const gameBoard = new GameBoard()
    const ship1 = new Ship(1)
    const ship2 = new Ship(1)
    gameBoard.placeShip(ship1, [0, 0])
    gameBoard.placeShip(ship2, [1, 1])
    gameBoard.receiveAttack([0, 0])
    expect(gameBoard.allShipsSunk()).toBe(false)
  })
  it("should not allow two ships to overlap", () => {
    const gameBoard = new GameBoard()
    const ship1 = new Ship(2)
    const ship2 = new Ship(3)
    gameBoard.placeShip(ship1, [0, 0], "horizontal")
    expect(() => {
      gameBoard.placeShip(ship2, [0, 1], "vertical")
    }).toThrow("Ship cannot overlap with another ship")
  })

  it("should allow multiple missed attacks at different coordinates", () => {
    const gameBoard = new GameBoard()
    const ship = new Ship(2)
    gameBoard.placeShip(ship, [0, 0])
    gameBoard.receiveAttack([5, 5])
    gameBoard.receiveAttack([6, 6])
    expect(gameBoard.missedAttacks).toContainEqual([5, 5])
    expect(gameBoard.missedAttacks).toContainEqual([6, 6])
  })

  it("should not increment ship hits for the same coordinate more than once", () => {
    const gameBoard = new GameBoard()
    const ship = new Ship(2)
    gameBoard.placeShip(ship, [0, 0], "horizontal")
    gameBoard.receiveAttack([0, 0])
    gameBoard.receiveAttack([0, 0])
    expect(ship.hits).toBe(1)
  })

  it("should handle attacks outside the board", () => {
    const gameBoard = new GameBoard()
    const ship = new Ship(2)
    gameBoard.placeShip(ship, [0, 0])
    // Assuming your board is 10x10, this is outside
    gameBoard.receiveAttack([100, 100])
    expect(gameBoard.missedAttacks).toContainEqual([100, 100])
  })
})
