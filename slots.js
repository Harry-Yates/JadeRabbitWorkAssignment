import SpinButton from "./components/SpinButton.js";

const app = new PIXI.Application({
  width: 800,
  height: 600,
  antialias: true,
  transparent: false,
  resolution: 1,
});

window.addEventListener("load", async () => {
  await loadAssets();
  const appContainer = document.createElement("div");
  appContainer.id = "app-container";
  document.body.appendChild(appContainer);
  appContainer.appendChild(app.view); // Append the PIXI app's view to a container div

  await run();
});

async function loadAssets() {
  const assetPromises = [];
  assetPromises.push(PIXI.Assets.load("assets.json"));
  await Promise.all(assetPromises);
}

async function run() {
  const reelContainer = new PIXI.Container();
  app.stage.addChild(reelContainer);

  reelContainer.x = app.screen.width / 2 - 385;
  reelContainer.y = app.screen.height / 2 - 690 / 2;

  const textures = Object.keys(PIXI.utils.TextureCache).reduce((acc, key) => {
    acc[key] = PIXI.Texture.from(key);
    return acc;
  }, {});

  // Assuming reelSymbols is already defined as shown previously
  const reelSymbols = [
    "High1.png",
    "High2.png",
    "High3.png",
    "High4.png",
    "Wild.png",
    "Low1.png",
    "Low2.png",
    "Low3.png",
    "Low4.png",
  ];

  // Dynamically generate winning combinations based on the reelSymbols
  // This assumes a winning combination is three of the same symbol
  const winningCombinations = reelSymbols.map((symbol) => [
    symbol,
    symbol,
    symbol,
  ]);

  // Continue with your run function or wherever you need to use winningCombinations
  async function run() {
    // The rest of your code where winningCombinations is used
  }

  const reels = [];
  for (let i = 0; i < 3; i++) {
    const reel = new PIXI.Container();
    reel.x = i * 260;
    reelContainer.addChild(reel);
    reels.push(reel);

    reelSymbols.forEach((symbol, index) => {
      const sprite = new PIXI.Sprite(textures[symbol]);
      sprite.y = index * 235;
      reel.addChild(sprite);
    });
  }

  let spinning = false;
  const SYMBOL_SIZE = 225;
  const SYMBOL_SPACING = 20;
  const VISIBLE_SYMBOLS = 3;
  const REEL_HEIGHT =
    SYMBOL_SIZE * VISIBLE_SYMBOLS + SYMBOL_SPACING * (VISIBLE_SYMBOLS - 1);
  const spinButton = new SpinButton(app, startSpinning, stopSpinning);

  function stopAutoplay() {
    clearInterval(autoplayInterval);
    autoplayInterval = null;
  }

  const reelSettings = reels.map(() => ({
    spinSpeed: getRandomSpinSpeed(),
    deceleration: getRandomDeceleration(),
  }));

  const stoppingPoints = reels.map(() => ({ position: 0, stopped: false }));

  const MIDWAY_LINE_POSITION = app.screen.height / 2;

  const line = new PIXI.Graphics();
  line.lineStyle(2, 0xffa500);
  line.moveTo(0, MIDWAY_LINE_POSITION);
  line.lineTo(app.screen.width, MIDWAY_LINE_POSITION);
  app.stage.addChild(line);

  function getRandomSpinSpeed() {
    return Math.random() * (80 - 40) + 40;
  }

  function getRandomDeceleration() {
    return Math.random() * (0.2 - 0.05) + 0.05;
  }

  function startSpinning() {
    spinning = true;
    stoppingPoints.forEach((point) => (point.stopped = false));
    reels.forEach((reel, index) => {
      reel.children.forEach(
        (symbol) => (symbol.vy = reelSettings[index].spinSpeed)
      );
    });
  }

  function stopSpinning() {
    stoppingPoints.forEach((point, index) => {
      point.position = reels[index].y + REEL_HEIGHT * 2;
      point.stopped = true;
    });
  }

  function resetSymbolPosition(symbol, reel) {
    const topSymbol = reel.children.reduce((prev, current) =>
      prev.y < current.y ? prev : current
    );
    symbol.y = topSymbol.y - SYMBOL_SIZE - SYMBOL_SPACING;
  }

  function alignSymbolsAndCheckWin() {
    reels.forEach((reel) => {
      let closestSymbol = null;
      let minDistance = Number.MAX_VALUE;
      reel.children.forEach((symbol) => {
        const distance = Math.abs(
          MIDWAY_LINE_POSITION - (symbol.y + SYMBOL_SIZE / 2)
        );
        if (distance < minDistance) {
          closestSymbol = symbol;
          minDistance = distance;
        }
      });
      const adjustment =
        MIDWAY_LINE_POSITION - (closestSymbol.y + SYMBOL_SIZE / 2);
      reel.children.forEach((symbol) => (symbol.y += adjustment));
    });
    checkWin();
  }

  function checkWin() {
    const symbolsOnLine = reels.map(
      (reel) =>
        reel.children.find(
          (symbol) =>
            Math.abs(MIDWAY_LINE_POSITION - (symbol.y + SYMBOL_SIZE / 2)) <
            SYMBOL_SIZE / 2
        ).texture.textureCacheIds[0]
    );
    const isWin = winningCombinations.some((combination) =>
      combination.every((symbolName, index) =>
        symbolsOnLine[index].includes(symbolName)
      )
    );
    console.log(isWin ? "Win!" : "Lose.");
  }

  app.ticker.add((delta) => {
    if (spinning) {
      let allReelsStopped = true;
      reels.forEach((reel, index) => {
        const { deceleration } = reelSettings[index];
        reel.children.forEach((symbol) => {
          // Ensure 'symbol' is correctly defined and used within this scope
          symbol.y += symbol.vy * delta;
          if (symbol.y > REEL_HEIGHT) {
            resetSymbolPosition(symbol, reel); // 'symbol' and 'reel' are correctly passed and should be defined within 'resetSymbolPosition'
          }
          symbol.vy = Math.max(symbol.vy - deceleration, 0);
        });
        // This is a likely place for the error if 'symbol' was referenced outside its defining loop
        if (
          !stoppingPoints[index].stopped ||
          reel.children.some((symbol) => symbol.vy > 0)
        ) {
          // Correct usage of 'symbol' within 'some' method
          allReelsStopped = false;
        }
      });
      if (allReelsStopped) {
        spinning = false;
        alignSymbolsAndCheckWin(); // Ensure this function does not incorrectly reference 'symbol'
      }
    }
  });
}
