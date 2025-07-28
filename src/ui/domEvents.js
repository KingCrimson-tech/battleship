const GameManager = require("../game/gameManager")
const {
  createBoard,
  renderPlayerBoard,
  renderComputerBoard,
  showShipPreview,
  clearShipPreview,
} = require("./renderBoard")

class DOMEvents {
  constructor() {
    this.gameManager = new GameManager()
    this.setupEventListeners()
    this.initializeSetupPhase()
  }

  setupEventListeners() {
    // Setup phase buttons
    document.getElementById("random-placement").addEventListener("click", () => {
      this.handleRandomPlacement()
    })

    document.getElementById("start-game").addEventListener("click", () => {
      this.handleStartGame()
    })

    // Game phase buttons
    document.getElementById("new-game").addEventListener("click", () => {
      this.handleNewGame()
    })

    document.getElementById("play-again").addEventListener("click", () => {
      this.handleNewGame()
    })

    document.getElementById("rotate-ship").addEventListener("click", () => {
      if (this.gameManager.gamePhase === "setup") {
        this.gameManager.toggleDirection()
        this.updateShipPreviews()
      }
    })

    // Ship rotation (right-click or double-click)
    document.addEventListener("contextmenu", (e) => {
      if (this.gameManager.gamePhase === "setup") {
        e.preventDefault()
        this.gameManager.toggleDirection()
        this.updateShipPreviews()
      }
    })

    document.addEventListener("keydown", (e) => {
      if (e.key === "r" || e.key === "R") {
        if (this.gameManager.gamePhase === "setup") {
          this.gameManager.toggleDirection()
          this.updateShipPreviews()
        }
      }
    })
  }

  initializeSetupPhase() {
    this.updateGameStatus("Place your ships to start the game")
    this.createSetupBoard()
    this.updateShipsList()
  }

  createSetupBoard() {
    createBoard("setup-board", (row, col) => {
      this.handleSetupBoardClick(row, col)
    })

    // Add hover effects for ship placement
    const setupBoard = document.getElementById("setup-board")
    setupBoard.addEventListener("mouseover", (e) => {
      if (e.target.classList.contains("cell")) {
        const row = Number.parseInt(e.target.dataset.row)
        const col = Number.parseInt(e.target.dataset.col)
        showShipPreview(this.gameManager, "setup-board", row, col)
      }
    })

    setupBoard.addEventListener("mouseout", () => {
      clearShipPreview("setup-board")
    })
  }

  handleSetupBoardClick(row, col) {
    if (this.gameManager.placePlayerShip([row, col])) {
      this.updateSetupBoard()
      this.updateShipsList()

      if (this.gameManager.currentShipIndex >= this.gameManager.shipsToPlace.length) {
        this.enableStartButton()
        this.updateGameStatus("All ships placed! Ready to start the game.")
        clearShipPreview("setup-board")
      } else {
        this.updateGameStatus(`Place your ${this.gameManager.getCurrentShip().name}`)
      }
    }
  }

  handleRandomPlacement() {
    this.gameManager.randomPlacePlayerShips()
    this.updateSetupBoard()
    this.updateShipsList()
    this.enableStartButton()
    this.updateGameStatus("Ships randomly placed! Ready to start the game.")
    clearShipPreview("setup-board")
  }

  handleStartGame() {
    if (this.gameManager.startGame()) {
      this.showGamePhase()
      this.createGameBoards()
      this.updateGameStatus("Your turn! Click on the enemy waters to attack.")
    }
  }

  handleNewGame() {
    this.gameManager.resetGame()
    this.showSetupPhase()
    this.initializeSetupPhase()
    this.hideGameOverModal()
  }

  createGameBoards() {
    createBoard("player-board")
    createBoard("computer-board", (row, col) => {
      this.handleComputerBoardClick(row, col)
    })

    this.updateGameBoards()
  }

  handleComputerBoardClick(row, col) {
    if (this.gameManager.currentPlayer !== this.gameManager.player) {
      return
    }

    const result = this.gameManager.playerAttack([row, col])

    if (result.success) {
      this.updateGameBoards()

      if (result.gameOver) {
        this.handleGameOver(result.winner)
        return
      }

      this.updateGameStatus("Computer's turn...")

      // Delay computer attack for better UX
      setTimeout(() => {
        const computerResult = this.gameManager.computerAttack()
        if (computerResult) {
          this.updateGameBoards()

          if (computerResult.gameOver) {
            this.handleGameOver(computerResult.winner)
          } else {
            this.updateGameStatus("Your turn! Click on the enemy waters to attack.")
          }
        }
      }, 1000)
    }
  }

  updateSetupBoard() {
    renderPlayerBoard(this.gameManager, "setup-board")
  }

  updateGameBoards() {
    renderPlayerBoard(this.gameManager, "player-board")
    renderComputerBoard(this.gameManager, "computer-board")
  }

  updateShipsList() {
    const shipItems = document.querySelectorAll(".ship-item")
    shipItems.forEach((item, index) => {
      item.classList.remove("active", "placed")

      if (index < this.gameManager.currentShipIndex) {
        item.classList.add("placed")
      } else if (index === this.gameManager.currentShipIndex) {
        item.classList.add("active")
      }
    })
  }

  updateShipPreviews() {
    // This could be enhanced to show direction indicator
    const activeShip = document.querySelector(".ship-item.active")
    if (activeShip) {
      const preview = activeShip.querySelector(".ship-preview")
      preview.style.flexDirection = this.gameManager.currentDirection === "vertical" ? "column" : "row"
    }
  }

  enableStartButton() {
    const startButton = document.getElementById("start-game")
    startButton.disabled = false
  }

  showSetupPhase() {
    document.getElementById("setup-phase").style.display = "block"
    document.getElementById("game-phase").style.display = "none"
  }

  showGamePhase() {
    document.getElementById("setup-phase").style.display = "none"
    document.getElementById("game-phase").style.display = "block"
  }

  updateGameStatus(message) {
    document.getElementById("game-status").textContent = message
  }

  handleGameOver(winner) {
    const modal = document.getElementById("game-over-modal")
    const resultTitle = document.getElementById("game-result")
    const resultMessage = document.getElementById("game-result-message")

    if (winner === "player") {
      resultTitle.textContent = "🎉 Victory!"
      resultMessage.textContent = "Congratulations! You sunk all enemy ships!"
    } else {
      resultTitle.textContent = "💥 Defeat!"
      resultMessage.textContent = "The enemy has sunk all your ships. Better luck next time!"
    }

    modal.style.display = "flex"
    this.updateGameStatus(`Game Over - ${winner === "player" ? "You Win!" : "Computer Wins!"}`)
  }

  hideGameOverModal() {
    document.getElementById("game-over-modal").style.display = "none"
  }
}

module.exports = DOMEvents
