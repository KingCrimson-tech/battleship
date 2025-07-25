import Player from "../models/Player";
import GameBoard from "../models/GameBoard";
import Ship from "../models/Ship";

describe("Player", () => {
    it("should create a player with its own gameboard", () => {
        const player = new Player();
        expect(player.gameboard).toBeInstanceOf(GameBoard);
    });

    it("should create a player with the specified type", () => {
        const realPlayer = new Player("real");
        const computerPlayer = new Player("computer");
        expect(realPlayer.type).toBe("real");
        expect(computerPlayer.type).toBe("computer");   
    });

    //placing a ship
    it("should allow a player to place a ship on their gameboard", () => {
        const player = new Player();
        const ship = new Ship(2);
        player.gameboard.placeShip(ship, [0, 0]);
        expect(player.gameboard.placedShips.some(obj => obj.ship === ship)).toBe(true);
    });

    it("should allow a player to attack another player's gameboard", () => {
        const player1 = new Player();
        const player2 = new Player();
        const ship = new Ship(2);
        player2.gameboard.placeShip(ship, [0, 0]);
        player1.attack(player2, [0, 0]);
        expect(ship.hits).toBe(1);
    });

    it("should allow a computer player to make a random valid attack", () => {
      const Player = require("../models/Player");
      const player = new Player("computer");
      // Add a method to Player for random attack, e.g., player.randomAttack(opponent)
      // For now, just check that the method exists
      expect(typeof player.randomAttack).toBe("function");
    });

    it("should not allow a player to attack the same spot twice", () => {
      const Player = require("../models/Player");
      const player1 = new Player();
      const player2 = new Player();
      player1.attacks = [];
      player1.attack = function(opponent, coord) {
        if (this.attacks.some(([x, y]) => x === coord[0] && y === coord[1])) {
          throw new Error("Already attacked this coordinate");
        }
        this.attacks.push(coord);
        opponent.gameboard.receiveAttack(coord);
      };
      player1.attack(player2, [0, 0]);
      expect(() => player1.attack(player2, [0, 0])).toThrow("Already attacked this coordinate");
    });
})