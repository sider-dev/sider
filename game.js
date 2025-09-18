// SIDER RUNNER - Secret Game Implementation
// High-quality endless runner with power-ups, achievements, and retro aesthetics

class SiderRunnerGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.isActive = false;
        this.isPaused = false;
        this.gameLoop = null;
        
        // Game state
        this.score = 0;
        this.level = 1;
        this.coins = 0;
        this.highScore = parseInt(localStorage.getItem('siderRunnerHighScore') || '0');
        
        // Player properties
        this.player = {
            x: 100,
            y: 300,
            width: 30,
            height: 40,
            dy: 0,
            grounded: true,
            sliding: false,
            invulnerable: false,
            invulnerabilityTime: 0
        };
        
        // Game world
        this.groundY = 350;
        this.gameSpeed = 3;
        this.baseSpeed = 3;
        this.obstacles = [];
        this.coins = [];
        this.powerUps = [];
        this.particles = [];
        
        // Power-ups
        this.activePowerUps = {
            speed: { active: false, timeLeft: 0 },
            shield: { active: false, timeLeft: 0 },
            coinMagnet: { active: false, timeLeft: 0 }
        };
        
        // Achievements
        this.achievements = {
            firstJump: false,
            score100: false,
            score500: false,
            score1000: false,
            level5: false,
            level10: false,
            coins50: false,
            coins100: false,
            perfectRun: false,
            speedDemon: false
        };
        
        this.loadAchievements();
        this.setupControls();
        this.setupCanvas();
        
        // Update high score display
        document.getElementById('game-high-score').textContent = this.highScore;
    }
    
    setupCanvas() {
        // Set canvas size
        this.canvas.width = 800;
        this.canvas.height = 400;
        this.groundY = this.canvas.height - 50;
        this.player.y = this.groundY - this.player.height;
        
        // Enable pixel-perfect rendering
        this.ctx.imageSmoothingEnabled = false;
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;
            
            switch(e.code) {
                case 'Space':
                case 'ArrowUp':
                    e.preventDefault();
                    this.jump();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.slide();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.togglePause();
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (!this.isActive) return;
            
            if (e.code === 'ArrowDown') {
                this.stopSlide();
            }
        });
        
        // Touch controls for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const y = touch.clientY - rect.top;
            
            if (y < this.canvas.height / 2) {
                this.jump();
            } else {
                this.slide();
            }
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopSlide();
        });
        
        // Game UI controls
        document.getElementById('close-game').addEventListener('click', () => this.closeGame());
        document.getElementById('restart-game').addEventListener('click', () => this.restart());
        document.getElementById('close-modal').addEventListener('click', () => this.closeGame());
        document.getElementById('resume-game').addEventListener('click', () => this.resume());
        document.getElementById('quit-game').addEventListener('click', () => this.closeGame());
    }
    
    jump() {
        if (this.player.grounded && !this.player.sliding) {
            this.player.dy = -12;
            this.player.grounded = false;
            
            if (!this.achievements.firstJump) {
                this.achievements.firstJump = true;
                this.showAchievement('First Jump!', 'Take to the skies!');
            }
            
            this.createParticles(this.player.x, this.player.y + this.player.height, 5, '#00d4aa');
        }
    }
    
    slide() {
        if (this.player.grounded) {
            this.player.sliding = true;
            this.player.height = 20;
            this.player.y = this.groundY - this.player.height;
        }
    }
    
    stopSlide() {
        if (this.player.sliding) {
            this.player.sliding = false;
            this.player.height = 40;
            this.player.y = this.groundY - this.player.height;
        }
    }
    
    start() {
        this.isActive = true;
        this.isPaused = false;
        this.resetGame();
        this.gameLoop = requestAnimationFrame(() => this.update());
        document.getElementById('secret-game').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
    
    resetGame() {
        this.score = 0;
        this.level = 1;
        this.coins = 0;
        this.gameSpeed = this.baseSpeed;
        this.obstacles = [];
        this.coins = [];
        this.powerUps = [];
        this.particles = [];
        
        this.player.x = 100;
        this.player.y = this.groundY - this.player.height;
        this.player.dy = 0;
        this.player.grounded = true;
        this.player.sliding = false;
        this.player.invulnerable = false;
        this.player.invulnerabilityTime = 0;
        
        Object.keys(this.activePowerUps).forEach(key => {
            this.activePowerUps[key].active = false;
            this.activePowerUps[key].timeLeft = 0;
        });
        
        this.updateUI();
    }
    
    update() {
        if (!this.isActive || this.isPaused) {
            return;
        }
        
        this.updatePlayer();
        this.updateObstacles();
        this.updateCoins();
        this.updatePowerUps();
        this.updatePowerUpEffects();
        this.updateParticles();
        this.checkCollisions();
        this.spawnObjects();
        this.updateLevel();
        this.render();
        
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    
    updatePlayer() {
        // Gravity
        if (!this.player.grounded) {
            this.player.dy += 0.6;
            this.player.y += this.player.dy;
        }
        
        // Ground collision
        if (this.player.y >= this.groundY - this.player.height) {
            this.player.y = this.groundY - this.player.height;
            this.player.grounded = true;
            this.player.dy = 0;
        }
        
        // Update invulnerability
        if (this.player.invulnerable) {
            this.player.invulnerabilityTime -= 16;
            if (this.player.invulnerabilityTime <= 0) {
                this.player.invulnerable = false;
            }
        }
        
        this.score += Math.floor(this.gameSpeed / 3);
        this.updateUI();
    }
    
    updateObstacles() {
        this.obstacles = this.obstacles.filter(obstacle => {
            obstacle.x -= this.gameSpeed;
            return obstacle.x > -obstacle.width;
        });
    }
    
    updateCoins() {
        this.coins = this.coins.filter(coin => {
            coin.x -= this.gameSpeed;
            coin.rotation += 0.1;
            
            // Coin magnet effect
            if (this.activePowerUps.coinMagnet.active) {
                const dx = this.player.x + this.player.width/2 - coin.x;
                const dy = this.player.y + this.player.height/2 - coin.y;
                const distance = Math.sqrt(dx*dx + dy*dy);
                
                if (distance < 100) {
                    const magnetForce = 0.3;
                    coin.x += dx * magnetForce;
                    coin.y += dy * magnetForce;
                }
            }
            
            return coin.x > -20;
        });
    }
    
    updatePowerUps() {
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.x -= this.gameSpeed;
            powerUp.pulse += 0.1;
            return powerUp.x > -30;
        });
    }
    
    updatePowerUpEffects() {
        Object.keys(this.activePowerUps).forEach(key => {
            if (this.activePowerUps[key].active) {
                this.activePowerUps[key].timeLeft -= 16;
                if (this.activePowerUps[key].timeLeft <= 0) {
                    this.activePowerUps[key].active = false;
                    if (key === 'speed') {
                        this.gameSpeed = this.baseSpeed + Math.floor(this.level / 5);
                    }
                }
            }
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.2;
            particle.life--;
            particle.alpha = particle.life / particle.maxLife;
            return particle.life > 0;
        });
    }
    
    checkCollisions() {
        const playerRect = {
            x: this.player.x,
            y: this.player.y,
            width: this.player.width,
            height: this.player.height
        };
        
        // Obstacle collisions
        this.obstacles.forEach(obstacle => {
            if (this.rectCollision(playerRect, obstacle) && !this.player.invulnerable && !this.activePowerUps.shield.active) {
                this.gameOver();
            }
        });
        
        // Coin collisions
        this.coins = this.coins.filter(coin => {
            if (this.rectCollision(playerRect, { x: coin.x-10, y: coin.y-10, width: 20, height: 20 })) {
                this.collectCoin();
                this.createParticles(coin.x, coin.y, 8, '#ffeb3b');
                return false;
            }
            return true;
        });
        
        // Power-up collisions
        this.powerUps = this.powerUps.filter(powerUp => {
            if (this.rectCollision(playerRect, { x: powerUp.x-15, y: powerUp.y-15, width: 30, height: 30 })) {
                this.activatePowerUp(powerUp.type);
                this.createParticles(powerUp.x, powerUp.y, 10, powerUp.color);
                return false;
            }
            return true;
        });
    }
    
    rectCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    collectCoin() {
        this.coins++;
        this.score += 50;
        
        // Check coin achievements
        if (this.coins >= 50 && !this.achievements.coins50) {
            this.achievements.coins50 = true;
            this.showAchievement('Coin Collector', 'Collected 50 coins!');
        }
        if (this.coins >= 100 && !this.achievements.coins100) {
            this.achievements.coins100 = true;
            this.showAchievement('Coin Master', 'Collected 100 coins!');
        }
    }
    
    activatePowerUp(type) {
        switch(type) {
            case 'speed':
                this.activePowerUps.speed.active = true;
                this.activePowerUps.speed.timeLeft = 3000;
                this.gameSpeed = this.baseSpeed * 1.5;
                break;
            case 'shield':
                this.activePowerUps.shield.active = true;
                this.activePowerUps.shield.timeLeft = 5000;
                break;
            case 'coinMagnet':
                this.activePowerUps.coinMagnet.active = true;
                this.activePowerUps.coinMagnet.timeLeft = 4000;
                break;
        }
        this.score += 25;
    }
    
    spawnObjects() {
        // Spawn obstacles
        if (Math.random() < 0.005 + this.level * 0.001) {
            this.obstacles.push({
                x: this.canvas.width,
                y: this.groundY - 40,
                width: 30,
                height: 40,
                type: Math.random() < 0.7 ? 'block' : 'spike'
            });
        }
        
        // Spawn coins
        if (Math.random() < 0.008) {
            this.coins.push({
                x: this.canvas.width,
                y: this.groundY - 60 - Math.random() * 100,
                rotation: 0
            });
        }
        
        // Spawn power-ups
        if (Math.random() < 0.002) {
            const types = ['speed', 'shield', 'coinMagnet'];
            const colors = ['#ffeb3b', '#2196f3', '#ffc107'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            this.powerUps.push({
                x: this.canvas.width,
                y: this.groundY - 80 - Math.random() * 80,
                type: type,
                color: colors[types.indexOf(type)],
                pulse: 0
            });
        }
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.score / 500) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.baseSpeed += 0.5;
            this.gameSpeed = this.baseSpeed + (this.activePowerUps.speed.active ? this.baseSpeed * 0.5 : 0);
            
            // Level achievements
            if (this.level >= 5 && !this.achievements.level5) {
                this.achievements.level5 = true;
                this.showAchievement('Level 5', 'Halfway to greatness!');
            }
            if (this.level >= 10 && !this.achievements.level10) {
                this.achievements.level10 = true;
                this.showAchievement('Level 10', 'Double digits!');
            }
        }
    }
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 30 + Math.random() * 20,
                maxLife: 50,
                color: color,
                alpha: 1
            });
        }
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background grid
        this.drawBackground();
        
        // Draw ground
        this.ctx.fillStyle = '#00d4aa';
        this.ctx.fillRect(0, this.groundY, this.canvas.width, 2);
        
        // Draw player
        this.drawPlayer();
        
        // Draw obstacles
        this.obstacles.forEach(obstacle => this.drawObstacle(obstacle));
        
        // Draw coins
        this.coins.forEach(coin => this.drawCoin(coin));
        
        // Draw power-ups
        this.powerUps.forEach(powerUp => this.drawPowerUp(powerUp));
        
        // Draw particles
        this.particles.forEach(particle => this.drawParticle(particle));
        
        // Draw power-up effects
        this.drawPowerUpEffects();
    }
    
    drawBackground() {
        // Draw retro grid background
        this.ctx.strokeStyle = 'rgba(0, 212, 170, 0.1)';
        this.ctx.lineWidth = 1;
        
        const gridSize = 40;
        const offsetX = (this.score * 0.5) % gridSize;
        
        for (let x = -offsetX; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    drawPlayer() {
        const alpha = this.player.invulnerable ? 0.5 + 0.5 * Math.sin(Date.now() * 0.02) : 1;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        
        // Player body (rectangle with rounded corners)
        this.ctx.fillStyle = this.activePowerUps.shield.active ? '#2196f3' : '#ff6b35';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // Player eyes
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.player.x + 8, this.player.y + 8, 4, 4);
        this.ctx.fillRect(this.player.x + 18, this.player.y + 8, 4, 4);
        
        // Shield effect
        if (this.activePowerUps.shield.active) {
            this.ctx.strokeStyle = '#2196f3';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(
                this.player.x + this.player.width/2,
                this.player.y + this.player.height/2,
                30 + 5 * Math.sin(Date.now() * 0.01),
                0,
                Math.PI * 2
            );
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    drawObstacle(obstacle) {
        if (obstacle.type === 'spike') {
            // Draw spike
            this.ctx.fillStyle = '#ff4757';
            this.ctx.beginPath();
            this.ctx.moveTo(obstacle.x + obstacle.width/2, obstacle.y);
            this.ctx.lineTo(obstacle.x, obstacle.y + obstacle.height);
            this.ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height);
            this.ctx.fill();
        } else {
            // Draw block
            this.ctx.fillStyle = '#ff4757';
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Block highlight
            this.ctx.fillStyle = '#ff6b7a';
            this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, 4);
        }
    }
    
    drawCoin(coin) {
        this.ctx.save();
        this.ctx.translate(coin.x, coin.y);
        this.ctx.rotate(coin.rotation);
        
        // Coin body
        this.ctx.fillStyle = '#ffeb3b';
        this.ctx.fillRect(-8, -8, 16, 16);
        
        // Coin shine
        this.ctx.fillStyle = '#fff59d';
        this.ctx.fillRect(-6, -6, 4, 12);
        
        // Coin symbol ($)
        this.ctx.fillStyle = '#f57f17';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('$', 0, 4);
        
        this.ctx.restore();
    }
    
    drawPowerUp(powerUp) {
        const size = 15 + 3 * Math.sin(powerUp.pulse);
        
        this.ctx.save();
        this.ctx.globalAlpha = 0.8 + 0.2 * Math.sin(powerUp.pulse);
        
        // Power-up glow
        this.ctx.fillStyle = powerUp.color;
        this.ctx.shadowColor = powerUp.color;
        this.ctx.shadowBlur = 20;
        this.ctx.fillRect(powerUp.x - size/2, powerUp.y - size/2, size, size);
        
        // Power-up symbol
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        
        const symbols = { speed: '⚡', shield: '🛡', coinMagnet: '🧲' };
        this.ctx.fillText(symbols[powerUp.type] || '?', powerUp.x, powerUp.y + 4);
        
        this.ctx.restore();
    }
    
    drawParticle(particle) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.alpha;
        this.ctx.fillStyle = particle.color;
        this.ctx.fillRect(particle.x-1, particle.y-1, 2, 2);
        this.ctx.restore();
    }
    
    drawPowerUpEffects() {
        // Speed effect
        if (this.activePowerUps.speed.active) {
            this.ctx.save();
            this.ctx.strokeStyle = '#ffeb3b';
            this.ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.player.x - 20 - i * 10, this.player.y + i * 8);
                this.ctx.lineTo(this.player.x - 10 - i * 10, this.player.y + i * 8);
                this.ctx.stroke();
            }
            this.ctx.restore();
        }
    }
    
    gameOver() {
        this.isActive = false;
        cancelAnimationFrame(this.gameLoop);
        
        // Update high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('siderRunnerHighScore', this.highScore.toString());
        }
        
        // Check score achievements
        this.checkScoreAchievements();
        
        // Show game over modal
        this.showGameOverModal();
        
        // Save achievements
        this.saveAchievements();
    }
    
    checkScoreAchievements() {
        if (this.score >= 100 && !this.achievements.score100) {
            this.achievements.score100 = true;
            this.showAchievement('Century!', 'Scored 100 points!');
        }
        if (this.score >= 500 && !this.achievements.score500) {
            this.achievements.score500 = true;
            this.showAchievement('High Scorer', '500 points achieved!');
        }
        if (this.score >= 1000 && !this.achievements.score1000) {
            this.achievements.score1000 = true;
            this.showAchievement('Score Master', '1000+ points!');
        }
    }
    
    showAchievement(title, description) {
        // Create achievement notification
        const achievement = document.createElement('div');
        achievement.className = 'achievement';
        achievement.innerHTML = `<strong>${title}</strong><br>${description}`;
        
        const achievementsList = document.getElementById('achievements-list');
        achievementsList.appendChild(achievement);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (achievement.parentNode) {
                achievement.parentNode.removeChild(achievement);
            }
        }, 3000);
    }
    
    showGameOverModal() {
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('final-level').textContent = this.level;
        document.getElementById('final-coins').textContent = this.coins;
        document.getElementById('game-over-modal').style.display = 'flex';
    }
    
    togglePause() {
        if (this.isPaused) {
            this.resume();
        } else {
            this.pause();
        }
    }
    
    pause() {
        this.isPaused = true;
        document.getElementById('pause-modal').style.display = 'flex';
        cancelAnimationFrame(this.gameLoop);
    }
    
    resume() {
        this.isPaused = false;
        document.getElementById('pause-modal').style.display = 'none';
        this.gameLoop = requestAnimationFrame(() => this.update());
    }
    
    restart() {
        document.getElementById('game-over-modal').style.display = 'none';
        document.getElementById('achievements-list').innerHTML = '';
        this.start();
    }
    
    closeGame() {
        this.isActive = false;
        this.isPaused = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        document.getElementById('secret-game').style.display = 'none';
        document.getElementById('game-over-modal').style.display = 'none';
        document.getElementById('pause-modal').style.display = 'none';
        document.body.style.overflow = '';
    }
    
    updateUI() {
        document.getElementById('game-score').textContent = this.score;
        document.getElementById('game-level').textContent = this.level;
        document.getElementById('game-high-score').textContent = this.highScore;
    }
    
    saveAchievements() {
        localStorage.setItem('siderRunnerAchievements', JSON.stringify(this.achievements));
    }
    
    loadAchievements() {
        const saved = localStorage.getItem('siderRunnerAchievements');
        if (saved) {
            this.achievements = { ...this.achievements, ...JSON.parse(saved) };
        }
    }
}

// Secret activation system
class SecretActivator {
    constructor() {
        this.sequence = [];
        this.secretCode = ['s', 'i', 'd', 'e', 'r']; // Type "SIDER" to activate
        this.timeoutId = null;
        this.game = new SiderRunnerGame();
        
        this.setupSecretListener();
    }
    
    setupSecretListener() {
        document.addEventListener('keydown', (e) => {
            // Only listen for secret when game is not active
            if (this.game.isActive) return;
            
            const key = e.key.toLowerCase();
            this.sequence.push(key);
            
            // Keep only last 5 keys
            if (this.sequence.length > this.secretCode.length) {
                this.sequence.shift();
            }
            
            // Check if sequence matches
            if (this.sequence.length === this.secretCode.length) {
                if (this.sequence.join('') === this.secretCode.join('')) {
                    this.activateGame();
                }
            }
            
            // Clear sequence after 2 seconds of inactivity
            clearTimeout(this.timeoutId);
            this.timeoutId = setTimeout(() => {
                this.sequence = [];
            }, 2000);
        });
        
        // Easter egg: Konami code alternative activation
        let konamiSequence = [];
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
        
        document.addEventListener('keydown', (e) => {
            if (this.game.isActive) return;
            
            if (konamiCode.includes(e.code)) {
                konamiSequence.push(e.code);
                if (konamiSequence.length > konamiCode.length) {
                    konamiSequence.shift();
                }
                
                if (konamiSequence.length === konamiCode.length && 
                    konamiSequence.join(',') === konamiCode.join(',')) {
                    this.activateGame();
                    konamiSequence = [];
                }
            } else {
                konamiSequence = [];
            }
        });
    }
    
    activateGame() {
        // Visual feedback
        document.body.style.animation = 'flash 0.1s';
        
        // Add flash animation if not exists
        if (!document.querySelector('#flash-style')) {
            const style = document.createElement('style');
            style.id = 'flash-style';
            style.textContent = `
                @keyframes flash {
                    0%, 100% { background-color: var(--background-color); }
                    50% { background-color: #00d4aa; }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            document.body.style.animation = '';
            this.game.start();
        }, 200);
        
        console.log('Secret game activated!');
    }
}

// Initialize secret game system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure main script is loaded
    setTimeout(() => {
        new SecretActivator();
        console.log('🎮 Secret game system initialized. Try typing "SIDER" or the Konami code!');
    }, 1000);
});