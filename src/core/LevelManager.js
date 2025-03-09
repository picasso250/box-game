class LevelManager {
    constructor() {
        this.currentLevel = null;
        this.initialLevel = null;
        this.gridSize = 2;
    }

    loadLevel(levelData) {
        this.currentLevel = levelData;
        this.initialLevel = JSON.parse(JSON.stringify(levelData));
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
