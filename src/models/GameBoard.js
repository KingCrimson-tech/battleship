import Ship from "./Ship";

module.exports = class GameBoard {
  constructor() {
    this.placedShips = [];
    this.missedAttacks = [];
    this.successfulHits = [];
  }

  placeShip(ship, start, direction = "horizontal") {
    const boardSize = 10;
    const coordinates = [];
    for (let i = 0; i < ship.length; i++) {
      let coord;
      if (direction === "horizontal") {
        coord = [start[0], start[1] + i];
        if (start[1] + i >= boardSize) {
          throw new Error("Ship cannot be placed outside the board");
        }
      } else {
        coord = [start[0] + i, start[1]];
        if (start[0] + i >= boardSize) {
          throw new Error("Ship cannot be placed outside the board");
        }
      }
      // Overlap
      for (const placed of this.placedShips) {
        if (placed.coordinates.some(([x, y]) => x === coord[0] && y === coord[1])) {
          throw new Error("Ship cannot overlap with another ship");
        }
      }
      coordinates.push(coord);
    }
    this.placedShips.push({ ship, coordinates });
  }

  receiveAttack(attackCoord) {
    if (this.successfulHits.some(([x, y]) => x === attackCoord[0] && y === attackCoord[1])) {
      return;
    }
  
    for (const placed of this.placedShips) {
      if (placed.coordinates.some(([x, y]) => x === attackCoord[0] && y === attackCoord[1])) {
        placed.ship.hit();
        this.successfulHits.push(attackCoord);
        return;
      }
    }
    // Record a miss
    this.missedAttacks.push(attackCoord);
  }

  allShipsSunk() {
    return this.placedShips.every(({ ship }) => ship.isSunk());
  }
};