class Player {
    constructor(gameEngine, levelManager) {
        this.gameEngine = gameEngine;
        this.levelManager = levelManager;
        this.mesh = null;
        this.position = { x: 0, z: 0 };
        this.gridSize = levelManager.gridSize;
        this.boxPositions = new Set();
    }

    create(position) {
        const geometry = new THREE.SphereGeometry(0.7, 32, 32);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(position.x, 0.5, position.z);
        this.gameEngine.addToScene(this.mesh);
        this.position = position;
    }

    move(dx, dz) {
        const newX = this.position.x + dx * this.gridSize;
        const newZ = this.position.z + dz * this.gridSize;

        if (this.levelManager.isWall(newX, newZ)) return false;

        if (this.boxPositions.has(`${newX},${newZ}`)) {
            const boxNewX = newX + dx * this.gridSize;
            const boxNewZ = newZ + dz * this.gridSize;

            if (!this.levelManager.isWall(boxNewX, boxNewZ) && 
                !this.boxPositions.has(`${boxNewX},${boxNewZ}`)) {
                this.moveBox(newX, newZ, boxNewX, boxNewZ);
            } else {
                return false;
            }
        }

        this.position.x = newX;
        this.position.z = newZ;
        this.mesh.position.set(newX, 0.5, newZ);
        return true;
    }

    moveBox(fromX, fromZ, toX, toZ) {
        const box = Array.from(this.gameEngine.scene.children).find(child => 
            child.position.x === fromX && child.position.z === fromZ
        );

        if (box) {
            box.position.set(toX, this.gridSize * 0.3, toZ);
            this.boxPositions.delete(`${fromX},${fromZ}`);
            this.boxPositions.add(`${toX},${toZ}`);
            return true;
        }
        return false;
    }

    addBoxPosition(x, z) {
        this.boxPositions.add(`${x},${z}`);
    }

    reset() {
        this.position = { x: 0, z: 0 };
        if (this.mesh) {
            this.mesh.position.set(this.position.x, 0.5, this.position.z);
        }
        this.boxPositions.clear();
    }
}
