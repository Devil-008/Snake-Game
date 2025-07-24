// Game constants
const GRID_SIZE = 20; // Size of each grid cell in pixels
const GRID_WIDTH = 20; // Number of cells horizontally
const GRID_HEIGHT = 20; // Number of cells vertically
const GAME_SPEED = 150; // Initial game speed in milliseconds

// Game variables
let canvas;
let ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameRunning = false;
let gameLoop;
let score = 0;

// DOM elements
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const scoreDisplay = document.getElementById('score');
const upBtn = document.getElementById('up-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');
const downBtn = document.getElementById('down-btn');

// Initialize the game when the window loads
window.onload = function() {
    canvas = document.getElementById('game-board');
    ctx = canvas.getContext('2d');
    
    // Add event listeners
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    document.addEventListener('keydown', handleKeyPress);
    
    // Add touch control event listeners
    if (upBtn) upBtn.addEventListener('click', () => handleDirectionChange('up'));
    if (leftBtn) leftBtn.addEventListener('click', () => handleDirectionChange('left'));
    if (rightBtn) rightBtn.addEventListener('click', () => handleDirectionChange('right'));
    if (downBtn) downBtn.addEventListener('click', () => handleDirectionChange('down'));
    
    // Initial setup
    resetGame();
    drawGame();
};

// Start the game
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        startBtn.textContent = 'Pause';
        gameLoop = setInterval(updateGame, GAME_SPEED);
    } else {
        gameRunning = false;
        startBtn.textContent = 'Resume';
        clearInterval(gameLoop);
    }
}

// Reset the game to initial state
function resetGame() {
    // Clear any existing game loop
    clearInterval(gameLoop);
    
    // Reset game state
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    scoreDisplay.textContent = score;
    gameRunning = false;
    startBtn.textContent = 'Start Game';
    
    // Generate initial food
    generateFood();
    
    // Draw the initial state
    drawGame();
}

// Generate food at a random position
function generateFood() {
    // Generate random coordinates for food
    let foodX, foodY;
    let validPosition = false;
    
    while (!validPosition) {
        foodX = Math.floor(Math.random() * GRID_WIDTH);
        foodY = Math.floor(Math.random() * GRID_HEIGHT);
        
        // Check if the position overlaps with the snake
        validPosition = true;
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === foodX && snake[i].y === foodY) {
                validPosition = false;
                break;
            }
        }
    }
    
    food = {
        x: foodX,
        y: foodY
    };
}

// Handle keyboard input
function handleKeyPress(event) {
    const key = event.key;
    
    // Update direction based on key press
    // Prevent 180-degree turns
    if (key === 'ArrowUp' && direction !== 'down') {
        nextDirection = 'up';
    } else if (key === 'ArrowDown' && direction !== 'up') {
        nextDirection = 'down';
    } else if (key === 'ArrowLeft' && direction !== 'right') {
        nextDirection = 'left';
    } else if (key === 'ArrowRight' && direction !== 'left') {
        nextDirection = 'right';
    }
}

// Handle direction change from touch controls
function handleDirectionChange(newDirection) {
    // Prevent 180-degree turns
    if (newDirection === 'up' && direction !== 'down') {
        nextDirection = 'up';
    } else if (newDirection === 'down' && direction !== 'up') {
        nextDirection = 'down';
    } else if (newDirection === 'left' && direction !== 'right') {
        nextDirection = 'left';
    } else if (newDirection === 'right' && direction !== 'left') {
        nextDirection = 'right';
    }
}

// Update game state
function updateGame() {
    // Update direction
    direction = nextDirection;
    
    // Calculate new head position
    const head = {x: snake[0].x, y: snake[0].y};
    
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // Check for collisions
    if (checkCollision(head)) {
        gameOver();
        return;
    }
    
    // Add new head to the snake
    snake.unshift(head);
    
    // Check if snake ate food
    if (head.x === food.x && head.y === food.y) {
        // Increase score
        score += 10;
        scoreDisplay.textContent = score;
        
        // Generate new food
        generateFood();
        
        // Speed up the game slightly
        if (GAME_SPEED > 50) {
            clearInterval(gameLoop);
            gameLoop = setInterval(updateGame, GAME_SPEED - Math.floor(score / 50));
        }
    } else {
        // Remove tail if no food was eaten
        snake.pop();
    }
    
    // Redraw the game
    drawGame();
}

// Check for collisions with walls or self
function checkCollision(head) {
    // Check wall collisions
    if (head.x < 0 || head.x >= GRID_WIDTH || head.y < 0 || head.y >= GRID_HEIGHT) {
        return true;
    }
    
    // Check self collision (except with the tail that's about to move)
    for (let i = 0; i < snake.length - 1; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// Game over
function gameOver() {
    clearInterval(gameLoop);
    gameRunning = false;
    startBtn.textContent = 'Start Game';
    
    // Display game over message
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 15);
    
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 15);
}

// Draw the game
function drawGame() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the snake
    for (let i = 0; i < snake.length; i++) {
        // Different color for head
        if (i === 0) {
            ctx.fillStyle = '#4CAF50'; // Green head
        } else {
            ctx.fillStyle = '#388E3C'; // Darker green body
        }
        
        ctx.fillRect(
            snake[i].x * GRID_SIZE,
            snake[i].y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );
        
        // Add a border to each segment
        ctx.strokeStyle = '#2E7D32';
        ctx.strokeRect(
            snake[i].x * GRID_SIZE,
            snake[i].y * GRID_SIZE,
            GRID_SIZE,
            GRID_SIZE
        );
    }
    
    // Draw the food
    ctx.fillStyle = '#F44336'; // Red food
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Draw grid lines (optional)
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for (let x = 0; x <= canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y <= canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}