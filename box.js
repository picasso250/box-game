
let camera, scene, renderer, player;
let level = [
    [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 3, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 2, 2, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 3, 0, 4, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];
// 保存初始的关卡数据
const initialLevel = JSON.parse(JSON.stringify(level));
let boxes = [];
const gridSize = 2;
let boxPositions = new Set();
let audioListener, boxSound, winSound;
let isWin = false;

function init() {
    // 场景设置
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 灯光
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // 音频监听器
    audioListener = new THREE.AudioListener();
    camera.add(audioListener);

    // 箱子到达目标点的声音
    boxSound = new THREE.Audio(audioListener);
    const boxSoundLoader = new THREE.AudioLoader();
    boxSoundLoader.load('https://www.soundjay.com/button/beep-07.wav', function (buffer) {
        boxSound.setBuffer(buffer);
        boxSound.setVolume(0.5);
    });

    // 胜利声音
    winSound = new THREE.Audio(audioListener);
    const winSoundLoader = new THREE.AudioLoader();
    winSoundLoader.load('https://www.soundjay.com/button/beep-06.wav', function (buffer) {
        winSound.setBuffer(buffer);
        winSound.setVolume(0.8);
    });

    // 创建地图
    createLevel();

    // 相机位置
    camera.position.set(10, 15, 10);
    camera.lookAt(0, 0, 0);

    // 玩家控制
    document.addEventListener('keydown', onKeyDown);
}

function createLevel() {
    const wallRatio = 0.75;
    const geometry = new THREE.BoxGeometry(gridSize * wallRatio, gridSize * wallRatio, gridSize * wallRatio);

    document.addEventListener('mousemove', function (event) {
        const ratio = event.clientX / window.innerWidth;
    })

    boxPositions = new Set();
    boxes = [];

    for (let z = 0; z < level.length; z++) {
        for (let x = 0; x < level[z].length; x++) {
            const cell = level[z][x];
            const posX = (x - level[0].length / 2) * gridSize;
            const posZ = (z - level.length / 2) * gridSize;

            if (cell === 1) { // 墙
                const material = new THREE.MeshPhongMaterial({ color: 0x808080 });
                const wall = new THREE.Mesh(geometry, material);
                wall.position.set(posX, 0, posZ);
                scene.add(wall);
            }
            else if (cell === 2) { // 箱子
                createBox(posX, posZ);
            }
            else if (cell === 3) { // 目标点改为小正方体
                const targetGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
                const targetMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
                const target = new THREE.Mesh(targetGeometry, targetMaterial);
                target.position.set(posX, 0.2, posZ);
                scene.add(target);
            }
            else if (cell === 4) { // 玩家改为圆球
                const playerGeo = new THREE.SphereGeometry(0.7, 32, 32);
                const playerMat = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
                player = new THREE.Mesh(playerGeo, playerMat);
                player.position.set(posX, 0.5, posZ);
                scene.add(player);
                level[z][x] = 0;
            }
        }
    }
}

function createBox(x, z) {
    const boxRatio = 0.65;
    const geometry = new THREE.BoxGeometry(gridSize * boxRatio, gridSize * boxRatio, gridSize * boxRatio);
    const material = new THREE.MeshPhongMaterial({ color: 0xffff00 });
    const box = new THREE.Mesh(geometry, material);
    box.position.set(x, gridSize * 0.3, z);
    scene.add(box);
    boxes.push(box);
    boxPositions.add(`${x},${z}`);
}

function onKeyDown(event) {
    const move = {
        ArrowUp: { dx: 0, dz: -1 },
        ArrowDown: { dx: 0, dz: 1 },
        ArrowLeft: { dx: -1, dz: 0 },
        ArrowRight: { dx: 1, dz: 0 }
    }[event.key];

    if (move) movePlayer(move.dx, move.dz);
    if (event.key === 'r' || event.key === 'R') resetLevel();
}

function movePlayer(dx, dz) {
    const currentPos = player.position.clone();
    const newX = currentPos.x + dx * gridSize;
    const newZ = currentPos.z + dz * gridSize;

    // 检查碰撞
    if (isWall(newX, newZ)) return;

    // 检查箱子
    if (boxPositions.has(`${newX},${newZ}`)) {
        const boxNewX = newX + dx * gridSize;
        const boxNewZ = newZ + dz * gridSize;

        if (!isWall(boxNewX, boxNewZ) && !boxPositions.has(`${boxNewX},${boxNewZ}`)) {
            const box = boxes.find(b =>
                b.position.x === newX && b.position.z === newZ
            );
            box.position.set(boxNewX, gridSize * 0.3, boxNewZ);
            boxPositions.delete(`${newX},${newZ}`);
            boxPositions.add(`${boxNewX},${boxNewZ}`);

            // 检查箱子是否到达目标点
            if (isTarget(boxNewX, boxNewZ)) {
                createParticleEffect(boxNewX, boxNewZ);
                if (boxSound.isLoaded) boxSound.play();
            }
        } else {
            return;
        }
    }

    player.position.set(newX, 0.5, newZ);
    checkWin();
}

function isWall(x, z) {
    const gridX = Math.round(x / gridSize + level[0].length / 2 - 0.5);
    const gridZ = Math.round(z / gridSize + level.length / 2 - 0.5);
    return level[gridZ]?.[gridX] === 1;
}

function isTarget(x, z) {
    const gridX = Math.round(x / gridSize + level[0].length / 2 - 0.5);
    const gridZ = Math.round(z / gridSize + level.length / 2 - 0.5);
    return level[gridZ]?.[gridX] === 3;
}

function createParticleEffect(x, z) {
    const particleCount = 50;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = x + (Math.random() - 0.5) * 2;
        positions[i3 + 1] = gridSize * 0.3;
        positions[i3 + 2] = z + (Math.random() - 0.5) * 2;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({ color: 0xffa500, size: 0.1 });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // 让粒子逐渐消失
    const animateParticles = () => {
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3 + 1] += 0.05;
            positions[i3] += (Math.random() - 0.5) * 0.1;
            positions[i3 + 2] += (Math.random() - 0.5) * 0.1;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particlesMaterial.size *= 0.95;
        if (particlesMaterial.size < 0.01) {
            scene.remove(particles);
        } else {
            requestAnimationFrame(animateParticles);
        }
    };
    animateParticles();
}

function checkWin() {
    const targets = [];
    for (let z = 0; z < level.length; z++) {
        for (let x = 0; x < level[z].length; x++) {
            if (level[z][x] === 3) {
                const posX = (x - level[0].length / 2) * gridSize;
                const posZ = (z - level.length / 2) * gridSize;
                targets.push([posX, posZ]);
            }
        }
    }
    const boxPosArray = Array.from(boxPositions).map(pos => pos.split(',').map(Number));
    const win = targets.every(target => {
        return boxPosArray.some(boxPos => {
            const dx = Math.abs(boxPos[0] - target[0]);
            const dz = Math.abs(boxPos[1] - target[1]);
            return dx < 0.001 && dz < 0.001;
        });
    });
    if (win && !isWin) {
        isWin = true;
        showWinMessage();
        createWinParticleEffect();
        if (winSound.isLoaded) winSound.play();
    }
}

function showWinMessage() {
    const winMessage = document.getElementById('win-message');
    winMessage.style.top = '50%';
    winMessage.style.transform = 'translate(-50%, -50%)';
    winMessage.style.opacity = 1;
}

function createWinParticleEffect() {
    const particleCount = 500;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 20;
        positions[i3 + 1] = (Math.random() - 0.5) * 20;
        positions[i3 + 2] = (Math.random() - 0.5) * 20;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({ color: 0xffa500, size: 0.2 });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    const animateWinParticles = () => {
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3 + 1] += 0.1;
            positions[i3] += (Math.random() - 0.5) * 0.1;
            positions[i3 + 2] += (Math.random() - 0.5) * 0.1;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        requestAnimationFrame(animateWinParticles);
    };
    animateWinParticles();
}

function resetLevel() {
    // 隐藏胜利消息
    const winMessage = document.getElementById('win-message');
    winMessage.style.top = '-100px';
    winMessage.style.opacity = 0;

    // 重置胜利状态
    isWin = false;

    // 清空场景
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }

    // 恢复初始关卡数据
    level = JSON.parse(JSON.stringify(initialLevel));

    // 重新创建场景
    createLevel();

    // 重新添加灯光和音频监听器
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));
    camera.add(audioListener);
}

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

init();
animate();

// 窗口调整
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
