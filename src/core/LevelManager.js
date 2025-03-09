class LevelManager {
    constructor() {
        this.levels = [];
        this.currentLevelIndex = 0;
        this.currentLevel = null;
        this.initialLevel = null;
        this.gridSize = 2;
    }

    addLevel(levelData) {
        this.levels.push(levelData);
    }

    nextLevel() {
        if (this.currentLevelIndex < this.levels.length - 1) {
            this.currentLevelIndex++;
            this.loadLevel(this.currentLevelIndex);
            return true;
        }
        return false;
    }

    loadLevel(levelIndex) {
        if (typeof levelIndex === 'number') {
            this.currentLevel = this.levels[levelIndex];
        } else {
            this.currentLevel = levelIndex;
        }
        this.initialLevel = JSON.parse(JSON.stringify(this.currentLevel));
    }

    getCell(x, z) {
        const gridX = Math.round(x / this.gridSize + this.currentLevel[0].length / 2 - 0.5);
        const gridZ = Math.round(z / this.gridSize + this.currentLevel.length / 2 - 0.5);
        return this.currentLevel[gridZ]?.[gridX];
    }

    isWall(x, z) {
        return this.getCell(x, z) === 1;
    }

    isTarget(x, z) {
        return this.getCell(x, z) === 3;
    }

    resetLevel() {
        if (this.initialLevel) {
            this.currentLevel = JSON.parse(JSON.stringify(this.initialLevel));
        }
    }

    getGridPosition(x, z) {
        return {
            x: (x - this.currentLevel[0].length / 2) * this.gridSize,
            z: (z - this.currentLevel.length / 2) * this.gridSize
        };
    }

    getLevelDimensions() {
        return {
            width: this.currentLevel[0].length,
            height: this.currentLevel.length
        };
    }
}
