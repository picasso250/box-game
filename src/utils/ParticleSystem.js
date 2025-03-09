class ParticleSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
    }

    createEffect(position, options = {}) {
        // 增加粒子数量
        const particleCount = options.count || 200;
        // 增加粒子大小
        const color = options.color || 0xffa500;
        const size = options.size || 0.5;
        const duration = options.duration || 2000;

        const particlesGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        // 扩大粒子的初始分布范围
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            positions[i3] = position.x + (Math.random() - 0.5) * 5;
            positions[i3 + 1] = position.y || 0;
            positions[i3 + 2] = position.z + (Math.random() - 0.5) * 5;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const particlesMaterial = new THREE.PointsMaterial({ color, size });
        const particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.gameEngine.addToScene(particles);

        const startTime = performance.now();
        const animate = () => {
            const currentTime = performance.now();
            const elapsed = currentTime - startTime;
            const progress = elapsed / duration;

            if (progress >= 1) {
                this.gameEngine.removeFromScene(particles);
                return;
            }

            const positions = particles.geometry.attributes.position.array;
            // 增加粒子的移动速度
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positions[i3 + 1] += 0.2;
                positions[i3] += (Math.random() - 0.5) * 0.2;
                positions[i3 + 2] += (Math.random() - 0.5) * 0.2;
            }
            particles.geometry.attributes.position.needsUpdate = true;
            particlesMaterial.size *= 0.95;

            requestAnimationFrame(animate);
        };

        animate();
    }

    createWinEffect() {
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
        this.gameEngine.addToScene(particles);

        const animate = () => {
            const positions = particles.geometry.attributes.position.array;
            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                positions[i3 + 1] += 0.1;
                positions[i3] += (Math.random() - 0.5) * 0.1;
                positions[i3 + 2] += (Math.random() - 0.5) * 0.1;
            }
            particles.geometry.attributes.position.needsUpdate = true;
            requestAnimationFrame(animate);
        };

        animate();
    }
}