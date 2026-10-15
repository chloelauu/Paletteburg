const battleBackgroundImage = new Image();
battleBackgroundImage.src = "./img/battleBackground.png";
const battleBackground = new Sprite({
  position: {
    x: 0,
    y: 0,
  },
  image: battleBackgroundImage,
});

let dragul;
let emble;
let renderedSprites;
let battleAnimationId;
let queue = [];

function initBattle() {
  document.querySelector("#userInterface").style.display = "block";
  document.querySelector("#dialogueBox").style.display = "none";
  document.querySelector("#enemyHealthBar").style.width = "100%";
  document.querySelector("#playerHealthBar").style.width = "100%";
  document.querySelector("#attacksBox").replaceChildren(); // clear the attack buttons

  dragul = new Monster(monsters.Dragul);
  emble = new Monster(monsters.Emble);
  renderedSprites = [dragul, emble];
  queue = [];

  emble.attacks.forEach((attack) => {
    const button = document.createElement("button");
    button.innerHTML = attack.name;
    document.querySelector("#attacksBox").append(button);
  });

  // our event listneres for our buttons (attack)
  document.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      emble.attack({
        attack: selectedAttack,
        recipent: dragul,
        renderedSprites,
      });

      if (dragul.health <= 0) {
        queue.push(() => {
          dragul.faint();
        });
        queue.push(() => {
          // fade back to black
          gsap.to("#overlappingDiv", {
            opacity: 1,
            onComplete: () => {
              cancelAnimationFrame(battleAnimationId);
              animate();
              document.querySelector("#userInterface").style.display = "none";

              gsap.to("#overlappingDiv", {
                opacity: 0,
              });

              battle.initiated = false
              audio.Map.play();
            },
          });
        });
      }

      // enemy attacks right here
      const randomAttack =
        dragul.attacks[Math.floor(Math.random() * dragul.attacks.length)];

      queue.push(() => {
        dragul.attack({
          attack: randomAttack,
          recipent: emble,
          renderedSprites,
        });

        if (emble.health <= 0) {
          queue.push(() => {
            emble.faint();
          });

          queue.push(() => {
            // fade back to black
            gsap.to("#overlappingDiv", {
              opacity: 1,
              onComplete: () => {
                cancelAnimationFrame(battleAnimationId);
                animate();
                document.querySelector("#userInterface").style.display = "none";

                gsap.to("#overlappingDiv", {
                  opacity: 0,
                });

                battle.initiated = false
                audio.Map.play();
              },
            });
          });
        }
      });
    });

    button.addEventListener("mouseenter", (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      document.querySelector("#attackType").innerHTML = selectedAttack.type;
      document.querySelector("#attackType").style.color = selectedAttack.color;
    });
  });
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle);

  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = "black";
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.setTransform(
    battleScale, 0, 0, battleScale,
    (canvas.width - BATTLE_WIDTH * battleScale) / 2,
    (canvas.height - BATTLE_HEIGHT * battleScale) / 2
  );

  battleBackground.draw();
  renderedSprites.forEach((sprite) => {
    sprite.draw();
  });
}

animate()
// initBattle();
// animateBattle();

document.querySelector("#dialogueBox").addEventListener("click", (e) => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else e.currentTarget.style.display = "none";
});
