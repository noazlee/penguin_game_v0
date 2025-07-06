import { makeBirdEnemy, makeFlameEnemy, makeGuyEnemy, makePlayer, setControls } from "./entities";
import { k } from "./kaboomCtx";
import { makeMap } from "./utils";


async function gameSetup(){

    // Load Sprites
    k.loadSprite("assets", "./kirby-like.png", {    // Ref to public/
        sliceX: 9,
        sliceY: 10,
        anims: {
            kirbIdle: 0,
            kirbInhaling: 1,
            kirbFull: 2,
            kirbInhaleEffect: {from: 3, to: 8, speed: 15, loop: true},
            shootingStar: 9,
            flame: {from: 36, to: 37, speed: 4, loop: true},
            guyIdle: 18,
            guyWalk: {from: 18, to: 19, speed: 4, loop: true},
            bird: {from: 27, to: 28, speed: 4, loop: true},
        },
    });

    k.loadSprite("level-1", "./level-1.png");
    k.loadSprite("level-2", "./level-2.png");

    const {map: level1Layout, spawnPoints: level1SpawnPoints} = await makeMap( // deconstructive component
        k, 
        "level-1"
    );
    const {map: level2Layout, spawnPoints: level2SpawnPoints} = await makeMap( // deconstructive component
        k, 
        "level-2"
    );

    // level 1
    k.scene("level-1", () => {
        k.setGravity(1800);
        k.add([
            k.rect(k.width(), k.height()),
            k.color(k.Color.fromHex("#f7d7db")),
            k.fixed(), // not effected by camera
        ]); 

        // drawing map
        k.add(level1Layout);

        // creating kirby character
        const kirb = makePlayer(
            k,
            level1SpawnPoints.player[0].x,
            level1SpawnPoints.player[0].y,
        );

        setControls(k, kirb);
        k.add(kirb);

        // camera
        k.camScale(k.vec2(0.7)); // or k.camScale(0.7, 0.7)
        k.onUpdate(()=>{
            if (kirb.pos.x < level1Layout.pos.x + 432) {
                k.camPos(kirb.pos.x + 500, 800);  // camera follows player until certain point - player on left side of screen (+500)
            }
        });

        // enemies
        for (const flame of level1SpawnPoints.flame){
            makeFlameEnemy(k, flame.x, flame.y); 
        }
        for (const guy of level1SpawnPoints.guy){
            makeGuyEnemy(k, guy.x, guy.y); 
        }
        for (const bird of level1SpawnPoints.bird){
            const possibleSpeeds = [100, 150, 200, 250, 300];
            k.loop(10, () => {
                makeBirdEnemy(k, 
                    bird.x, 
                    bird.y,
                    possibleSpeeds[Math.floor(Math.random() * possibleSpeeds.length)] // get random element in array
                ); 
            });
        }

    });

    // level 2
    k.scene("level-2", () => {
        k.setGravity(1800);
        k.add([
            k.rect(k.width(), k.height()),
            k.color(k.Color.fromHex("#f7d7db")),
            k.fixed(), // not effected by camera
        ]); 

        // drawing map
        k.add(level2Layout);

        // creating kirby character
        const kirb = makePlayer(
            k,
            level2SpawnPoints.player[0].x,
            level2SpawnPoints.player[0].y,
        );

        setControls(k, kirb);
        k.add(kirb);

        // camera
        k.camScale(k.vec2(0.7)); // or k.camScale(0.7, 0.7)
        k.onUpdate(()=>{
            let posX = 50 * 39 + 500;
            let posY = 18 * 39 - 200;
            if (kirb.pos.x < level2Layout.pos.x + 50 * 39) {
                posX = kirb.pos.x + 500;
            }
            if (kirb.pos.y > level2Layout.pos.y + 18 * 39) {
                posY = kirb.pos.y - 200;
            }
            console.log(posY);
            k.camPos(posX, posY); 
        });

        // enemies
        for (const flame of level2SpawnPoints.flame){
            makeFlameEnemy(k, flame.x, flame.y); 
        }
        for (const guy of level2SpawnPoints.guy){
            makeGuyEnemy(k, guy.x, guy.y); 
        }
        for (const bird of level2SpawnPoints.bird){
            const possibleSpeeds = [100, 150, 200, 250, 300];
            k.loop(10, () => {
                makeBirdEnemy(k, 
                    bird.x, 
                    bird.y,
                    possibleSpeeds[Math.floor(Math.random() * possibleSpeeds.length)] // get random element in array
                ); 
            });
        }

    });

    // change to level 1
    k.go("level-2");

};

gameSetup();