<template>
    <div>
        <button @click="playSound">Reproducir sonido</button>
        <button @click="stopSound">Detener sonido</button>
    </div>
</template>

<script>
import { onMounted } from 'vue';

export default {
    setup() {
        let audio = null
        const playSound = () => audio.play()
        const stopSound = () => {
            audio.pause()
            audio.currentTime = 0
        }
        onMounted(() => {
            audio = new Audio('/src/assets/beep.mp3')
        })
        return {
            playSound, stopSound
        }
    }
}
</script>