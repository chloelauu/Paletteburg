const monsters = {
  Emble: {
    position: {
      x: 280,
      y: 325,
    },
    image: {
      src: "./img/embleSprite.png",
    },
    frames: {
      max: 4,
      hold: 30,
    },
    animate: true,
    name: "Emble",
    attacks: [attacks.Tackle, attacks.Fireball],
  },
  Dragul: {
    position: {
      x: 800,
      y: 100,
    },
    image: {
      src: "./img/dragulSprite.png",
    },
    frames: {
      max: 4,
      hold: 30,
    },
    animate: true,
    isEnemy: true,
    name: "Dragul",
    attacks: [attacks.Tackle, attacks.Fireball],
  },
};
