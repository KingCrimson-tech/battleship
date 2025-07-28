const Ship = require("../models/Ship")

describe("Ship", () => {
  it("should be created with the correct length", () => {
    const ship = new Ship(3)
    expect(ship.length).toBe(3)
  })

  it("should increase the number of hits when hit", () => {
    const ship = new Ship(3)
    ship.hit()
    expect(ship.hits).toBe(1)
  })

  it("should be sunk when the number of hits is equal to the length", () => {
    const ship = new Ship(3)
    ship.hit()
    ship.hit()
    ship.hit()
    expect(ship.isSunk()).toBe(true)
  })
})
