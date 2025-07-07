// general global state of the game - when to move on to the next scene, etc.

export const game_state = {
    current_level: 1,
    lives: 3,
}

export function resetGame() {
    game_state.lives = 3;
    game_state.current_level = 1;
}

export function loseLife() {
    game_state.lives -= 1;
    return game_state.lives;
}

export function isGameOver() {
    return game_state.lives === 0;
}

export function getCurrentLevel() {
    return game_state.current_level;
}

export function setCurrentLevel(level: number) {
    game_state.current_level = level;
}