import { makePlayer } from "./entities";
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

    const {map: level1Layout, spawnPoints: level1SpawnPoints} = await makeMap(
        k, 
        "level-1"
    ); // renames map and spawnpoints


    k.scene("level-1", () => {
        k.setGravity(2100);
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

        k.add(kirb);

        // camera
        k.camScale(k.vec2(0.7)); // or k.camScale(0.7, 0.7)
        k.onUpdate(()=>{
            if (kirb.pos.x < level1Layout.pos.x + 432) {
                k.camPos(kirb.pos.x + 500, 800);  // camera follows player until certain point - player on left side of screen (+500)
            }
        });

    });

    k.go("level-1");

};

gameSetup();