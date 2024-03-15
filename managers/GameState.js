class GameState {
  constructor() {
    this.isSpinning = false;
    this.resultLogged = false;
    // Add more state variables as needed
  }

  startSpinning() {
    this.isSpinning = true;
    this.resultLogged = false;
    // Add logic for starting spinning
  }

  stopSpinning() {
    this.isSpinning = false;
    // Add logic for stopping spinning
  }

  logResult(win) {
    this.resultLogged = true;
    // Logic for handling win/lose
  }
}

export default GameState;
