require("./styles.css")
const DOMEvents = require("./ui/domEvents")

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new DOMEvents()
})
