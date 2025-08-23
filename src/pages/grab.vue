<template>
    <div class="main-controls" ref="mainSection">
        <!-- Botones de control -->
        <div class="d-flex ga-2 mb-4">
            <v-btn color="red" :disabled="isRecording" @click="startRecording" variant="elevated">
                <v-icon start>mdi-microphone</v-icon>
                Grabar
            </v-btn>

            <v-btn color="blue" :disabled="!isRecording" @click="stopRecording" variant="elevated">
                <v-icon start>mdi-stop</v-icon>
                Detener
            </v-btn>
        </div>

        <!-- Visualizador -->
        <canvas ref="canvas" class="visualizer"></canvas>

        <!-- Clips guardados -->
        <v-container class="mt-6">
            <v-row v-for="(clip, i) in clips" :key="i" align="center">
                <v-col cols="12" md="6">
                    <audio :src="clip.url" controls class="w-100"></audio>
                </v-col>
                <v-col cols="12" md="3">
                    <span class="text-subtitle-1 font-weight-medium cursor-pointer" @click="renameClip(i)">
                        {{ clip.name }}
                    </span>
                </v-col>
                <v-col cols="12" md="3" class="text-right">
                    <v-btn icon="mdi-delete" color="error" @click="deleteClip(i)"></v-btn>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>

<script>
import { ref, reactive, onMounted } from "vue";

export default {
    name: "AudioRecorder",
    setup() {
        const isRecording = ref(false);
        const clips = reactive([]);
        const canvas = ref(null);
        const mainSection = ref(null);

        let mediaRecorder;
        let chunks = [];
        let audioCtx;
        let canvasCtx;

        const startRecording = () => {
            if (!mediaRecorder) return;
            mediaRecorder.start();
            isRecording.value = true;
        };

        const stopRecording = () => {
            if (!mediaRecorder) return;
            mediaRecorder.stop();
            isRecording.value = false;
        };

        const deleteClip = (i) => {
            clips.splice(i, 1);
        };

        const renameClip = (i) => {
            const newName = prompt(
                "Ingresa un nuevo nombre para tu clip:",
                clips[i].name
            );
            if (newName) {
                clips[i].name = newName;
            }
        };

        const visualize = (stream) => {
            if (!audioCtx) {
                audioCtx = new AudioContext();
            }
            const source = audioCtx.createMediaStreamSource(stream);

            const bufferLength = 2048;
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = bufferLength;
            const dataArray = new Uint8Array(bufferLength);

            source.connect(analyser);

            const draw = () => {
                const WIDTH = canvas.value.width;
                const HEIGHT = canvas.value.height;

                requestAnimationFrame(draw);

                analyser.getByteTimeDomainData(dataArray);

                canvasCtx.fillStyle = "rgb(230,230,230)";
                canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                canvasCtx.lineWidth = 2;
                canvasCtx.strokeStyle = "rgb(50,50,50)";

                canvasCtx.beginPath();

                let sliceWidth = (WIDTH * 1.0) / bufferLength;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    let v = dataArray[i] / 128.0;
                    let y = (v * HEIGHT) / 2;

                    if (i === 0) {
                        canvasCtx.moveTo(x, y);
                    } else {
                        canvasCtx.lineTo(x, y);
                    }

                    x += sliceWidth;
                }

                canvasCtx.lineTo(canvas.value.width, canvas.value.height / 2);
                canvasCtx.stroke();
            };

            draw();
        };

        onMounted(() => {
            canvas.value.width = mainSection.value.offsetWidth;
            canvasCtx = canvas.value.getContext("2d");

            if (navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices
                    .getUserMedia({ audio: true })
                    .then((stream) => {
                        mediaRecorder = new MediaRecorder(stream);
                        visualize(stream);

                        mediaRecorder.ondataavailable = (e) => {
                            chunks.push(e.data);
                        };

                        mediaRecorder.onstop = () => {
                            const clipName =
                                prompt("Nombre del clip:", "Clip sin nombre") ||
                                "Clip sin nombre";

                            const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
                            chunks = [];
                            const audioURL = window.URL.createObjectURL(blob);

                            clips.push({ name: clipName, url: audioURL });
                        };
                    })
                    .catch((err) => console.log("Error: " + err));
            }
        });

        return {
            isRecording,
            clips,
            canvas,
            mainSection,
            startRecording,
            stopRecording,
            deleteClip,
            renameClip,
        };
    },
};
</script>

<style>
.visualizer {
    width: 100%;
    height: 120px;
    background: #f5f5f5;
    border-radius: 8px;
    margin-top: 16px;
}

.cursor-pointer {
    cursor: pointer;
}
</style>
