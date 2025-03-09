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
                sound.setBuffer(buffer);
                sound.setVolume(volume);
                this.sounds[name] = sound;
                resolve();
            }, undefined, reject);
        });
    }

    playSound(name) {
        if (this.sounds[name] && this.sounds[name].isLoaded) {
            this.sounds[name].play();
        }
    }

    attachToCamera(camera) {
        camera.add(this.audioListener);
    }
}
