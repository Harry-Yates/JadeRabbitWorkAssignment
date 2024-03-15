import SpinButton from "./components/SpinButton.js";
// import GameState from "./managers/GameState.js";
import SoundManager from "./managers/SoundManager.js";

const app = new PIXI.Application({
  width: 800,
  height: 600,
  antialias: true,
  background: 0xffffff,
  transparent: false,
  resolution: 1,
});

// const gameState = new GameState();
const soundManager = new SoundManager();
soundManager.playBackgroundMusic();

let resultLogged = false;

const testMode = false;
const forceWin = false;

window.addEventListener("load", async () => {
  await loadAssets();
  const appContainer = document.createElement("div");
  appContainer.id = "app-container";
  document.body.appendChild(appContainer);
  appContainer.appendChild(app.view);

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

  const reelSymbols = [
    "Low1.png",
    "High3.png",
    "High2.png",
    "Low2.png",
    "Wild.png",
    "High4.png",
    "Low4.png",
    "High1.png",
    "Low4.png",
    "High4.png",
    "Low2.png",
    "Low1.png",
    "Wild.png",
    "Low3.png",
    "High3.png",
    "High2.png",
    "Low3.png",
    "High1.png",
    "High3.png",
    "Low1.png",
    "High2.png",
    "High4.png",
    "Low3.png",
    "Wild.png",
    "Low2.png",
    "Low4.png",
    "High4.png",
    "High2.png",
    "High1.png",
    "Low1.png",
    "Low3.png",
    "Low4.png",
    "High3.png",
    "Wild.png",
    "High1.png",
    "High4.png",
    "Low2.png",
  ];

  const winningCombinations = reelSymbols.map((symbol) => [
    symbol,
    symbol,
    symbol,
  ]);

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
  line.lineStyle(3, 0xf1d433);
  line.moveTo(0, MIDWAY_LINE_POSITION);
  line.lineTo(app.screen.width, MIDWAY_LINE_POSITION);
  app.stage.addChild(line);

  function getRandomSpinSpeed() {
    return Math.random() * (60 - 30) + 40;
  }

  function getRandomDeceleration() {
    return Math.random() * (0.3 - 0.1) + 0.1;
  }

  function startSpinning() {
    spinning = true;
    resultLogged = false;
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
    const OFFSET = 40;
    const ANIMATION_DURATION = 500;
    const startTime = Date.now();

    reels.forEach((reel, reelIndex) => {
      let closestSymbol = null;
      let minDistance = Number.MAX_VALUE;

      reel.children.forEach((symbol) => {
        const symbolCenter = symbol.y + SYMBOL_SIZE / 2;
        const distance = Math.abs(MIDWAY_LINE_POSITION - symbolCenter);
        if (distance < minDistance) {
          closestSymbol = symbol;
          minDistance = distance;
        }
      });

      const adjustment =
        MIDWAY_LINE_POSITION - (closestSymbol.y + SYMBOL_SIZE / 2) + OFFSET;

      reel.children.forEach((symbol) => {
        const start = symbol.y;
        const end = symbol.y + adjustment;

        function animate() {
          const now = Date.now();
          const progress = Math.min(1, (now - startTime) / ANIMATION_DURATION);

          symbol.y = start + (end - start) * progress;

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            const closestSymbolIndex = reel.children.indexOf(closestSymbol);
            for (let i = closestSymbolIndex - 1; i >= 0; i--) {
              reel.children[i].y =
                reel.children[i + 1].y - SYMBOL_SIZE - SYMBOL_SPACING;
            }
            for (
              let i = closestSymbolIndex + 1;
              i < reel.children.length;
              i++
            ) {
              reel.children[i].y =
                reel.children[i - 1].y + SYMBOL_SIZE + SYMBOL_SPACING;
            }

            if (reelIndex === reels.length - 1) {
              checkWin();
            }
          }
        }

        animate();
      });
    });
  }

  function playWinAnimation() {
    const animationFrames = [];
    for (let i = 0; i <= 25; i++) {
      const frameName = `WinsweepBox${String(i).padStart(2, "0")}.png`;
      const texture = PIXI.Texture.from(frameName);
      animationFrames.push(texture);
    }

    const winAnimation = new PIXI.AnimatedSprite(animationFrames);
    winAnimation.animationSpeed = 0.5;
    winAnimation.loop = false;

    const bounds = calculateWinningSymbolsBounds();
    const padding = 800;

    const aspectRatio = winAnimation.width / winAnimation.height;
    winAnimation.width = bounds.maxX - bounds.minX + padding;
    winAnimation.height = winAnimation.width / aspectRatio;

    winAnimation.x =
      bounds.minX -
      padding / 2 +
      (bounds.maxX - bounds.minX) / 2 -
      winAnimation.width / 2 +
      550;

    winAnimation.y =
      bounds.minY +
      (bounds.maxY - bounds.minY) / 2 -
      winAnimation.height / 2 +
      150;

    winAnimation.zIndex = -1;
    app.stage.sortableChildren = true;

    winAnimation.onComplete = () => {
      app.stage.removeChild(winAnimation);
    };

    winAnimation.play();
    app.stage.addChild(winAnimation);
  }

  function calculateWinningSymbolsBounds() {
    let minX = 100,
      minY = 100,
      maxX = 400,
      maxY = 300;

    return { minX, minY, maxX, maxY };
  }

  function checkWin() {
    if (resultLogged) return;

    let isWin;

    if (testMode) {
      isWin = forceWin;
    } else {
      const symbolsOnLine = reels.map((reel) => {
        const symbolOnLine = reel.children.find((symbol) => {
          return (
            Math.abs(MIDWAY_LINE_POSITION - (symbol.y + SYMBOL_SIZE / 2)) <
            SYMBOL_SIZE / 2
          );
        });
        return symbolOnLine
          ? symbolOnLine.texture.textureCacheIds[0]
          : undefined;
      });

      isWin =
        symbolsOnLine.every((symbolId) => symbolId !== undefined) &&
        winningCombinations.some((combination) => {
          return combination.every((symbolName, index) =>
            symbolsOnLine[index].includes(symbolName)
          );
        });
    }

    if (isWin) {
      console.log("You Win!");
      playWinAnimation();
    } else {
      console.log("You Lose");
    }

    resultLogged = true;
  }

  app.ticker.add((delta) => {
    if (spinning) {
      let allReelsStopped = true;
      reels.forEach((reel, index) => {
        const { deceleration } = reelSettings[index];
        reel.children.forEach((symbol) => {
          symbol.y += symbol.vy * delta;
          if (symbol.y > REEL_HEIGHT) {
            resetSymbolPosition(symbol, reel);
          }
          symbol.vy = Math.max(symbol.vy - deceleration, 0);
        });
        if (
          !stoppingPoints[index].stopped ||
          reel.children.some((symbol) => symbol.vy > 0)
        ) {
          allReelsStopped = false;
        }
      });
      if (allReelsStopped) {
        spinning = false;
        alignSymbolsAndCheckWin();
      }
    }
  });
}
