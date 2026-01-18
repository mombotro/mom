// Main initialization and game loop
const GAME_CONFIG = {
    initialChickenCount: 20
};

// Global state
window.chickens = [];
window.eggs = [];
window.feedSystem = null;

// Single shared game loop for all entities
let lastTime = 0;

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    // Update all chickens
    window.chickens.forEach(chicken => {
        chicken.updateAnimation(deltaTime);
        chicken.updateSitting(deltaTime);
        chicken.wander(deltaTime);
    });

    requestAnimationFrame(gameLoop);
}

// Initialize the farm
function init() {
    // Load telegram feed
    loadTelegramFeed();

    // Create feed system
    window.feedSystem = new FeedSystem();

    // Create initial chickens
    for (let i = 0; i < GAME_CONFIG.initialChickenCount; i++) {
        window.chickens.push(new Chicken(i));
    }

    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);
