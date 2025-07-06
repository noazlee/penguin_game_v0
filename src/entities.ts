import type { GameObj, KaboomCtx } from "kaboom";
import { scale } from "./constants";

export function makePlayer(k: KaboomCtx, posX: number, posY: number) {

    const player = k.make([                                     // kaboom game object
        k.sprite("assets", { anim: "kirbIdle" }),
        k.area({ shape: new k.Rect(k.vec2(4,5.9), 8, 10) }),    // hitbox
        k.body(),                                               // collider with others + gravity
        k.pos(posX * scale, posY * scale),
        k.scale(scale),
        k.doubleJump(10),                                       // allow 10 jumps
        k.health(3),                                            // health points
        k.opacity(1),                                           // fully visible - reduce to 0 when hit
        {                                                       // properties accessible from game object
            speed: 300,
            direction: "right",
            isInhaling: false,
            isFull: false,
        },
        "player",                                               // tag
    ]);

    // player collision logic
    player.onCollide("enemy", async (enemy : GameObj) => {
        if (player.isInhaling && enemy.isInhalable) { 
            player.isInhaling = false;
            k.destroy(enemy);           // player swallowed enemy
            player.isFull = true;
            return;
        }

        player.hurt();                  // 1 by default

        // player hurt animation - blinking effect
        await k.tween(                  // gradually change val from one to another
            player.opacity,
            0,
            0.05,                       // 1 -> 0 in 0.05 seconds
            (val) => (player.opacity = val),
            k.easings.linear
        );
        await k.tween(
            player.opacity,
            1,
            0.05,
            (val) => (player.opacity = val),
            k.easings.linear
        )

        // player is dead
        if (player.hp() <= 0) {         
            k.destroy(player);
            k.go("level-1");            // CHANGE LATER!
            return;
        }

    });

    // finish level logic
    player.onCollide("exit", () => {
        k.go("level-2");
    });

    // inhaling animation - game object -> animation is always playing, tweak when it is visible 
    const inhaleEffect = k.add([
        k.sprite("assets", {anim: "kirbInhaleEffect"}),
        k.pos(),
        k.scale(scale),
        k.opacity(0),
        "inhaleEffect",
    ]);

    // inhaling hitbox - not visible
    const inhaleZone = player.add([
        k.area({ shape: new k.Rect(k.vec2(0), 20, 4) }),
        k.pos(),        // empty - depends on directions / position of player
        "inhaleZone",
    ]);

    // updating inhale zone
    inhaleZone.onUpdate(()=>{                   // onUpdate() gameobject method - runs every frame while obj exists
        if (player.direction === "left"){
            inhaleZone.pos = k.vec2(-14, 8);    // relative to player as it is a child object
            inhaleEffect.pos = k.vec2(player.pos.x - 60, player.pos.y + 0); // inhale effect not a child because you can not reduce opacity of child without parent for some reason
            inhaleEffect.flipX = true;          // flip animation
            return;
        } // looking right
        inhaleZone.pos = k.vec2(14, 8);
        inhaleEffect.pos = k.vec2(player.pos.x + 60, player.pos.y + 0);
        inhaleEffect.flipX = false;
    });

    player.onUpdate(()=>{
        if (player.pos.y > 2000){   // Falls off edge - dead
            k.go("level-1");        // CHANGE LATER!
        }
    });

    return player; 

}