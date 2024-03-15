export default class SpinButton {
  constructor(app, onStartSpin, onStopSpin) {
    this.app = app;
    this.onStartSpin = onStartSpin;
    this.onStopSpin = onStopSpin;
    this.spinning = false;
    this.createButton();
  }

  createButton() {
    const buttonSize = 60; // You might want to adjust this for your needs

    // Create the play icon
    const playIcon = new PIXI.Graphics();
    playIcon.beginFill(0xffd700); // Gold color
    playIcon.drawPolygon([1, 0, 20, 10, 1, 20]);
    playIcon.endFill();
    playIcon.x = buttonSize / 2.7;
    playIcon.y = buttonSize / 3;

    // Create the pause icon
    const pauseIcon = new PIXI.Graphics();
    pauseIcon.beginFill(0xffd700); // Gold color
    pauseIcon.drawRect(0, 0, 6, 20);
    pauseIcon.drawRect(14, 0, 6, 20);
    pauseIcon.x = buttonSize / 3;
    pauseIcon.y = buttonSize / 3;

    // Create the spin button with a new style
    const spinButton = new PIXI.Graphics();
    this.updateButtonStyle(spinButton, 0x8b0000, buttonSize); // Deep red

    // Position the button as per your layout
    spinButton.x = (this.app.screen.width - buttonSize) / 2;
    spinButton.y = this.app.screen.height - buttonSize - 20;
    spinButton.interactive = true;
    spinButton.buttonMode = true;

    // Add the appropriate icon based on the spinning state
    spinButton.addChild(this.spinning ? pauseIcon : playIcon);

    // Event listener for the button click
    spinButton.on("pointerdown", () => {
      this.onSpinButtonClicked(spinButton, playIcon, pauseIcon);
    });

    // Add the button to the stage
    this.app.stage.addChild(spinButton);
  }

  updateButtonStyle(graphic, fillColor, size) {
    // Clear the previous style
    graphic.clear();

    // Decorative border style
    graphic.lineStyle(3, 0xffd700); // Gold color
    graphic.beginFill(fillColor);
    graphic.drawCircle(size / 2, size / 2, size / 2);
    graphic.endFill();
  }

  onSpinButtonClicked(spinButton, playIcon, pauseIcon) {
    spinButton.removeChild(playIcon);
    spinButton.removeChild(pauseIcon);

    if (!this.spinning) {
      this.spinning = true;
      this.onStartSpin();
      spinButton.addChild(pauseIcon);

      setTimeout(() => {
        this.spinning = false;
        this.onStopSpin();
        spinButton.removeChild(pauseIcon);
        spinButton.addChild(playIcon);
        spinButton.interactive = true;
      }, 2500);
    } else {
      this.spinning = false;
      this.onStopSpin();
      spinButton.removeChild(pauseIcon);
      spinButton.addChild(playIcon);
      spinButton.interactive = true;
    }
  }
}
