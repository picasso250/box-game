
class BoxGame {
    constructor() {
        this.gameEngine = new GameEngine();
        this.levelManager = new LevelManager();
        this.player = new Player(this.gameEngine, this.levelManager);
        this.audioManager = new AudioManager(this.gameEngine);
        this.particleSystem = new ParticleSystem(this.gameEngine);
        this.isWin = false;
        this.translator = new Translator();
    }

    async init() {
        // Initialize game engine
        this.gameEngine.init();
        
        // Load translations
        await this.translator.loadTranslations();
        this.applyTranslations();
        
        // Load audio
        await this.audioManager.addSound('box', 'win.mp3', 0.5);
        await this.audioManager.addSound('win', 'win.mp3', 0.8);
        this.audioManager.attachToCamera(this.gameEngine.camera);

        // Setup controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.getElementById('next-level-btn').addEventListener('click', () => this.handleNextLevel());

        // Load levels
        const levels = [
            [
                [1, 1, 1, 1, 1, 1],    [1, 0, 0, 1, 0, 1],    [1, 0, 0, 0, 0, 1],    [1, 0, 0, 2, 0, 1],    [1, 0, 3, 4, 0, 1],    [1, 1, 1, 1, 1, 1],],
            [
                [1, 1, 1, 1, 1, 1],    [1, 0, 0, 0, 0, 1],    [1, 0, 0, 2, 0, 1],    [1, 0, 0, 0, 0, 1],    [1, 3, 1, 4, 0, 1],    [1, 1, 1, 1, 1, 1],],
                [
                    [1, 1, 1, 1, 1, 1, 1],    [1, 3, 2, 0, 0, 0, 1],    [1, 0, 0, 0, 0, 0, 1],    [1, 0, 2, 1, 0, 3, 1],    [1, 1, 0, 0, 0, 0, 1],    [1, 0, 4, 0, 1, 0, 1],    [1, 1, 1, 1, 1, 1, 1],],
                [
                    [1, 1, 1, 1, 1, 1, 1],    [1, 0, 3, 0, 1, 0, 1],    [1, 0, 2, 0, 4, 0, 1],    [1, 0, 0, 0, 0, 1, 1],    [1, 0, 1, 2, 0, 0, 1],    [1, 0, 0, 0, 3, 0, 1],    [1, 1, 1, 1, 1, 1, 1],],
                [
                    [1, 1, 1, 1, 1, 1, 1],    [1, 0, 0, 0, 3, 0, 1],    [1, 0, 2, 0, 0, 0, 1],    [1, 0, 2, 3, 0, 0, 1],    [1, 0, 0, 0, 0, 0, 1],    [1, 4, 0, 0, 0, 0, 1],    [1, 1, 1, 1, 1, 1, 1],],
                [
                    [1, 1, 1, 1, 1, 1, 1],    [1, 0, 0, 0, 0, 0, 1],    [1, 0, 0, 1, 1, 4, 1],    [1, 3, 0, 2, 0, 0, 1],    [1, 0, 0, 0, 0, 1, 1],    [1, 0, 2, 0, 3, 0, 1],    [1, 1, 1, 1, 1, 1, 1],],
            [
                [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
                [0, 0, 0, 1, 3, 0, 0, 0, 0, 1, 0, 0],
                [1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 4, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
            ],
            
        ];
        
        levels.forEach(level => this.levelManager.addLevel(level));
        this.loadLevel(0);

        // Start game loop
        this.gameEngine.start();
    }

    loadLevel(levelData) {
        this.levelManager.loadLevel(levelData);
        this.createLevel();
    }

    createLevel() {
        const level = this.levelManager.currentLevel;
        const gridSize = this.levelManager.gridSize;

        for (let z = 0; z < level.length; z++) {
            for (let x = 0; x < level[z].length; x++) {
                const cell = level[z][x];
                const pos = this.levelManager.getGridPosition(x, z);

                if (cell === 1) { // Wall
                    this.createWall(pos);
                } else if (cell === 2) { // Box
                    this.createBox(pos);
                } else if (cell === 3) { // Target
                    this.createTarget(pos);
                } else if (cell === 4) { // Player
                    this.player.create(pos);
                }
            }
        }

        // Set up lighting
        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(10, 10, 10);
        this.gameEngine.addToScene(light);
        this.gameEngine.addToScene(new THREE.AmbientLight(0x404040));

        // Set camera position
        const dimensions = this.levelManager.getLevelDimensions();
        this.gameEngine.camera.position.set(10, 15, 10);
        this.gameEngine.camera.lookAt(0, 0, 0);
    }

    createWall(position) {
        const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
        const material = new THREE.MeshPhongMaterial({ color: 0x808080 });
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(position.x, 0, position.z);
        this.gameEngine.addToScene(wall);
    }

    createBox(position) {
        const geometry = new THREE.BoxGeometry(1.3, 1.3, 1.3);
        const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
        const box = new THREE.Mesh(geometry, material);
        box.position.set(position.x, 0.3, position.z);
        this.gameEngine.addToScene(box);
        this.player.addBoxPosition(position.x, position.z);
    }

    createTarget(position) {
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const target = new THREE.Mesh(geometry, material);
        target.position.set(position.x, 0.2, position.z);
        this.gameEngine.addToScene(target);
    }

    handleKeyDown(event) {
        const move = {
            ArrowUp: { dx: 0, dz: -1 },
            ArrowDown: { dx: 0, dz: 1 },
            ArrowLeft: { dx: -1, dz: 0 },
            ArrowRight: { dx: 1, dz: 0 }
        }[event.key];

        if (move) {
            if (this.player.move(move.dx, move.dz)) {
                this.checkWin();
            }
        }

        if (event.key === 'r' || event.key === 'R') {
            this.resetLevel();
        }
    }

    checkWin() {
        const targets = [];
        const level = this.levelManager.currentLevel;

        for (let z = 0; z < level.length; z++) {
            for (let x = 0; x < level[z].length; x++) {
                if (level[z][x] === 3) {
                    const pos = this.levelManager.getGridPosition(x, z);
                    targets.push([pos.x, pos.z]);
                }
            }
        }

        const boxPositions = Array.from(this.player.boxPositions).map(pos => pos.split(',').map(Number));
        const win = targets.every(target => {
            return boxPositions.some(boxPos => {
                const dx = Math.abs(boxPos[0] - target[0]);
                const dz = Math.abs(boxPos[1] - target[1]);
                return dx < 0.001 && dz < 0.001;
            });
        });

        if (win && !this.isWin) {
            this.isWin = true;
            this.showWinMessage();
            this.particleSystem.createWinEffect();
            this.audioManager.playSound('win');
        }
    }

    applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.translator.translate(key);
        });
    }

    showWinMessage() {
        const winMessage = document.getElementById('win-message');
        const nextLevelBtn = document.getElementById('next-level-btn');
        
        winMessage.style.top = '50%';
        winMessage.style.transform = 'translate(-50%, -50%)';
        winMessage.style.opacity = 1;
        
        if (this.levelManager.nextLevel()) {
            nextLevelBtn.style.display = 'block';
        } else {
            nextLevelBtn.style.display = 'none';
        }
        
        // Update translations in case language changed
        this.applyTranslations();
    }

    handleNextLevel() {

        // Hide win message
        const winMessage = document.getElementById('win-message');
        winMessage.style.top = '-100px';
        winMessage.style.opacity = 0;

        // Reset game state
        this.isWin = false;
        
        this.gameEngine.clearScene();
        // this.resetLevel();
        this.loadLevel(this.levelManager.currentLevelIndex);
        const nextLevelBtn = document.getElementById('next-level-btn');
        nextLevelBtn.style.display = 'none';
    }

    resetLevel() {
        
        this.gameEngine.clearScene();
        this.levelManager.resetLevel();
        this.player.reset();
        this.createLevel();
    }
}

// Initialize game
const game = new BoxGame();
game.init();
