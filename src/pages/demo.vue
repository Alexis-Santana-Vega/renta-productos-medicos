<template>
    <v-container>
        <div class="d-flex align-center justify-center">
            <card-dialog title="Ejemplo" icon="mdi-circle-edit-outline" width="800" actions>
                <v-row>
                    <v-col cols="12">
                        <card-form title="Formulario">
                            <v-row dense>
                                <v-col cols="12">
                                    <v-text-field label="Campo 1"></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field label="Campo 2"></v-text-field>
                                </v-col>
                            </v-row>
                        </card-form>
                    </v-col>
                    <v-col cols="12">
                        <card-form title="Audio">
                            <div class="border px-2 py-1 rounded-xl d-flex ga-4 align-center mb-6">
                                <v-tooltip :text="isRecording ? 'Detener' : 'Iniciar'">
                                    <template v-slot:activator="{ props }">
                                        <v-btn color="primary" :icon="isRecording ? 'mdi-stop' : 'mdi-microphone'"
                                            rounded="xl" size="x-small" @click="handleRecording()"
                                            v-bind="props"></v-btn>
                                    </template>
                                </v-tooltip>
                                <span class="text-body-2">{{ formatTime(recordingTime) }}</span>
                                <canvas ref="canvas" class="visualizer"></canvas>
                            </div>
                            <v-row v-for="(clip, i) in clips" :key="i">
                                <v-col cols="12" class="d-flex align-center">
                                    <audio :src="clip.url" controls class="w-100"></audio>
                                    <btn-tooltip icon="mdi-delete-outline" text="Eliminar Audio" color="error"
                                        rounded="xl" @click="deleteClip(i)"></btn-tooltip>
                                </v-col>
                            </v-row>
                        </card-form>
                    </v-col>
                </v-row>
                <template v-slot:actions>
                    <v-spacer></v-spacer>
                    <btn-custom variant="tonal">Cancelar</btn-custom>
                    <btn-custom variant="flat">Guardar</btn-custom>
                </template>
            </card-dialog>
        </div>
    </v-container>
</template>

<script>
import { ref, reactive, onMounted, watch, getCurrentInstance } from "vue";
import { useTheme } from "vuetify";

export default {
    setup() {
        const { proxy } = getCurrentInstance()
        const globals = proxy
        const theme = useTheme()
        const backgroundColor = ref(theme.current.value.colors.surface)
        const lineColor = ref(theme.current.value.colors.primary)
        const isRecording = ref(false);
        const clips = reactive([]);
        const canvas = ref(null);
        const recordingTime = ref(0);
        const timer = ref(null);
        let mediaRecorder;
        let chunks = [];
        let audioCtx;
        let canvasCtx;
        let frameCount = 0;
        const MIN_VOLUME = 0.03; // valores de 0 a 1

        const formatTime = (s) => {
            const m = Math.floor(s / 60).toString().padStart(2, "0");
            const sec = (s % 60).toString().padStart(2, "0");
            return `${m}:${sec}`;
        };

        const startRecording = () => {
            if (!mediaRecorder) return;
            mediaRecorder.start();
            isRecording.value = true;
            timer.value = setInterval(() => recordingTime.value++, 1000);
        };

        const stopRecording = () => {
            if (!mediaRecorder) return;
            mediaRecorder.stop();
            isRecording.value = false;
            recordingTime.value = 0;
            clearInterval(timer.value);
        };

        const handleRecording = () => {
            isRecording.value ? stopRecording() : startRecording()
        }

        const deleteClip = (i) => {
            clips.splice(i, 1);
        };

        // Actualizar colores del canvas
        watch(() => theme.current.value, (newTheme) => {
            backgroundColor.value = newTheme.colors.surface
            lineColor.value = newTheme.colors.primary
        })

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
                frameCount++;
                if (frameCount % 3 !== 0) return; // dibuja cada 3 frames → más lento
                analyser.getByteTimeDomainData(dataArray);

                canvasCtx.fillStyle = backgroundColor.value;
                canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                canvasCtx.lineWidth = 3;
                canvasCtx.strokeStyle = isRecording.value ? lineColor.value : backgroundColor.value;
                canvasCtx.beginPath();
                let sliceWidth = (WIDTH * 1.0) / bufferLength;
                let x = 0;
                for (let i = 0; i < bufferLength; i++) {
                    let v = dataArray[i] / 128.0;
                    v = v - 1; // centramos en 0 → -1 a 1
                    // Ignorar sonidos muy bajos
                    if (Math.abs(v) < MIN_VOLUME) v = 0;
                    let y = (v * HEIGHT) / 2 + HEIGHT / 2;
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
            const resizeCanvas = () => {
                canvas.value.width = canvas.value.offsetWidth;
                canvas.value.height = canvas.value.offsetHeight;
            }
            resizeCanvas();
            window.addEventListener("resize", resizeCanvas);
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
                            const clipName = globals.$randomUUID()
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
            startRecording,
            stopRecording,
            deleteClip,
            formatTime,
            recordingTime,
            handleRecording
        };
    },
};
</script>

<style>
.visualizer {
    width: 100%;
    height: 40px;
}

.cursor-pointer {
    cursor: pointer;
}
</style>
