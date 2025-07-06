# Penguin Game - Web App

This is a web application for penguin game - a 2D action, online, multiplayer game where players enter a four player free-for-all game with each round consisting of players picking up guns and weapons and trying to kill each other. Players need to win a certain amount of rounds (e.g. 10), to win the game. Each round has a different map, and different weapons available to the player.

A user should be able to:
- Create a lobby (with up to 4 players and customizable rules (e.g. number of games to win, maps))
- Join a lobby (using a code)
- Customize their character's appearance (we can just do color for now)

This would be similar to the game Duck Game - for your reference.

## Tech Stack
**Frontend:**
- Phaser.js for 2D game rendering and physics
- React for lobby/menu UI
- Socket.io-client for real-time multiplayer
- TypeScript for type safety

**Backend:**
- Node.js with Express
- Socket.io for WebSocket communication
- PostgreSQL for user data and game stats
- Redis for lobby/session management
- TypeScript

## Project Structure
```
penguin_game_v0/
├── client/          # React + Phaser frontend
├── server/          # Node.js backend
├── shared/          # Shared types/constants
└── docker-compose.yml
```

## Implementation Steps
1. Set up basic project structure with TypeScript
2. Create Express server with Socket.io
3. Build PostgreSQL database with user authentication (signup/login)
4. Build lobby system (create/join with codes)
5. Implement basic Phaser game scene
6. Add player movement and networking
7. Implement weapons and shooting mechanics
8. Create multiple maps
9. Add round/match logic
10. Character customization
11. Deploy to Railway or Render

## Initial Deployment
- Start with Railway for simplicity
- Use their PostgreSQL and Redis add-ons
- Deploy as monorepo or separate services
- Add CDN later for assets
