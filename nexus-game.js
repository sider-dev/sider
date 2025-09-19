// SIDER NEXUS - High-Quality Roguelike Action Game
// Advanced game engine with procedural generation, meta-progression, and dynamic gameplay

class SiderNexusGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gameState = 'menu'; // menu, playing, paused, gameOver, levelUp
        this.gameLoop = null;
        this.lastTime = 0;
        this.deltaTime = 0;
        
        // Game Statistics
        this.stats = {
            score: 0,
            level: 1,
            wave: 1,
            dataCollected: 0,
            enemiesKilled: 0,
            sessionTime: 0,
            experience: 0,
            experienceToNext: 100
        };
        
        // Player State
        this.player = {
            x: 0,
            y: 0,
            width: 32,
            height: 32,
            health: 100,
            maxHealth: 100,
            energy: 50,
            maxEnergy: 50,
            speed: 200,
            class: 'hacker',
            level: 1,
            experience: 0,
            abilities: [],
            upgrades: [],
            invulnerable: false,
            invulnerabilityTime: 0
        };
        
        // Game World
        this.world = {
            width: 1200,
            height: 800,
            enemies: [],
            projectiles: [],
            items: [],
            particles: [],
            obstacles: [],
            powerUps: []
        };
        
        // Camera
        this.camera = {
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            shake: 0,
            shakeIntensity: 0
        };
        
        // Input System
        this.input = {
            keys: {},
            mouse: { x: 0, y: 0, pressed: false },
            touch: { active: false, x: 0, y: 0 }
        };
        
        // Game Systems
        this.achievementSystem = new AchievementSystem();
        this.upgradeSystem = new UpgradeSystem();
        this.enemySpawner = new EnemySpawner();
        this.audioManager = new AudioManager();
        
        // Persistent Data
        this.persistentData = this.loadPersistentData();
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.setupCanvas();
        this.setupControls();
        this.setupUI();
        this.loadAssets();
        
        console.log('🎮 SIDER NEXUS initialized!');
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('nexus-canvas');
        if (!this.canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Setup canvas for high-quality rendering
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Update world size based on canvas
        this.world.width = Math.max(1200, this.canvas.width * 1.5);
        this.world.height = Math.max(800, this.canvas.height * 1.5);
    }
    
    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.input.keys[e.code] = true;
            this.handleKeyDown(e.code);
        });
        
        document.addEventListener('keyup', (e) => {
            this.input.keys[e.code] = false;
        });
        
        // Mouse controls
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.input.mouse.x = e.clientX - rect.left;
            this.input.mouse.y = e.clientY - rect.top;
        });
        
        this.canvas.addEventListener('mousedown', () => {
            this.input.mouse.pressed = true;
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.input.mouse.pressed = false;
        });
        
        // Touch controls
        this.setupTouchControls();
        this.setupUIControls();
    }
    
    setupTouchControls() {
        const moveButtons = document.querySelectorAll('.move-btn');
        const actionButtons = document.querySelectorAll('.action-btn');
        const abilitySlots = document.querySelectorAll('.ability-slot');
        
        moveButtons.forEach(btn => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleMovement(direction, true);
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                const direction = btn.dataset.direction;
                this.handleMovement(direction, false);
            });
        });
        
        actionButtons.forEach((btn, index) => {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.handleAction(index);
            });
        });
        
        abilitySlots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.useAbility(index + 1);
            });
        });
    }
    
    setupUIControls() {
        // Character selection
        document.querySelectorAll('.character-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.character-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.player.class = card.dataset.class;
                this.updatePlayerStats();
            });
        });
        
        // Menu buttons
        document.getElementById('start-game')?.addEventListener('click', () => this.startGame());
        document.getElementById('close-nexus')?.addEventListener('click', () => this.closeGame());
        document.getElementById('pause-game')?.addEventListener('click', () => this.togglePause());
        document.getElementById('resume-nexus')?.addEventListener('click', () => this.resume());
        document.getElementById('restart-nexus')?.addEventListener('click', () => this.restartGame());
        document.getElementById('back-to-menu')?.addEventListener('click', () => this.backToMenu());
    }
    
    updatePlayerStats() {
        const classes = {
            hacker: { health: 80, energy: 70, speed: 220, abilities: ['code_inject', 'system_hack'] },
            guardian: { health: 150, energy: 40, speed: 180, abilities: ['shield_wall', 'fortress_mode'] },
            explorer: { health: 100, energy: 60, speed: 250, abilities: ['phase_dash', 'network_scan'] }
        };
        
        const classStats = classes[this.player.class] || classes.hacker;
        this.player.maxHealth = classStats.health;
        this.player.health = classStats.health;
        this.player.maxEnergy = classStats.energy;
        this.player.energy = classStats.energy;
        this.player.speed = classStats.speed;
        this.player.abilities = [...classStats.abilities];
    }
    
    startGame() {
        this.gameState = 'playing';
        this.resetGame();
        this.showGameInterface();
        this.startGameLoop();
        
        // Hide menu, show game interface
        document.getElementById('game-menu').style.display = 'none';
        document.getElementById('game-interface').style.display = 'block';
        
        // Show mobile controls if needed
        if (this.isMobile()) {
            document.getElementById('mobile-controls').style.display = 'flex';
        }
    }
    
    resetGame() {
        // Reset stats
        this.stats = {
            score: 0,
            level: 1,
            wave: 1,
            dataCollected: 0,
            enemiesKilled: 0,
            sessionTime: 0,
            experience: 0,
            experienceToNext: 100
        };
        
        // Reset player
        this.updatePlayerStats();
        this.player.x = this.world.width / 2;
        this.player.y = this.world.height / 2;
        this.player.invulnerable = false;
        this.player.invulnerabilityTime = 0;
        
        // Clear world
        this.world.enemies = [];
        this.world.projectiles = [];
        this.world.items = [];
        this.world.particles = [];
        this.world.obstacles = [];
        this.world.powerUps = [];
        
        // Reset camera
        this.camera.x = this.player.x - this.canvas.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2;
        this.camera.shake = 0;
        
        // Generate initial world
        this.generateLevel();
    }
    
    generateLevel() {
        // Procedural level generation
        const obstacleCount = 20 + this.stats.level * 5;
        
        for (let i = 0; i < obstacleCount; i++) {
            this.world.obstacles.push({
                x: Math.random() * (this.world.width - 100) + 50,
                y: Math.random() * (this.world.height - 100) + 50,
                width: 30 + Math.random() * 40,
                height: 30 + Math.random() * 40,
                type: Math.random() < 0.7 ? 'wall' : 'barrier'
            });
        }
        
        // Spawn initial enemies
        this.enemySpawner.spawnWave(this.stats.wave);
    }
    
    startGameLoop() {
        const gameLoop = (currentTime) => {
            if (this.gameState !== 'playing') return;
            
            this.deltaTime = (currentTime - this.lastTime) / 1000;
            this.lastTime = currentTime;
            
            this.update(this.deltaTime);
            this.render();
            
            this.gameLoop = requestAnimationFrame(gameLoop);
        };
        
        this.lastTime = performance.now();
        this.gameLoop = requestAnimationFrame(gameLoop);
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        // Update session time
        this.stats.sessionTime += deltaTime;
        
        // Update player
        this.updatePlayer(deltaTime);
        
        // Update game objects
        this.updateEnemies(deltaTime);
        this.updateProjectiles(deltaTime);
        this.updateParticles(deltaTime);
        this.updatePowerUps(deltaTime);
        
        // Update systems
        this.updateCamera(deltaTime);
        this.checkCollisions();
        this.updateUI();
        
        // Spawn new enemies
        this.enemySpawner.update(deltaTime, this.stats.wave);
        
        // Check for level progression
        this.checkLevelProgression();
    }
    
    updatePlayer(deltaTime) {
        // Handle input
        let moveX = 0;
        let moveY = 0;
        
        if (this.input.keys['KeyW'] || this.input.keys['ArrowUp']) moveY -= 1;
        if (this.input.keys['KeyS'] || this.input.keys['ArrowDown']) moveY += 1;
        if (this.input.keys['KeyA'] || this.input.keys['ArrowLeft']) moveX -= 1;
        if (this.input.keys['KeyD'] || this.input.keys['ArrowRight']) moveX += 1;
        
        // Normalize diagonal movement
        if (moveX !== 0 && moveY !== 0) {
            moveX *= 0.707;
            moveY *= 0.707;
        }
        
        // Apply movement
        const newX = this.player.x + moveX * this.player.speed * deltaTime;
        const newY = this.player.y + moveY * this.player.speed * deltaTime;
        
        // Collision check with world boundaries
        this.player.x = Math.max(this.player.width / 2, Math.min(this.world.width - this.player.width / 2, newX));
        this.player.y = Math.max(this.player.height / 2, Math.min(this.world.height - this.player.height / 2, newY));
        
        // Update invulnerability
        if (this.player.invulnerable) {
            this.player.invulnerabilityTime -= deltaTime * 1000;
            if (this.player.invulnerabilityTime <= 0) {
                this.player.invulnerable = false;
            }
        }
        
        // Regenerate energy
        this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 20 * deltaTime);
        
        // Handle shooting
        if (this.input.mouse.pressed || this.input.keys['Space']) {
            this.shootProjectile();
        }
    }
    
    updateEnemies(deltaTime) {
        this.world.enemies.forEach((enemy, index) => {
            // Simple AI - move towards player
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                enemy.x += (dx / distance) * enemy.speed * deltaTime;
                enemy.y += (dy / distance) * enemy.speed * deltaTime;
            }
            
            // Remove dead enemies
            if (enemy.health <= 0) {
                this.onEnemyKilled(enemy);
                this.world.enemies.splice(index, 1);
            }
        });
    }
    
    updateProjectiles(deltaTime) {
        this.world.projectiles.forEach((projectile, index) => {
            projectile.x += projectile.vx * deltaTime;
            projectile.y += projectile.vy * deltaTime;
            projectile.life -= deltaTime;
            
            // Remove expired projectiles
            if (projectile.life <= 0) {
                this.world.projectiles.splice(index, 1);
            }
        });
    }
    
    updateParticles(deltaTime) {
        this.world.particles.forEach((particle, index) => {
            particle.x += particle.vx * deltaTime;
            particle.y += particle.vy * deltaTime;
            particle.life -= deltaTime;
            particle.alpha = particle.life / particle.maxLife;
            
            // Remove expired particles
            if (particle.life <= 0) {
                this.world.particles.splice(index, 1);
            }
        });
    }
    
    updatePowerUps(deltaTime) {
        this.world.powerUps.forEach((powerUp, index) => {
            powerUp.pulseTime += deltaTime;
            powerUp.y += Math.sin(powerUp.pulseTime * 3) * 20 * deltaTime;
            
            // Check collision with player
            if (this.checkCircleCollision(
                this.player.x, this.player.y, this.player.width / 2,
                powerUp.x, powerUp.y, powerUp.radius
            )) {
                this.collectPowerUp(powerUp);
                this.world.powerUps.splice(index, 1);
            }
        });
    }
    
    updateCamera(deltaTime) {
        // Smooth camera following
        this.camera.targetX = this.player.x - this.canvas.width / 2;
        this.camera.targetY = this.player.y - this.canvas.height / 2;
        
        this.camera.x += (this.camera.targetX - this.camera.x) * 5 * deltaTime;
        this.camera.y += (this.camera.targetY - this.camera.y) * 5 * deltaTime;
        
        // Camera shake
        if (this.camera.shake > 0) {
            this.camera.shake -= deltaTime * 2;
            this.camera.x += (Math.random() - 0.5) * this.camera.shakeIntensity;
            this.camera.y += (Math.random() - 0.5) * this.camera.shakeIntensity;
        }
    }
    
    checkCollisions() {
        // Player vs Enemies
        this.world.enemies.forEach(enemy => {
            if (!this.player.invulnerable && this.checkCircleCollision(
                this.player.x, this.player.y, this.player.width / 2,
                enemy.x, enemy.y, enemy.radius
            )) {
                this.damagePlayer(enemy.damage);
            }
        });
        
        // Projectiles vs Enemies
        this.world.projectiles.forEach((projectile, pIndex) => {
            if (projectile.friendly) {
                this.world.enemies.forEach((enemy, eIndex) => {
                    if (this.checkCircleCollision(
                        projectile.x, projectile.y, projectile.radius,
                        enemy.x, enemy.y, enemy.radius
                    )) {
                        this.damageEnemy(enemy, projectile.damage);
                        this.createImpactEffect(projectile.x, projectile.y);
                        this.world.projectiles.splice(pIndex, 1);
                    }
                });
            }
        });
    }
    
    shootProjectile() {
        // Rate limiting
        const now = performance.now();
        if (now - (this.lastShot || 0) < 200) return; // 5 shots per second
        this.lastShot = now;
        
        // Calculate direction to mouse/touch
        const targetX = this.input.mouse.x + this.camera.x;
        const targetY = this.input.mouse.y + this.camera.y;
        
        const dx = targetX - this.player.x;
        const dy = targetY - this.player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        const speed = 400;
        this.world.projectiles.push({
            x: this.player.x,
            y: this.player.y,
            vx: (dx / distance) * speed,
            vy: (dy / distance) * speed,
            radius: 4,
            damage: 25,
            life: 3,
            friendly: true,
            color: '#00d4aa'
        });
        
        this.audioManager.playSound('shoot');
    }
    
    damagePlayer(damage) {
        this.player.health -= damage;
        this.player.invulnerable = true;
        this.player.invulnerabilityTime = 1000;
        
        // Screen shake
        this.addScreenShake(0.5, 10);
        
        // Damage particles
        this.createParticles(this.player.x, this.player.y, 8, '#ff4757');
        
        if (this.player.health <= 0) {
            this.gameOver();
        }
        
        this.audioManager.playSound('playerHurt');
    }
    
    damageEnemy(enemy, damage) {
        enemy.health -= damage;
        
        if (enemy.health <= 0) {
            this.stats.score += enemy.scoreValue;
            this.stats.experience += enemy.expValue;
            this.stats.enemiesKilled++;
            
            // Drop items
            if (Math.random() < 0.3) {
                this.spawnItem(enemy.x, enemy.y);
            }
            
            this.createParticles(enemy.x, enemy.y, 12, enemy.color);
            this.audioManager.playSound('enemyDeath');
        }
    }
    
    onEnemyKilled(enemy) {
        // Award experience and check for level up
        this.stats.experience += enemy.expValue;
        if (this.stats.experience >= this.stats.experienceToNext) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.stats.level++;
        this.stats.experience -= this.stats.experienceToNext;
        this.stats.experienceToNext = Math.floor(this.stats.experienceToNext * 1.2);
        
        this.gameState = 'levelUp';
        this.showLevelUpModal();
        
        this.audioManager.playSound('levelUp');
    }
    
    spawnItem(x, y) {
        const itemTypes = ['health', 'energy', 'data', 'upgrade'];
        const type = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        
        this.world.items.push({
            x: x + (Math.random() - 0.5) * 50,
            y: y + (Math.random() - 0.5) * 50,
            type: type,
            value: 10 + Math.random() * 20,
            radius: 8,
            pulseTime: 0
        });
    }
    
    collectPowerUp(powerUp) {
        switch (powerUp.type) {
            case 'health':
                this.player.health = Math.min(this.player.maxHealth, this.player.health + powerUp.value);
                break;
            case 'energy':
                this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + powerUp.value);
                break;
            case 'data':
                this.stats.dataCollected += powerUp.value;
                this.stats.score += powerUp.value * 10;
                break;
        }
        
        this.createParticles(powerUp.x, powerUp.y, 10, powerUp.color);
        this.audioManager.playSound('pickup');
    }
    
    createParticles(x, y, count, color) {
        for (let i = 0; i < count; i++) {
            this.world.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 0.5 + Math.random() * 0.5,
                maxLife: 1,
                alpha: 1,
                color: color,
                size: 2 + Math.random() * 4
            });
        }
    }
    
    createImpactEffect(x, y) {
        this.createParticles(x, y, 6, '#ffeb3b');
        this.addScreenShake(0.1, 3);
    }
    
    addScreenShake(duration, intensity) {
        this.camera.shake = Math.max(this.camera.shake, duration);
        this.camera.shakeIntensity = Math.max(this.camera.shakeIntensity, intensity);
    }
    
    checkCircleCollision(x1, y1, r1, x2, y2, r2) {
        const dx = x1 - x2;
        const dy = y1 - y2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < r1 + r2;
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Save context for camera transform
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);
        
        // Draw grid background
        this.drawGrid();
        
        // Draw obstacles
        this.world.obstacles.forEach(obstacle => this.drawObstacle(obstacle));
        
        // Draw items
        this.world.items.forEach(item => this.drawItem(item));
        
        // Draw power-ups
        this.world.powerUps.forEach(powerUp => this.drawPowerUp(powerUp));
        
        // Draw enemies
        this.world.enemies.forEach(enemy => this.drawEnemy(enemy));
        
        // Draw projectiles
        this.world.projectiles.forEach(projectile => this.drawProjectile(projectile));
        
        // Draw particles
        this.world.particles.forEach(particle => this.drawParticle(particle));
        
        // Draw player
        this.drawPlayer();
        
        // Restore context
        this.ctx.restore();
        
        // Draw UI overlay
        this.drawUI();
    }
    
    drawGrid() {
        const gridSize = 50;
        const startX = Math.floor(this.camera.x / gridSize) * gridSize;
        const startY = Math.floor(this.camera.y / gridSize) * gridSize;
        const endX = startX + this.canvas.width + gridSize;
        const endY = startY + this.canvas.height + gridSize;
        
        this.ctx.strokeStyle = 'rgba(0, 212, 170, 0.1)';
        this.ctx.lineWidth = 1;
        
        for (let x = startX; x < endX; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
            this.ctx.stroke();
        }
        
        for (let y = startY; y < endY; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        }
    }
    
    drawPlayer() {
        const alpha = this.player.invulnerable ? 0.5 + 0.5 * Math.sin(Date.now() * 0.02) : 1;
        
        this.ctx.save();
        this.ctx.globalAlpha = alpha;
        
        // Player body
        this.ctx.fillStyle = this.getClassColor(this.player.class);
        this.ctx.fillRect(
            this.player.x - this.player.width / 2,
            this.player.y - this.player.height / 2,
            this.player.width,
            this.player.height
        );
        
        // Player eyes/details
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(this.player.x - 8, this.player.y - 8, 4, 4);
        this.ctx.fillRect(this.player.x + 4, this.player.y - 8, 4, 4);
        
        this.ctx.restore();
    }
    
    drawEnemy(enemy) {
        this.ctx.fillStyle = enemy.color || '#ff4757';
        this.ctx.beginPath();
        this.ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Health bar
        if (enemy.health < enemy.maxHealth) {
            const barWidth = enemy.radius * 2;
            const barHeight = 4;
            const barX = enemy.x - barWidth / 2;
            const barY = enemy.y - enemy.radius - 10;
            
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);
            
            this.ctx.fillStyle = '#ff4757';
            this.ctx.fillRect(barX, barY, (enemy.health / enemy.maxHealth) * barWidth, barHeight);
        }
    }
    
    drawProjectile(projectile) {
        this.ctx.fillStyle = projectile.color;
        this.ctx.beginPath();
        this.ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Trail effect
        this.ctx.shadowColor = projectile.color;
        this.ctx.shadowBlur = 10;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    drawParticle(particle) {
        this.ctx.save();
        this.ctx.globalAlpha = particle.alpha;
        this.ctx.fillStyle = particle.color;
        this.ctx.fillRect(
            particle.x - particle.size / 2,
            particle.y - particle.size / 2,
            particle.size,
            particle.size
        );
        this.ctx.restore();
    }
    
    drawObstacle(obstacle) {
        this.ctx.fillStyle = obstacle.type === 'wall' ? '#636e72' : '#a29bfe';
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Highlight
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, 4);
    }
    
    drawItem(item) {
        const pulse = 1 + 0.2 * Math.sin(item.pulseTime * 5);
        const size = item.radius * pulse;
        
        this.ctx.fillStyle = this.getItemColor(item.type);
        this.ctx.beginPath();
        this.ctx.arc(item.x, item.y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Glow effect
        this.ctx.shadowColor = this.getItemColor(item.type);
        this.ctx.shadowBlur = 15;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    drawPowerUp(powerUp) {
        const pulse = 1 + 0.3 * Math.sin(powerUp.pulseTime * 4);
        const size = powerUp.radius * pulse;
        
        this.ctx.fillStyle = powerUp.color;
        this.ctx.beginPath();
        this.ctx.arc(powerUp.x, powerUp.y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Symbol
        this.ctx.fillStyle = '#000';
        this.ctx.font = '16px JetBrains Mono';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(powerUp.symbol, powerUp.x, powerUp.y + 4);
    }
    
    drawUI() {
        // Mini-map (optional)
        this.drawMiniMap();
    }
    
    drawMiniMap() {
        const mapSize = 150;
        const mapX = this.canvas.width - mapSize - 20;
        const mapY = 20;
        
        // Map background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(mapX, mapY, mapSize, mapSize);
        
        this.ctx.strokeStyle = '#00d4aa';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(mapX, mapY, mapSize, mapSize);
        
        // Scale factor
        const scaleX = mapSize / this.world.width;
        const scaleY = mapSize / this.world.height;
        
        // Draw player
        this.ctx.fillStyle = '#00d4aa';
        this.ctx.fillRect(
            mapX + this.player.x * scaleX - 2,
            mapY + this.player.y * scaleY - 2,
            4, 4
        );
        
        // Draw enemies
        this.ctx.fillStyle = '#ff4757';
        this.world.enemies.forEach(enemy => {
            this.ctx.fillRect(
                mapX + enemy.x * scaleX - 1,
                mapY + enemy.y * scaleY - 1,
                2, 2
            );
        });
    }
    
    getClassColor(className) {
        const colors = {
            hacker: '#00d4aa',
            guardian: '#2196f3',
            explorer: '#ff6b35'
        };
        return colors[className] || colors.hacker;
    }
    
    getItemColor(type) {
        const colors = {
            health: '#ff4757',
            energy: '#2196f3',
            data: '#ffeb3b',
            upgrade: '#a29bfe'
        };
        return colors[type] || colors.data;
    }
    
    updateUI() {
        // Update HUD elements
        const healthFill = document.getElementById('health-fill');
        const energyFill = document.getElementById('energy-fill');
        const healthText = document.getElementById('health-text');
        const energyText = document.getElementById('energy-text');
        const levelProgress = document.getElementById('level-progress');
        
        if (healthFill) healthFill.style.width = `${(this.player.health / this.player.maxHealth) * 100}%`;
        if (energyFill) energyFill.style.width = `${(this.player.energy / this.player.maxEnergy) * 100}%`;
        if (healthText) healthText.textContent = `${Math.ceil(this.player.health)}/${this.player.maxHealth}`;
        if (energyText) energyText.textContent = `${Math.ceil(this.player.energy)}/${this.player.maxEnergy}`;
        
        if (levelProgress) {
            const progress = (this.stats.experience / this.stats.experienceToNext) * 100;
            levelProgress.style.width = `${progress}%`;
        }
        
        // Update live stats
        this.updateLiveStats();
    }
    
    updateLiveStats() {
        const elements = {
            'live-score': this.stats.score,
            'live-data': this.stats.dataCollected,
            'live-wave': this.stats.wave,
            'current-level': `NEXUS LEVEL ${this.stats.level}`
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }
    
    showGameInterface() {
        document.getElementById('game-menu').style.display = 'none';
        document.getElementById('game-interface').style.display = 'block';
    }
    
    showLevelUpModal() {
        document.getElementById('levelup-modal').style.display = 'flex';
        this.generateUpgradeOptions();
    }
    
    generateUpgradeOptions() {
        const container = document.getElementById('upgrade-options');
        if (!container) return;
        
        container.innerHTML = '';
        
        const upgrades = this.upgradeSystem.getRandomUpgrades(3);
        
        upgrades.forEach((upgrade, index) => {
            const option = document.createElement('div');
            option.className = 'upgrade-option';
            option.innerHTML = `
                <div class="upgrade-icon">${upgrade.icon}</div>
                <h4>${upgrade.name}</h4>
                <p>${upgrade.description}</p>
            `;
            
            option.addEventListener('click', () => {
                this.selectUpgrade(upgrade);
                document.getElementById('levelup-modal').style.display = 'none';
                this.gameState = 'playing';
                this.startGameLoop();
            });
            
            container.appendChild(option);
        });
    }
    
    selectUpgrade(upgrade) {
        this.upgradeSystem.applyUpgrade(this.player, upgrade);
        this.audioManager.playSound('upgrade');
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        
        // Update persistent data
        this.updatePersistentData();
        
        // Show death modal
        this.showDeathModal();
        
        this.audioManager.playSound('gameOver');
    }
    
    showDeathModal() {
        const elements = {
            'death-score': this.stats.score,
            'death-levels': this.stats.level,
            'death-time': this.formatTime(this.stats.sessionTime),
            'death-data': this.stats.dataCollected
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
        
        document.getElementById('death-modal').style.display = 'flex';
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.pause();
        } else if (this.gameState === 'paused') {
            this.resume();
        }
    }
    
    pause() {
        this.gameState = 'paused';
        document.getElementById('pause-modal').style.display = 'flex';
        
        // Update session time display
        const sessionTimeElement = document.getElementById('session-time');
        if (sessionTimeElement) {
            sessionTimeElement.textContent = this.formatTime(this.stats.sessionTime);
        }
        
        const enemiesDefeatedElement = document.getElementById('enemies-defeated');
        if (enemiesDefeatedElement) {
            enemiesDefeatedElement.textContent = this.stats.enemiesKilled;
        }
    }
    
    resume() {
        this.gameState = 'playing';
        document.getElementById('pause-modal').style.display = 'none';
        this.lastTime = performance.now();
        this.startGameLoop();
    }
    
    restartGame() {
        document.getElementById('death-modal').style.display = 'none';
        this.startGame();
    }
    
    backToMenu() {
        this.gameState = 'menu';
        document.getElementById('death-modal').style.display = 'none';
        document.getElementById('pause-modal').style.display = 'none';
        document.getElementById('game-interface').style.display = 'none';
        document.getElementById('game-menu').style.display = 'flex';
    }
    
    closeGame() {
        this.gameState = 'menu';
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
        }
        document.getElementById('nexus-game').style.display = 'none';
        document.body.style.overflow = '';
    }
    
    isMobile() {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    
    handleKeyDown(code) {
        // Ability shortcuts
        if (code.startsWith('Digit')) {
            const slot = parseInt(code.replace('Digit', '')) - 1;
            this.useAbility(slot);
        }
    }
    
    handleMovement(direction, active) {
        // Handle touch movement
        const key = {
            up: 'ArrowUp',
            down: 'ArrowDown',
            left: 'ArrowLeft',
            right: 'ArrowRight'
        }[direction];
        
        if (key) {
            this.input.keys[key] = active;
        }
    }
    
    handleAction(index) {
        switch (index) {
            case 0: // Attack
                this.shootProjectile();
                break;
            case 1: // Special ability
                this.useAbility(0);
                break;
            case 2: // Interact
                this.interact();
                break;
        }
    }
    
    useAbility(slot) {
        // Implement ability system
        console.log(`Using ability slot ${slot}`);
    }
    
    interact() {
        // Implement interaction system
        console.log('Interacting...');
    }
    
    checkLevelProgression() {
        // Check if all enemies are defeated to progress wave
        if (this.world.enemies.length === 0) {
            this.stats.wave++;
            this.enemySpawner.spawnWave(this.stats.wave);
        }
    }
    
    loadAssets() {
        // Load audio and other assets
        this.audioManager.loadSounds();
    }
    
    loadPersistentData() {
        const saved = localStorage.getItem('siderNexusPersistent');
        return saved ? JSON.parse(saved) : {
            highScore: 0,
            totalPlayTime: 0,
            enemiesKilled: 0,
            achievementsUnlocked: [],
            upgradesUnlocked: []
        };
    }
    
    updatePersistentData() {
        this.persistentData.highScore = Math.max(this.persistentData.highScore, this.stats.score);
        this.persistentData.totalPlayTime += this.stats.sessionTime;
        this.persistentData.enemiesKilled += this.stats.enemiesKilled;
        
        localStorage.setItem('siderNexusPersistent', JSON.stringify(this.persistentData));
    }
}

// Supporting Classes

class EnemySpawner {
    constructor() {
        this.spawnTimer = 0;
        this.spawnInterval = 2;
    }
    
    update(deltaTime, wave) {
        this.spawnTimer += deltaTime;
        
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnEnemy(wave);
            this.spawnTimer = 0;
            this.spawnInterval = Math.max(0.5, 2 - wave * 0.1);
        }
    }
    
    spawnWave(wave) {
        const enemyCount = 3 + wave * 2;
        
        for (let i = 0; i < enemyCount; i++) {
            setTimeout(() => this.spawnEnemy(wave), i * 500);
        }
    }
    
    spawnEnemy(wave) {
        const game = window.nexusGame;
        if (!game) return;
        
        const types = ['basic', 'fast', 'tank'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const enemy = this.createEnemyByType(type, wave);
        
        // Spawn at edge of world
        const side = Math.floor(Math.random() * 4);
        switch (side) {
            case 0: // Top
                enemy.x = Math.random() * game.world.width;
                enemy.y = 0;
                break;
            case 1: // Right
                enemy.x = game.world.width;
                enemy.y = Math.random() * game.world.height;
                break;
            case 2: // Bottom
                enemy.x = Math.random() * game.world.width;
                enemy.y = game.world.height;
                break;
            case 3: // Left
                enemy.x = 0;
                enemy.y = Math.random() * game.world.height;
                break;
        }
        
        game.world.enemies.push(enemy);
    }
    
    createEnemyByType(type, wave) {
        const baseStats = {
            basic: { health: 50, speed: 80, radius: 12, color: '#ff4757', damage: 10, scoreValue: 100, expValue: 10 },
            fast: { health: 30, speed: 150, radius: 8, color: '#ffa502', damage: 5, scoreValue: 150, expValue: 15 },
            tank: { health: 100, speed: 50, radius: 20, color: '#ff3838', damage: 20, scoreValue: 200, expValue: 25 }
        };
        
        const stats = baseStats[type] || baseStats.basic;
        
        return {
            ...stats,
            maxHealth: stats.health + wave * 10,
            health: stats.health + wave * 10,
            speed: stats.speed + wave * 2,
            damage: stats.damage + Math.floor(wave / 2),
            scoreValue: stats.scoreValue + wave * 50,
            expValue: stats.expValue + wave * 5,
            x: 0,
            y: 0,
            type: type
        };
    }
}

class UpgradeSystem {
    constructor() {
        this.upgrades = [
            {
                id: 'health_boost',
                name: 'Health Boost',
                description: 'Increase maximum health by 25%',
                icon: '❤️',
                apply: (player) => {
                    player.maxHealth = Math.floor(player.maxHealth * 1.25);
                    player.health = player.maxHealth;
                }
            },
            {
                id: 'speed_boost',
                name: 'Speed Enhancement',
                description: 'Increase movement speed by 20%',
                icon: '⚡',
                apply: (player) => {
                    player.speed = Math.floor(player.speed * 1.2);
                }
            },
            {
                id: 'energy_boost',
                name: 'Energy Upgrade',
                description: 'Increase maximum energy by 30%',
                icon: '🔋',
                apply: (player) => {
                    player.maxEnergy = Math.floor(player.maxEnergy * 1.3);
                    player.energy = player.maxEnergy;
                }
            },
            {
                id: 'damage_boost',
                name: 'Damage Amplifier',
                description: 'Increase projectile damage by 50%',
                icon: '💥',
                apply: (player) => {
                    // This would modify projectile damage globally
                    console.log('Damage boost applied!');
                }
            }
        ];
    }
    
    getRandomUpgrades(count) {
        const shuffled = [...this.upgrades].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }
    
    applyUpgrade(player, upgrade) {
        if (upgrade.apply) {
            upgrade.apply(player);
        }
        
        if (!player.upgrades.includes(upgrade.id)) {
            player.upgrades.push(upgrade.id);
        }
    }
}

class AchievementSystem {
    constructor() {
        this.achievements = {
            firstKill: { name: 'First Blood', description: 'Defeat your first enemy', unlocked: false },
            survivor: { name: 'Survivor', description: 'Survive for 5 minutes', unlocked: false },
            collector: { name: 'Data Collector', description: 'Collect 100 data fragments', unlocked: false },
            level10: { name: 'Veteran Navigator', description: 'Reach level 10', unlocked: false },
            wave10: { name: 'Wave Master', description: 'Survive 10 waves', unlocked: false }
        };
        
        this.loadAchievements();
    }
    
    checkAchievements(stats, player) {
        const checks = {
            firstKill: stats.enemiesKilled >= 1,
            survivor: stats.sessionTime >= 300,
            collector: stats.dataCollected >= 100,
            level10: player.level >= 10,
            wave10: stats.wave >= 10
        };
        
        Object.entries(checks).forEach(([id, condition]) => {
            if (condition && !this.achievements[id].unlocked) {
                this.unlockAchievement(id);
            }
        });
    }
    
    unlockAchievement(id) {
        this.achievements[id].unlocked = true;
        this.showAchievement(this.achievements[id]);
        this.saveAchievements();
    }
    
    showAchievement(achievement) {
        const popup = document.getElementById('achievement-popup');
        const title = document.getElementById('achievement-title');
        const desc = document.getElementById('achievement-desc');
        
        if (popup && title && desc) {
            title.textContent = achievement.name;
            desc.textContent = achievement.description;
            
            popup.classList.add('show');
            
            setTimeout(() => {
                popup.classList.remove('show');
            }, 4000);
        }
    }
    
    saveAchievements() {
        localStorage.setItem('siderNexusAchievements', JSON.stringify(this.achievements));
    }
    
    loadAchievements() {
        const saved = localStorage.getItem('siderNexusAchievements');
        if (saved) {
            this.achievements = { ...this.achievements, ...JSON.parse(saved) };
        }
    }
}

class AudioManager {
    constructor() {
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.3;
    }
    
    loadSounds() {
        // In a real implementation, you would load actual audio files
        // For now, we'll create placeholder sound objects
        this.sounds = {
            shoot: { play: () => this.playTone(800, 0.1) },
            enemyDeath: { play: () => this.playTone(200, 0.2) },
            playerHurt: { play: () => this.playTone(150, 0.3) },
            pickup: { play: () => this.playTone(1200, 0.1) },
            levelUp: { play: () => this.playTone(1000, 0.5) },
            upgrade: { play: () => this.playTone(1500, 0.3) },
            gameOver: { play: () => this.playTone(100, 1) }
        };
    }
    
    playSound(name) {
        if (!this.enabled || !this.sounds[name]) return;
        
        try {
            this.sounds[name].play();
        } catch (error) {
            console.warn('Audio playback failed:', error);
        }
    }
    
    playTone(frequency, duration) {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
            gainNode.gain.setValueAtTime(this.volume, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
            
            oscillator.start();
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Tone generation failed:', error);
        }
    }
}

// Game Activation System
class NexusActivator {
    constructor() {
        this.game = null;
        this.setupActivationMethods();
    }
    
    setupActivationMethods() {
        // Text-based activation (type "play")
        this.setupTextActivation();
        
        // Konami code activation
        this.setupKonamiCode();
        
        // Mobile shake activation
        this.setupShakeActivation();
    }
    
    setupTextActivation() {
        let sequence = [];
        const targetSequence = ['p', 'l', 'a', 'y'];
        
        document.addEventListener('keydown', (e) => {
            if (this.game && this.game.gameState !== 'menu') return;
            
            const key = e.key.toLowerCase();
            sequence.push(key);
            
            if (sequence.length > targetSequence.length) {
                sequence.shift();
            }
            
            if (sequence.length === targetSequence.length && 
                sequence.join('') === targetSequence.join('')) {
                this.activateGame('Text Command: PLAY');
                sequence = [];
            }
        });
    }
    
    setupKonamiCode() {
        let konamiSequence = [];
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 
                           'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
        
        document.addEventListener('keydown', (e) => {
            if (this.game && this.game.gameState !== 'menu') return;
            
            if (konamiCode.includes(e.code)) {
                konamiSequence.push(e.code);
                if (konamiSequence.length > konamiCode.length) {
                    konamiSequence.shift();
                }
                
                if (konamiSequence.length === konamiCode.length && 
                    konamiSequence.join(',') === konamiCode.join(',')) {
                    this.activateGame('Konami Code');
                    konamiSequence = [];
                }
            } else {
                konamiSequence = [];
            }
        });
    }
    
    setupShakeActivation() {
        if (!('DeviceMotionEvent' in window)) return;
        
        let shakeCount = 0;
        let lastShake = 0;
        let shakeTimeout;
        
        window.addEventListener('devicemotion', (e) => {
            if (this.game && this.game.gameState !== 'menu') return;
            
            const acceleration = e.accelerationIncludingGravity;
            if (!acceleration) return;
            
            const totalAcceleration = Math.abs(acceleration.x) + 
                                    Math.abs(acceleration.y) + 
                                    Math.abs(acceleration.z);
            const currentTime = Date.now();
            
            if (totalAcceleration > 25 && currentTime - lastShake > 500) {
                shakeCount++;
                lastShake = currentTime;
                
                if (shakeCount >= 3) {
                    this.activateGame('Device Shake');
                    shakeCount = 0;
                }
                
                clearTimeout(shakeTimeout);
                shakeTimeout = setTimeout(() => {
                    shakeCount = 0;
                }, 3000);
            }
        });
    }
    
    activateGame(method) {
        console.log(`🎮 NEXUS activated via: ${method}`);
        
        // Visual feedback
        document.body.style.animation = 'backgroundShift 0.3s ease';
        
        setTimeout(() => {
            document.body.style.animation = '';
            this.showGame();
        }, 300);
        
        // Haptic feedback on mobile
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100, 50, 200]);
        }
    }
    
    showGame() {
        if (!this.game) {
            this.game = new SiderNexusGame();
            window.nexusGame = this.game; // Global reference
        }
        
        const gameElement = document.getElementById('nexus-game');
        if (gameElement) {
            gameElement.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Select default character
            document.querySelector('.character-card[data-class="hacker"]')?.click();
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Add the nexus styles to the page
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'nexus-styles.css';
    document.head.appendChild(link);
    
    // Initialize the activator
    setTimeout(() => {
        new NexusActivator();
        console.log('🌐 SIDER NEXUS activation system ready!');
        console.log('💡 Activation methods:');
        console.log('  🖥️  Desktop: Type "play" or use Konami code (↑↑↓↓←→←→)');
        console.log('  📱 Mobile: Shake device 3 times quickly');
    }, 1000);
});