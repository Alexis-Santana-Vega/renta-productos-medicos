<template>
    <div>
        <div class="border px-2 py-1 rounded-xl d-flex ga-4 align-center mb-6">
            <v-tooltip :text="isRecording ? 'Detener' : 'Iniciar'">
                <template v-slot:activator="{ props }">
                    <v-btn color="primary" :icon="isRecording ? 'mdi-stop' : 'mdi-microphone'" rounded="xl"
                        size="x-small" @click="handleRecording()" v-bind="props"></v-btn>
                </template>
            </v-tooltip>
            <span class="text-body-2">{{ formatTime(recordingTime) }}</span>
            <canvas ref="canvas" class="visualizer"></canvas>
        </div>
        <v-row v-for="(clip, i) in modelValue" :key="i">
            <v-col cols="12" class="d-flex align-center">
                <audio :src="clip.url" controls class="w-100"></audio>
                <btn-tooltip icon="mdi-delete-outline" text="Eliminar Audio" color="error" rounded="xl"
                    @click="deleteClip(i)"></btn-tooltip>
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { ref, reactive, watch, onMounted, onUnmounted, getCurrentInstance } from "vue";
import { useTheme } from "vuetify";

export default {
    props: {
        modelValue: { type: Array, default: () => [] },
        multiple: { type: Boolean, default: false }
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const { proxy } = getCurrentInstance();
        const globals = proxy;
        const theme = useTheme();

        const backgroundColor = ref(theme.current.value.colors.surface);
        const lineColor = ref(theme.current.value.colors.primary);
        const isRecording = ref(false);
        const canvas = ref(null);
        const recordingTime = ref(0);
        const timer = ref(null);

        let mediaRecorder;
        let chunks = [];
        let audioCtx;
        let canvasCtx;
        let frameCount = 0;
        const MIN_VOLUME = 0.03;

        const formatTime = (s) => {
            const m = Math.floor(s / 60).toString().padStart(2, "0");
            const sec = (s % 60).toString().padStart(2, "0");
            return `${m}:${sec}`;
        };

        const setupVisualizer = (stream) => {
            if (!audioCtx) {
                audioCtx = new AudioContext();
            }

            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;

            const dataArray = new Uint8Array(analyser.fftSize);
            source.connect(analyser);

            const drawVisualizer = () => {
                const WIDTH = canvas.value.width;
                const HEIGHT = canvas.value.height;

                requestAnimationFrame(drawVisualizer);
                frameCount++;
                if (frameCount % 3 !== 0) return;

                analyser.getByteTimeDomainData(dataArray);

                canvasCtx.fillStyle = backgroundColor.value;
                canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                canvasCtx.lineWidth = 3;
                canvasCtx.strokeStyle = isRecording.value ? lineColor.value : backgroundColor.value;
                canvasCtx.lineJoin = "round";
                canvasCtx.lineCap = "round";

                let prevY = HEIGHT / 2;
                canvasCtx.beginPath();
                let sliceWidth = WIDTH / analyser.fftSize;
                let x = 0;

                for (let i = 0; i < analyser.fftSize; i++) {
                    let v = dataArray[i] / 128.0 - 1;
                    if (Math.abs(v) < MIN_VOLUME) v = 0;

                    let y = (v * HEIGHT) / 2 + HEIGHT / 2;
                    y = (y + prevY * 2) / 3;
                    prevY = y;

                    i === 0 ? canvasCtx.moveTo(x, y) : canvasCtx.lineTo(x, y);
                    x += sliceWidth;
                }

                canvasCtx.lineTo(WIDTH, HEIGHT / 2);
                canvasCtx.stroke();
            };

            drawVisualizer();
        };

        const initMediaRecorder = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);

                setupVisualizer(stream);

                mediaRecorder.ondataavailable = (e) => {
                    chunks.push(e.data);
                };

                mediaRecorder.onstop = () => {
                    const clipName = globals.$randomUUID();
                    const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
                    chunks = [];
                    const url = window.URL.createObjectURL(blob);

                    // actualizar model del componente
                    const newClips = props.multiple ? [...props.modelValue, { blob, url }] : [{ blob, url }]
                    emit('update:modelValue', newClips)

                    // liberar micrófono después de grabar
                    stream.getTracks().forEach((track) => track.stop());
                    mediaRecorder = null; // reset para volver a pedir si se graba otra vez
                };
            } catch (err) {
                console.error("Error al inicializar audio:", err);
            }
        };

        const startRecording = async () => {
            if (!mediaRecorder) {
                await initMediaRecorder(); // pedir permiso SOLO cuando inicie
            }
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
            isRecording.value ? stopRecording() : startRecording();
        };

        const deleteClip = (i) => {
            const newClips = props.modelValue.filter((_, idx) => idx !== i)
            emit("update:modelValue", newClips)
        };

        onMounted(() => {
            const resizeCanvas = () => {
                canvas.value.width = canvas.value.offsetWidth;
                canvas.value.height = canvas.value.offsetHeight;
            };

            resizeCanvas();
            window.addEventListener("resize", resizeCanvas);

            canvasCtx = canvas.value.getContext("2d");

            onUnmounted(() => {
                window.removeEventListener("resize", resizeCanvas);
                clearInterval(timer.value);
                if (audioCtx) audioCtx.close();
            });
        });

        watch(
            () => theme.current.value,
            (newTheme) => {
                backgroundColor.value = newTheme.colors.surface;
                lineColor.value = newTheme.colors.primary;
            }
        );

        return {
            isRecording,
            canvas,
            startRecording,
            stopRecording,
            deleteClip,
            formatTime,
            recordingTime,
            handleRecording,
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
