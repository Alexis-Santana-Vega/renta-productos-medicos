<template>
  <v-container class="h-100 d-flex align-center justify-center">
    <v-card class="d-flex flex-column align-center justify-center pa-4" height="280" width="250">
      <!-- Cronómetro cuando se graba -->
      <div v-if="isRecording" class="text-h6 mb-2">
        {{ formatTime(recordingTime) }}
      </div>

      <!-- Botón principal -->
      <v-btn
        :color="isRecording ? 'red' : 'primary'"
        class="rounded-circle"
        size="80"
        @mousedown="startRecording"
        @mouseup="stopRecording"
        @touchstart.prevent="startRecording"
        @touchend.prevent="stopRecording"
      >
        <v-icon size="40">
          {{ isRecording ? 'mdi-stop' : 'mdi-microphone' }}
        </v-icon>
      </v-btn>

      <!-- Visualizador onda -->
      <canvas ref="canvas" class="visualizer mt-4"></canvas>

      <!-- Acciones después de grabar -->
      <div v-if="lastClip" class="d-flex mt-4 ga-2">
        <v-btn icon color="green" @click="acceptClip">
          <v-icon>mdi-check</v-icon>
        </v-btn>
        <v-btn icon color="red" @click="cancelClip">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script>
import { ref, reactive, onMounted } from "vue";

export default {
  setup() {
    const isRecording = ref(false);
    const recordingTime = ref(0);
    const timer = ref(null);
    const lastClip = ref(null);

    const canvas = ref(null);
    let canvasCtx, mediaRecorder, chunks = [], audioCtx;

    const formatTime = (s) => {
      const m = Math.floor(s / 60).toString().padStart(2, "0");
      const sec = (s % 60).toString().padStart(2, "0");
      return `${m}:${sec}`;
    };

    const startRecording = () => {
      if (!mediaRecorder) return;
      mediaRecorder.start();
      isRecording.value = true;
      recordingTime.value = 0;
      timer.value = setInterval(() => recordingTime.value++, 1000);
    };

    const stopRecording = () => {
      if (!mediaRecorder) return;
      mediaRecorder.stop();
      isRecording.value = false;
      clearInterval(timer.value);
    };

    const acceptClip = () => {
      alert("Clip aceptado y enviado ✔");
      lastClip.value = null;
    };

    const cancelClip = () => {
      lastClip.value = null;
    };

    const visualize = (stream) => {
      if (!audioCtx) audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      const dataArray = new Uint8Array(analyser.fftSize);
      source.connect(analyser);

      const draw = () => {
        requestAnimationFrame(draw);
        const WIDTH = canvas.value.width;
        const HEIGHT = canvas.value.height;
        analyser.getByteTimeDomainData(dataArray);

        canvasCtx.fillStyle = "#f5f5f5";
        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

        canvasCtx.lineWidth = 2;
        canvasCtx.strokeStyle = isRecording.value ? "red" : "gray";

        canvasCtx.beginPath();
        let sliceWidth = WIDTH / dataArray.length;
        let x = 0;
        for (let i = 0; i < dataArray.length; i++) {
          let v = dataArray[i] / 128.0;
          let y = (v * HEIGHT) / 2;
          if (i === 0) canvasCtx.moveTo(x, y);
          else canvasCtx.lineTo(x, y);
          x += sliceWidth;
        }
        canvasCtx.lineTo(WIDTH, HEIGHT / 2);
        canvasCtx.stroke();
      };
      draw();
    };

    onMounted(() => {
      canvas.value.width = 220;
      canvas.value.height = 80;
      canvasCtx = canvas.value.getContext("2d");

      navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        mediaRecorder = new MediaRecorder(stream);
        visualize(stream);

        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
          chunks = [];
          const url = URL.createObjectURL(blob);
          lastClip.value = { url };
        };
      });
    });

    return {
      isRecording,
      recordingTime,
      formatTime,
      canvas,
      lastClip,
      startRecording,
      stopRecording,
      acceptClip,
      cancelClip,
    };
  },
};
</script>

<style>
.visualizer {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  background: #f5f5f5;
}
</style>
