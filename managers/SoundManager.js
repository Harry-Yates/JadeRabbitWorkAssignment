class SoundManager {
  constructor() {
    this.backgroundMusic = new Howl({
      src: ["./music/02. Jungle Madness.mp3"],
      autoplay: true,
      loop: true,
      volume: 0.4,
    });
  }

  playBackgroundMusic() {
    this.backgroundMusic.play();
  }

  stopBackgroundMusic() {
    this.backgroundMusic.stop();
  }
}

export default SoundManager;
