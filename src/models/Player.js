import GameBoard from './GameBoard';

class Player {
  constructor(type = "real") {
    this.type = type;
    this.gameboard = new GameBoard();
    this.attacks = [];
  }

  attack(opponent, coord) {
    if (this.attacks.some(([x, y]) => x === coord[0] && y === coord[1])) {
      throw new Error("Already attacked this coordinate");
    }
    this.attacks.push(coord);
    opponent.gameboard.receiveAttack(coord);
  }

  randomAttack(opponent) {
    const boardSize = 10;
    let coord;
    let attempts = 0;
    do {
      coord = [
        Math.floor(Math.random() * boardSize),
        Math.floor(Math.random() * boardSize)
      ];
      attempts++;
      // Prevent infinite loop if all spots are attacked
      if (attempts > boardSize * boardSize) {
        throw new Error("No valid moves left");
      }
    } while (this.attacks.some(([x, y]) => x === coord[0] && y === coord[1]));
    this.attack(opponent, coord);
    return coord;
  }
}

module.exports = Player;
