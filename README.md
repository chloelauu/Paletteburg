# Paletteburg

A top-down Pokémon-style browser game, built while learning HTML5 Canvas by following a tutorial.

**Play it:** https://paletteburg.netlify.app (desktop browser only, no touch controls)

## What it is

Paletteburg is a top-down game where you walk around a town with the W, A, S and D keys. Walking through grass can start a random battle, where your monster, Emble, fights an enemy called Dragul in a turn-based fight.

## What I built

I followed a tutorial for this project, so the design and most of the code structure come from it. The game has a scrolling map with wall collisions, a foreground layer the player can walk behind, and random encounters in the grass. The battle scene has two attacks, animated health bars, a click-through dialogue box and sound.

## What I learned

- Drawing to an HTML5 canvas and running a game loop.
- Animating a character by stepping through the frames of a sprite sheet.
- Turning a flat list of map data into a grid of collision tiles, and blocking movement by checking whether rectangles overlap.
- Organising a game with classes for sprites, monsters and boundaries, and keeping game data in separate files.
- Running battle turns in order using a queue of events.

## Credits

- Built following [Pokémon JavaScript Game Tutorial with HTML Canvas](https://www.youtube.com/watch?v=yP5DKzriqXA).
- Battle music: "Breaking the Chains" by Florian Stracker.
