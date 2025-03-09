class AudioManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.audioListener = new THREE.AudioListener();
        this.sounds = {};
    }

    addSound(name, url, volume = 1) {
        const sound = new THREE.Audio(this.audioListener);
        const loader = new THREE.AudioLoader();
        
        return new Promise((resolve, reject) => {
            loader.load(url, (buffer) => {
                console.log(`Audio loaded: ${name} from ${url}`);
                sound.setBuffer(buffer);
                sound.setVolume(volume);
                this.sounds[name] = sound;
                resolve();
            }, 
            undefined, 
            (err) => {
                console.error(`Failed to load audio ${name} from ${url}:`, err);
                reject(err);
            });
        });
    }

    playSound(name) {
        if (!this.sounds[name]) {
            console.error(`Sound ${name} not found`);
            return;
        }

        console.log(`Playing sound: ${name}`);
        this.sounds[name].play();
    }

    attachToCamera(camera) {
        camera.add(this.audioListener);
    }
}

