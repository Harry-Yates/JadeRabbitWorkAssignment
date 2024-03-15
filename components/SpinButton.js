export default class SpinButton {
  constructor(app, onStartSpin, onStopSpin) {
    this.app = app;
    this.onStartSpin = onStartSpin;
    this.onStopSpin = onStopSpin;
    this.spinning = false;
    this.createButton();
  }

  createButton() {
    const buttonSize = 60;

    const playIcon = new PIXI.Graphics();
    playIcon.beginFill(0xffffff);
    playIcon.moveTo(1, 0);
    playIcon.lineTo(20, 10);
    playIcon.lineTo(0, 20);
    playIcon.lineTo(0, 0);
    playIcon.endFill();
    playIcon.x = buttonSize / 2.7;
    playIcon.y = buttonSize / 3;

    const pauseIcon = new PIXI.Graphics();
    pauseIcon.beginFill(0xffffff);
    pauseIcon.drawRect(0, 0, 6, 20);
    pauseIcon.drawRect(14, 0, 6, 20);
    pauseIcon.x = buttonSize / 3;
    pauseIcon.y = buttonSize / 3;

    const spinButton = new PIXI.Graphics();
    this.updateButtonStyle(spinButton, 0x333333, buttonSize);

    spinButton.x = (this.app.screen.width - buttonSize) / 2;
    spinButton.y = this.app.screen.height - buttonSize - 20;
    spinButton.interactive = true;
    spinButton.buttonMode = true;

    spinButton.addChild(this.spinning ? pauseIcon : playIcon);

    spinButton.on("pointerdown", () => {
      this.onSpinButtonClicked(spinButton, playIcon, pauseIcon);
    });

    this.app.stage.addChild(spinButton);
  }

  updateButtonStyle(graphic, fillColor, size) {
    graphic.clear();
    graphic.lineStyle(2, 0xffffff);
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
