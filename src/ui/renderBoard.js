function createBoard(containerId, clickHandler = null) {
  const container = document.getElementById(containerId)
  container.innerHTML = ""

  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      const cell = document.createElement("div")
      cell.className = "cell"
      cell.dataset.row = row
      cell.dataset.col = col

      if (clickHandler) {
        cell.addEventListener("click", () => clickHandler(row, col))
      }

      container.appendChild(cell)
    }
  }
}

function renderPlayerBoard(gameManager, containerId) {
  const container = document.getElementById(containerId)
  const cells = container.querySelectorAll(".cell")

  // Clear all cell states
  cells.forEach((cell) => {
    cell.className = "cell"
  })

  // Show placed ships
  gameManager.player.gameboard.placedShips.forEach(({ ship, coordinates }) => {
    coordinates.forEach(([row, col]) => {
      const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`)
      if (cell) {
        cell.classList.add("ship")
      }
    })
  })

  // Show hits on player's ships
  gameManager.player.gameboard.successfulHits.forEach(([row, col]) => {
    const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`)
    if (cell) {
      cell.classList.add("hit")

      // Check if ship is sunk
      const placedShip = gameManager.player.gameboard.placedShips.find(({ coordinates }) =>
        coordinates.some(([x, y]) => x === row && y === col),
      )

      if (placedShip && placedShip.ship.isSunk()) {
        placedShip.coordinates.forEach(([sunkRow, sunkCol]) => {
          const sunkCell = container.querySelector(`[data-row="${sunkRow}"][data-col="${sunkCol}"]`)
          if (sunkCell) {
            sunkCell.classList.add("sunk")
          }
        })
      }
    }
  })

  // Show misses
  gameManager.player.gameboard.missedAttacks.forEach(([row, col]) => {
    const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`)
    if (cell) {
      cell.classList.add("miss")
    }
  })
}

function renderComputerBoard(gameManager, containerId) {
  const container = document.getElementById(containerId)
  const cells = container.querySelectorAll(".cell")

  // Clear all cell states
  cells.forEach((cell) => {
    cell.className = "cell"
  })

  // Show hits on computer's ships (but don't reveal ship positions until hit)
  gameManager.computer.gameboard.successfulHits.forEach(([row, col]) => {
    const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`)
    if (cell) {
      cell.classList.add("ship", "hit")

      // Check if ship is sunk
      const placedShip = gameManager.computer.gameboard.placedShips.find(({ coordinates }) =>
        coordinates.some(([x, y]) => x === row && y === col),
      )

      if (placedShip && placedShip.ship.isSunk()) {
        placedShip.coordinates.forEach(([sunkRow, sunkCol]) => {
          const sunkCell = container.querySelector(`[data-row="${sunkRow}"][data-col="${sunkCol}"]`)
          if (sunkCell) {
            sunkCell.classList.add("sunk")
          }
        })
      }
    }
  })

  // Show misses
  gameManager.computer.gameboard.missedAttacks.forEach(([row, col]) => {
    const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`)
    if (cell) {
      cell.classList.add("miss")
    }
  })

  // Show attacked cells as non-clickable
  const attackedCoords = [...gameManager.player.attacks]

  attackedCoords.forEach(([row, col]) => {
    const cell = container.querySelector(`[data-row="${row}"][data-col="${col}"]`)
    if (cell) {
      cell.style.cursor = "not-allowed"
      cell.style.opacity = "0.7"
    }
  })
}

function showShipPreview(gameManager, containerId, row, col) {
  const container = document.getElementById(containerId)
  const cells = container.querySelectorAll(".cell")

  // Clear previous previews
  cells.forEach((cell) => {
    cell.classList.remove("preview", "invalid-preview")
  })

  const coordinates = gameManager.canPlaceShip([row, col])

  if (coordinates) {
    coordinates.forEach(([previewRow, previewCol]) => {
      const cell = container.querySelector(`[data-row="${previewRow}"][data-col="${previewCol}"]`)
      if (cell) {
        cell.classList.add("preview")
      }
    })
  } else {
    // Show invalid placement
    const shipData = gameManager.getCurrentShip()
    if (shipData) {
      const direction = gameManager.currentDirection
      for (let i = 0; i < shipData.length; i++) {
        let previewRow, previewCol
        if (direction === "horizontal") {
          previewRow = row
          previewCol = col + i
        } else {
          previewRow = row + i
          previewCol = col
        }

        if (previewRow < 10 && previewCol < 10) {
          const cell = container.querySelector(`[data-row="${previewRow}"][data-col="${previewCol}"]`)
          if (cell) {
            cell.classList.add("invalid-preview")
          }
        }
      }
    }
  }
}

function clearShipPreview(containerId) {
  const container = document.getElementById(containerId)
  const cells = container.querySelectorAll(".cell")

  cells.forEach((cell) => {
    cell.classList.remove("preview", "invalid-preview")
  })
}

module.exports = {
  createBoard,
  renderPlayerBoard,
  renderComputerBoard,
  showShipPreview,
  clearShipPreview,
}
