const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const startBtn = document.getElementById('startBtn');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let apple = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop;
let isPlaying = false;
let gameSpeed = 250;

highScoreElement.textContent = highScore;

function resetGame() {
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    placeApple();
    dx = 1;
    dy = 0;
    score = 0;
    scoreElement.textContent = score;
    gameSpeed = 250;
}

function placeApple() {
    apple = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    // Ensure apple doesn't spawn on snake
    for (let i = 0; i < snake.length; i++) {
        if (snake[i].x === apple.x && snake[i].y === apple.y) {
            placeApple();
            break;
        }
    }
}

function update() {
    // Move snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver();
        return;
    }

    // Check self collision
    for (let i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
            return;
        }
    }

    snake.unshift(head);

    // Check apple collision
    if (head.x === apple.x && head.y === apple.y) {
        score += 10;
        scoreElement.textContent = score;
        if (score > highScore) {
            highScore = score;
            highScoreElement.textContent = highScore;
            localStorage.setItem('snakeHighScore', highScore);
        }
        // Increase speed slightly
        if (gameSpeed > 50) gameSpeed -= 2;
        clearInterval(gameLoop);
        gameLoop = setInterval(gameStep, gameSpeed);

        placeApple();
    } else {
        snake.pop();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#2d3436';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (optional, for kid-friendly look)
    ctx.strokeStyle = '#353b48';
    for (let i = 0; i <= tileCount; i++) {
        ctx.beginPath();
        ctx.moveTo(i * gridSize, 0);
        ctx.lineTo(i * gridSize, canvas.height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * gridSize);
        ctx.lineTo(canvas.width, i * gridSize);
        ctx.stroke();
    }

    // Set 3D shadow effect for snake and apple
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;

    // Draw snake
    snake.forEach((segment, index) => {
        // Create 3D gradient for snake body
        let grad = ctx.createLinearGradient(
            segment.x * gridSize, segment.y * gridSize,
            (segment.x + 1) * gridSize, (segment.y + 1) * gridSize
        );

        // Head is a different color gradient
        if (index === 0) {
            grad.addColorStop(0, '#55efc4');
            grad.addColorStop(1, '#00b894');
        } else {
            grad.addColorStop(0, '#00b894');
            grad.addColorStop(1, '#00896f');
        }
        ctx.fillStyle = grad;

        // Draw rounded rectangle for snake parts
        ctx.beginPath();
        ctx.roundRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2, 5);
        ctx.fill();

        // Draw eyes on head
        if (index === 0) {
            // Temporarily disable shadow for eyes
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(segment.x * gridSize + 6, segment.y * gridSize + 6, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(segment.x * gridSize + 14, segment.y * gridSize + 6, 2, 0, Math.PI * 2);
            ctx.fill();

            // Re-enable shadow for next segments/apple
            ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetX = 4;
            ctx.shadowOffsetY = 4;
        }
    });

    // Draw 3D apple with radial gradient
    let appleGrad = ctx.createRadialGradient(
        apple.x * gridSize + gridSize / 3, apple.y * gridSize + gridSize / 3, 2,
        apple.x * gridSize + gridSize / 2, apple.y * gridSize + gridSize / 2, gridSize / 2
    );
    appleGrad.addColorStop(0, '#ff9999');
    appleGrad.addColorStop(1, '#d63031');
    ctx.fillStyle = appleGrad;

    ctx.beginPath();
    ctx.arc(apple.x * gridSize + gridSize / 2, apple.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Apple stem
    ctx.shadowBlur = 0; // Disable shadow for stem
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(apple.x * gridSize + gridSize / 2 - 1, apple.y * gridSize + 2, 2, 4);
}

function gameStep() {
    update();
    draw();
}

function gameOver() {
    clearInterval(gameLoop);
    isPlaying = false;
    startBtn.style.display = 'inline-block';
    startBtn.textContent = 'Game Over! Try Again? 🔄';
    startBtn.style.backgroundColor = '#e74c3c';

    // Draw Game Over text
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 40px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
}

startBtn.addEventListener('click', () => {
    if (!isPlaying) {
        resetGame();
        isPlaying = true;
        startBtn.style.display = 'none';
        gameLoop = setInterval(gameStep, gameSpeed);
    }
});

document.addEventListener('keydown', (e) => {
    // Prevent default scrolling for arrow keys
    if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }

    if (!isPlaying) return;

    if (e.key === 'ArrowUp' && dy !== 1) {
        dx = 0; dy = -1;
    } else if (e.key === 'ArrowDown' && dy !== -1) {
        dx = 0; dy = 1;
    } else if (e.key === 'ArrowLeft' && dx !== 1) {
        dx = -1; dy = 0;
    } else if (e.key === 'ArrowRight' && dx !== -1) {
        dx = 1; dy = 0;
    }
});

// Initial draw
resetGame();
draw();
