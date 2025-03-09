class GameEngine {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.isRunning = false;
        this.lastTime = 0;
        // 新增一个数组来存储可更新的对象
        this.updatableObjects = [];
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Setup window resize handling
        window.addEventListener('resize', () => this.handleResize());
    }

    start() {
        this.isRunning = true;
        this.lastTime = performance.now();
        this.gameLoop();
    }

    stop() {
        this.isRunning = false;
    }

    gameLoop() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }

    update(deltaTime) {
        // 遍历可更新对象数组并调用每个对象的 update 方法
        for (let i = 0; i < this.updatableObjects.length; i++) {
            const object = this.updatableObjects[i];
            if (object.update) {
                object.update(deltaTime);
            }
        }
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    addToScene(object) {
        this.scene.add(object);
        // 如果对象有 update 方法，则将其添加到可更新对象数组中
        if (object.update) {
            this.updatableObjects.push(object);
        }
    }

    removeFromScene(object) {
        this.scene.remove(object);
        // 从可更新对象数组中移除该对象
        const index = this.updatableObjects.indexOf(object);
        if (index > -1) {
            this.updatableObjects.splice(index, 1);
        }
    }

    clearScene() {
        while (this.scene.children.length > 0) {
            this.scene.remove(this.scene.children[0]);
        }
        // 清空可更新对象数组
        this.updatableObjects = [];
    }
}