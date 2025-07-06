import type { AreaComp, BodyComp, DoubleJumpComp, GameObj, HealthComp, KaboomCtx, OpacityComp, PosComp, ScaleComp, SpriteComp } from "kaboom";
import { scale } from "./constants";

// game object that has sprite component, area component, etc w properties.
type PlayerGameObj = GameObj< // better practice to create specific type for player for specific behaviours
    SpriteComp & 
    AreaComp & 
    BodyComp & 
    PosComp & 
    ScaleComp &
    DoubleJumpComp &
    HealthComp & 
    OpacityComp & {
        speed: number;
        direction: string;
        isInhaling: boolean;
        isFull: boolean;
    }
>;

export function makePlayer(k: KaboomCtx, posX: number, posY: number) {

    const player = k.make([                                     // kaboom game object
        k.sprite("assets", { anim: "kirbIdle" }),
        k.color(173, 216, 230),
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
        if (player.pos.y > 1200){   // Falls off edge - dead
            k.go("level-1");        // CHANGE LATER!
        }
    });

    return player; 

}

export function setControls(k: KaboomCtx, player: PlayerGameObj) {
    const inhaleEffectRef = k.get("inhaleEffect")[0]; // return array of gameobjects with this tag -> get index 0
    
    // key movements
    k.onKeyDown((key) => {
         switch (key) {
            case "left":
                player.direction = "left";
                player.flipX = true;
                player.move(-player.speed, 0);
                break;
            case "right":
                player.direction = "right";
                player.flipX = false;
                player.move(player.speed, 0);
                break;
            case "f":
                if (player.isFull){
                    player.play("kirbFull");
                    inhaleEffectRef.opacity = 0;
                    break;
                }
                player.isInhaling = true;
                player.play("kirbInhaling");
                inhaleEffectRef.opacity = 1;
                break;
            default:
         }
    });

    // jumping
    k.onKeyPress((key) => {
        switch (key) {
            case "space":
                player.doubleJump();
                break;
            default:
        }
    });

    // stop inhaling / shooting star - let go of 'f'
    k.onKeyRelease((key) => {
        if (key === "f") {
            if (player.isFull) {
                player.play("kirbInhaling");
                const shootingStar = k.add([    // try to make the implement copy abilities
                    k.sprite("assets", {
                        anim: "shootingStar",
                        flipX: player.direction === "right",
                    }),
                    k.area({shape: new k.Rect(k.vec2(5,4), 6, 6)}),
                    k.pos(
                        player.direction === "left" ? player.pos.x - 80 : player.pos.x + 80,
                        player.pos.y + 5
                    ),
                    k.scale(scale),
                    player.direction === "left" 
                        ? k.move(k.LEFT, 800)   // star shoots left
                        : k.move(k.RIGHT, 800),
                    "shootingStar",
                ]);

                shootingStar.onCollide("platform", () => k.destroy(shootingStar));

                player.isFull = false;
                k.wait(0.2, () => player.play("kirbIdle"));   // wait 1 sec
                return;
            }
            inhaleEffectRef.opacity = 0; 
            player.isInhaling = false;
            player.play("kirbIdle");
        }
    });
}

export function makeInhalable(k: KaboomCtx, enemy: GameObj) {
    enemy.onCollide("inhaleZone", () => {
        enemy.isInhalable = true;
    });

    enemy.onCollideEnd("inhaleZone", () => {
        enemy.isInhalable = false;
    });

    enemy.onCollide("shootingStar", (shootingStar: GameObj) => {
        k.destroy(enemy);
        k.destroy(shootingStar);
    });

    const playerRef = k.get("player")[0];
    enemy.onUpdate(() => {
        if (playerRef.isInhaling && enemy.isInhalable) {
            if (playerRef.direction === "right"){
                enemy.move(-800, 0);
                return;
            }
            enemy.move(800,0);
        }
    });
}

export function makeFlameEnemy(k: KaboomCtx, posX: number, posY: number) {
    const flame = k.add([
        k.sprite("assets", {anim: "flame"}),
        k.scale(scale),
        k.pos(posX * scale, posY * scale),
        k.area({
            shape: new k.Rect(k.vec2(4, 6), 8, 10),
            collisionIgnore: ["enemy"],
        }),
        k.body(),
        { isInhalable: false },
        k.state("idle", ["idle", "jump"]),  // state machine: default state, [list of all possible states]
        "enemy",
    ]);

    makeInhalable(k, flame);

    // defining states
    flame.onStateEnter("idle", async () => {
        await k.wait(1.5);
        flame.enterState("jump");
    });

    flame.onStateEnter("jump", async () => {
        flame.jump(1000);
    });

    flame.onStateUpdate("jump", async () => {
        if (flame.isGrounded()){
            flame.enterState("idle");
        }
    });

    return flame;
}

export function makeGuyEnemy(k: KaboomCtx, posX: number, posY: number){
    const guy = k.add([
        k.sprite("assets", { anim: "guyWalk" }),
        k.scale(scale),
        k.pos(posX * scale, posY * scale),
        k.area({
            shape: new k.Rect(k.vec2(2, 3.9), 12, 12),
            collisionIgnore: ["enemy"],
        }),
        k.body(),
        k.state("idle", ["idle", "left", "right", "jump"]), // jump not implemented
        { isInhalable: false, speed: 100 },
        "enemy",
    ]);

    makeInhalable(k, guy);

    // define states
    guy.onStateEnter("idle", async () => {
        await k.wait(Math.max((Math.random() * 1), 0.5));
        guy.enterState("left");
    });

    guy.onStateEnter("left", async () => {
        guy.flipX = false;
        await k.wait(Math.max((Math.random() * 2), 0.8));
        guy.enterState("right");
    });

    guy.onStateUpdate("left", () => {
        guy.move(-guy.speed, 0);
    });

    guy.onStateEnter("right", async () => {
        guy.flipX = true;
        await k.wait(Math.max((Math.random() * 2), 0.8));
        guy.enterState("left");
    });

    guy.onStateUpdate("right", () => {
        guy.move(guy.speed, 0);
    });

    return guy;

}

export function makeBirdEnemy(k: KaboomCtx, posX: number, posY: number, speed: number) {    
    const bird = k.add([
        k.sprite("assets", {anim: "bird"}),
        k.scale(scale),
        k.pos(posX * scale, posY * scale),
        k.area({
            shape: new k.Rect(k.vec2(4, 6), 8, 10),
            collisionIgnore: ["enemy"],
        }),
        k.body({ isStatic: true }),         // not effected by gravity
        k.move(k.LEFT, speed),
        k.offscreen({ destroy: true, distance: 400 }),
        "enemy",
    ]);
    
    makeInhalable(k, bird);

    return bird;
}
