const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

const ZOOM = 1.2;
const CAMERA_SMOOTHING = 0.1;
const BATTLE_WIDTH = 1024;
const BATTLE_HEIGHT = 576;

let worldScale = 1;
let battleScale = 1;

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  worldScale = Math.max(1, Math.round(dpr * ZOOM));

  const fit = Math.min(window.innerWidth / BATTLE_WIDTH, window.innerHeight / BATTLE_HEIGHT);
  battleScale = fit * dpr;
  document.documentElement.style.setProperty("--battle-scale", fit);

  c.imageSmoothingEnabled = false;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
  collisionsMap.push(collisions.slice(i, i + 70));
}

const battleZonesMap = [];
for (let i = 0; i < battleZonesData.length; i += 70) {
  battleZonesMap.push(battleZonesData.slice(i, i + 70));
}

const MAP_WIDTH = collisionsMap[0].length * Boundary.width;
const MAP_HEIGHT = collisionsMap.length * Boundary.height;

const boundaries = [];

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      boundaries.push(
        new Boundary({
          position: {
            x: j * Boundary.width,
            y: i * Boundary.height,
          },
        })
      );
  });
});

const battleZones = [];

battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    if (symbol === 1025)
      battleZones.push(
        new Boundary({
          position: {
            x: j * Boundary.width,
            y: i * Boundary.height,
          },
        })
      );
  });
});

const image = new Image();
image.src = "./img/Palleteburg.png";

const foregroundImage = new Image();
foregroundImage.src = "./img/foregroundObjects.png";

const playerDownImage = new Image();
playerDownImage.src = "./img/PlayerDown.png";

const playerUpImage = new Image();
playerUpImage.src = "./img/PlayerUp.png";

const playerLeftImage = new Image();
playerLeftImage.src = "./img/PlayerLeft.png";

const playerRightImage = new Image();
playerRightImage.src = "./img/PlayerRight.png";

const player = new Sprite({
  position: {
    x: 743,
    y: 674,
  },
  image: playerDownImage,
  frames: {
    max: 4,
    hold: 10,
  },
  sprites: {
    up: playerUpImage,
    left: playerLeftImage,
    down: playerDownImage,
    right: playerRightImage,
  },
});

const background = new Sprite({
  position: { x: 0, y: 0 },
  image: image,
});

const foreground = new Sprite({
  position: { x: 0, y: 0 },
  image: foregroundImage,
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

const camera = { x: 0, y: 0, ready: false };

function clampCamera(value, viewSize, mapSize) {
  if (viewSize >= mapSize) return (mapSize - viewSize) / 2;
  return Math.min(Math.max(value, 0), mapSize - viewSize);
}

function updateCamera() {
  if (!player.width) return;

  const viewWidth = canvas.width / worldScale;
  const viewHeight = canvas.height / worldScale;

  const targetX = clampCamera(player.position.x + player.width / 2 - viewWidth / 2, viewWidth, MAP_WIDTH);
  const targetY = clampCamera(player.position.y + player.height / 2 - viewHeight / 2, viewHeight, MAP_HEIGHT);

  if (!camera.ready) {
    camera.x = targetX;
    camera.y = targetY;
    camera.ready = true;
  }

  camera.x += (targetX - camera.x) * CAMERA_SMOOTHING;
  camera.y += (targetY - camera.y) * CAMERA_SMOOTHING;
}

function rectangularCollision({ rectangle1, rectangle2 }) {
  return (
    rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
    rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
    rectangle1.position.y + rectangle1.height >= rectangle2.position.y &&
    rectangle1.position.y <= rectangle2.position.y + rectangle2.height
  );
}

const battle = {
  initiated: false,
};

function animate() {
  const animationId = window.requestAnimationFrame(animate);
  updateCamera();
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.setTransform(
    worldScale, 0, 0, worldScale,
    -Math.round(camera.x * worldScale),
    -Math.round(camera.y * worldScale)
  );
  background.draw();
  boundaries.forEach((boundary) => {
    boundary.draw();
  });
  battleZones.forEach((battleZone) => {
    battleZone.draw();
  });
  player.draw();
  foreground.draw();

  let moving = true;
  player.animate = false;

  if (battle.initiated) return;

  //activate baattle zone
  if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i];
      const overlappingArea =
        (Math.min(
          player.position.x + player.width,
          battleZone.position.x + battleZone.width
        ) -
          Math.max(player.position.x, battleZone.position.x)) *
        (Math.min(
          player.position.y + player.height,
          battleZone.position.y + battleZone.height
        ) -
          Math.max(player.position.y, battleZone.position.y));
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: battleZone,
        }) &&
        overlappingArea > (player.width * player.height) / 2 &&
        Math.random() < 0.01
      ) {
        // deactivate current animation loop
        window.cancelAnimationFrame(animationId);

        audio.Map.stop()
        audio.initBattle.play()
        audio.battle.play()

        battle.initiated = true;
        gsap.to("#overlappingDiv", {
          opacity: 1,
          repeat: 3,
          yoyo: true,
          duration: 0.4,
          onComplete() {
            gsap.to("#overlappingDiv", {
              opacity: 1,
              duration: 0.4,
              onComplete() {
                // activate a new animation loop
                initBattle();
                animateBattle();
                gsap.to("#overlappingDiv", {
                  opacity: 0,
                  duration: 0.4,
                });
              },
            });
          },
        });
        break;
      }
    }
  }

  if (keys.w.pressed && lastKey == "w") {
    player.animate = true;
    player.image = player.sprites.up;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y + 3,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) player.position.y -= 3;
  } else if (keys.a.pressed && lastKey === "a") {
    player.animate = true;
    player.image = player.sprites.left;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x + 3,
              y: boundary.position.y,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) player.position.x -= 3;
  } else if (keys.s.pressed && lastKey === "s") {
    player.animate = true;
    player.image = player.sprites.down;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x,
              y: boundary.position.y - 3,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) player.position.y += 3;
  } else if (keys.d.pressed && lastKey === "d") {
    player.animate = true;
    player.image = player.sprites.right;

    for (let i = 0; i < boundaries.length; i++) {
      const boundary = boundaries[i];
      if (
        rectangularCollision({
          rectangle1: player,
          rectangle2: {
            ...boundary,
            position: {
              x: boundary.position.x - 3,
              y: boundary.position.y,
            },
          },
        })
      ) {
        moving = false;
        break;
      }
    }

    if (moving) player.position.x += 3;
  }
}
// animate()

let lastKey = "";
window.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = true;
      lastKey = "w";
      break;
    case "a":
      keys.a.pressed = true;
      lastKey = "a";
      break;
    case "s":
      keys.s.pressed = true;
      lastKey = "s";
      break;
    case "d":
      keys.d.pressed = true;
      lastKey = "d";
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.key) {
    case "w":
      keys.w.pressed = false;
      break;
    case "a":
      keys.a.pressed = false;
      break;
    case "s":
      keys.s.pressed = false;
      break;
    case "d":
      keys.d.pressed = false;
      break;
  }
});

let musicStarted = false;

function startGame() {
  if (musicStarted) return;
  musicStarted = true;
  document.querySelector("#startScreen").style.display = "none";
  audio.Map.play();
}

addEventListener("click", startGame);
addEventListener("keydown", startGame);

// stop trackpad pinch / Ctrl+scroll from zooming the browser
window.addEventListener("wheel", (e) => {
  if (e.ctrlKey) e.preventDefault();
}, { passive: false });