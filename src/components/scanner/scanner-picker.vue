<template>
    <v-card color="background" class="h-100 d-flex flex-column">
        <div :class="{ fullscreen: fullscreen }" ref="wrapper" @fullscreenchange="onFullscreenChange"
            style="overflow: hidden;">
            <qrcode-stream :torch="torchActive" :constraints="selectedConstraints" :track="trackFunctionSelected.value"
                :formats="selectedBarcodeFormats" @error="onError" @detect="onDetect" @camera-on="onCameraReady">
                <!--Boton de flash-->
                <div style="z-index: 3;" class="position-absolute mt-2 ml-2 d-flex flex-wrap ga-2">
                    <v-btn icon="mdi-flash-outline" @click="torchActive = !torchActive" v-if="torchSupported">
                    </v-btn>
                    <v-btn icon="mdi-close" @click="closeScanner()">
                    </v-btn>
                </div>
                <v-btn :icon="fullscreen ? 'mdi-fullscreen' : 'mdi-fullscreen-exit'"
                    :style="`position: absolute; bottom: ${fullscreen ? '10' : '20'}px; right: 10px; z-index: 3;`"
                    @click="fullscreen = !fullscreen"></v-btn>
                <div class="h-100 w-100 d-flex align-center justify-center overlay pb-4">
                    <div class="scanner">
                        <div class="corner top-left" :class="{ 'scan-line-highlight': isUpdate }"></div>
                        <div class="corner top-right" :class="{ 'scan-line-highlight': isUpdate }"></div>
                        <div class="corner bottom-left" :class="{ 'scan-line-highlight': isUpdate }"></div>
                        <div class="corner bottom-right" :class="{ 'scan-line-highlight': isUpdate }"></div>
                        <div class="scan-line"></div>
                    </div>
                </div>
            </qrcode-stream>
        </div>
        <!--Controles-->
        <div class="position-relative mt-n2 pa-2 bg-surface" style="overflow: hidden;">
            <v-tabs v-model="selectedConstraints" align-tabs="center">
                <v-tab v-for="(item, i) in constraintOptions" :key="i" :value="item.constraints">
                    {{ `Camara ${i + 1}` }}
                </v-tab>
            </v-tabs>
            <v-alert color="warning" variant="tonal" class="text-center text-body-2 mt-2"
                icon="mdi-alert-circle-outline" v-if="error">{{ error
                }}</v-alert>
        </div>
        <v-dialog :model-value="controls.dialogEquipment" width="500" scrollable>
            <card-dialog icon="mdi-hospital-box-outline" title="Información">
                <card-form>
                    <v-form @submit.prevent="addEquipment()">
                        <v-row dense>
                            <v-col cols="12" class="text-center">
                                <v-avatar size="64">
                                    <v-img :src="equipment.photoUrl"></v-img>
                                </v-avatar>
                                <div class="text-body-1 font-weight-bold text-medium-emphasis my-2">{{ equipment.name }}
                                </div>
                            </v-col>
                            <v-col cols="12">
                                <v-text-field v-model="equipment.quantity" label="Cantidad *"></v-text-field>
                            </v-col>
                            <v-col cols="12" class="d-flex justify-end flex-wrap ga-2">
                                <btn-custom variant="tonal">Cancelar</btn-custom>
                                <btn-custom type="submit">Agregar</btn-custom>
                            </v-col>
                        </v-row>
                    </v-form>
                </card-form>
            </card-dialog>
        </v-dialog>
        <loading-overlay v-model="loading" contained></loading-overlay>
    </v-card>
</template>

<script setup>
import { fakeApiGetUser } from '@/plugins/fakeApi'
import { ref, computed, reactive, watch, onMounted, onBeforeUnmount } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import sonido from '@/assets/beep.mp3'

/** Emits */
const emit = defineEmits(['addEquipment', 'closeScanner'])

/** Data ***/
/** Controls */
const controls = reactive({
    dialogEquipment: false
})
const isUpdate = ref(false)
const equipment = ref({ id: '', name: '', photoUrl: '', quantity: 0 })

/** Fullscreen Controls */
const fullscreen = ref(false)
const wrapper = ref(null)

watch(fullscreen, (enterFullscreen) => {
    console.log(enterFullscreen)
    if (enterFullscreen) {
        requestFullscreen()
    } else {
        exitFullscreen()
    }
})

function requestFullscreen() {
    const elem = wrapper.value

    if (!elem) return

    if (elem.requestFullscreen) {
        elem.requestFullscreen()
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen()
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen()
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen()
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen()
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
    }
}

/** Detection torch */
const torchActive = ref(false)
const torchSupported = ref(false)

/*** Detection handling ***/

const result = ref('')

/** Audio Scanner */
let audioScanner = new Audio(sonido)

function onDetect(detectedCodes) {
    // console.log(detectedCodes) // To detect Code and view info
    result.value = detectedCodes[0].rawValue.trim()
    audioScanner.play()
    isUpdate.value = true
    fakeApiGetUser(result.value)
        .then(result => {
            equipment.value = { ...result }
            controls.dialogEquipment = true
        })
        .catch(error => console.error("Error: ", error.message))
        .finally(() => isUpdate.value = false)
}

/*** select camera ***/

const selectedConstraints = ref({ facingMode: 'environment' })
const constraintOptions = ref([
    { label: "rear camera", constraints: { facingMode: "environment" } },
    { label: "front camera", constraints: { facingMode: "user" } },
])
const loading = ref(true)

async function onCameraReady(capabilities) {
    // NOTE: on iOS we can't invoke `enumerateDevices` before the user has given
    // camera access permission. `QrcodeStream` internally takes care of
    // requesting the permissions. The `camera-on` event should guarantee that this
    // has happened.
    try {
        loading.value = true
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(({ kind }) => kind === 'videoinput')

        constraintOptions.value = [
            ...videoDevices.map(({ deviceId, label }) => ({
                label: `${label} (ID: ${deviceId})`,
                constraints: { deviceId }
            }))
        ]
        torchSupported.value = capabilities.torch
        error.value = ''
    } catch (error) {
        error.value = `Error fetching devices: ${error.message}`
    } finally {
        loading.value = false
    }
}

/*** track functons ***/
const paintCustom = (detectedCodes, ctx) => {
    console.log(detectedCodes)
    console.log(ctx)
    for (const detectedCode of detectedCodes) {
        const {
            boundingBox: { x, y, width, height }
        } = detectedCode

        ctx.lineWidth = 2
        ctx.strokeStyle = '#FFFFFF'
        ctx.strokeRect(x, y, width, height)
    }
}
const trackFunctionSelected = ref({ text: 'Custom Track', value: paintCustom })

/*** Formatos de codigos ***/
const barcodeFormats = ref({
    // aztec: false,
    code_128: true,
    code_39: true,
    code_93: false, // optional
    codabar: false, // optional
    // databar: false, 
    // databar_expanded: false,
    data_matrix: true,
    // dx_film_edge: false,
    ean_13: true,
    ean_8: false, // optional
    itf: true,
    // maxi_code: false, 
    // micro_qr_code: false,
    pdf417: false, // optional
    qr_code: true,
    // rm_qr_code: false,
    upc_a: true,
    upc_e: false, // optional
    // linear_codes: false,
    // matrix_codes: false
})
const selectedBarcodeFormats = computed(() => {
    return Object.keys(barcodeFormats.value).filter((format) => barcodeFormats.value[format])
})

/*** Manejo de errores ***/
const error = ref('')
/** Función modificada de la original de la documentación */
function onError(err) {
    error.value = `[${err.name}]: `
    if (err.name === 'NotAllowedError') {
        error.value = 'Por favor, permite el acceso a la cámara.'
    } else if (err.name === 'NotFoundError') {
        error.value = 'No se encontró cámara en tu dispositivo.'
    } else if (err.name === 'NotSupportedError' || err.name === 'InsecureContextError') {
        error.value = 'Esta función requiere una conexión segura (usa HTTPS).'
    } else if (err.name === 'NotReadableError') {
        error.value = 'No se puede usar la cámara. ¿Está en uso por otra app?'
    } else if (err.name === 'OverconstrainedError') {
        error.value = 'Tu cámara no es compatible.'
    } else if (err.name === 'StreamApiNotSupportedError') {
        error.value = 'Tu navegador no permite usar la cámara.'
    } else {
        // Mensaje para errores no controlados
        error.value = 'Ocurrió un error al intentar acceder a la cámara.'
    }
}

/*** Manejo de las funciones de pantalla completa ***/
function onFullscreenChange(event) {
    // This becomes important when the user doesn't use the button to exit
    // fullscreen but hits ESC on desktop, pushes a physical back button on
    // mobile etc.
    fullscreen.value = document.fullscreenElement !== null
}

/*** Manejo de eventos posterior a escaneo del código de barras ***/
const addEquipment = () => {
    emit('addEquipment', equipment.value)
    controls.dialogEquipment = false
    result.value = ''
}
const closeScanner = () => {
    emit('closeScanner')
}
</script>

<style scoped>
.fullscreen {
    position: fixed;
    z-index: 5000;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;
}

.scan-line {
    position: absolute;
    width: 100%;
    height: 2px;
    background: linear-gradient(to right, transparent 0%, white 20%, white 80%, transparent 100%);
    top: 0;
    animation: scan 8s ease-in-out infinite;
}

@keyframes scan {

    0%,
    100% {
        top: 0%;
    }

    50% {
        top: 100%;
    }
}

.overlay {
    position: absolute;
}

.overlay::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80%;
    height: 70%;
    transform: translate(-50%, -50%);
    z-index: 1;
    margin: 0px 0px 0px 0px;
    margin-top: -8px;
    border: 1px solid rgba(255, 255, 255, .3);
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
    overflow: hidden;
}

.scanner {
    position: absolute;
    width: 80%;
    height: 70%;
    overflow: hidden;
}

.corner {
    position: absolute;
    width: 30px;
    height: 30px;
    border: 3px solid rgba(255, 255, 255, 1);
}

.top-left {
    top: 0;
    left: 0;
    border-right: none;
    border-bottom: none;
}

.top-right {
    top: 0;
    right: 0;
    border-left: none;
    border-bottom: none;
}

.bottom-left {
    bottom: 0;
    left: 0;
    border-right: none;
    border-top: none;
}

.bottom-right {
    bottom: 0;
    right: 0;
    border-left: none;
    border-top: none;
}

.scan-line-highlight {
    animation: cornerFlash .3s ease-out;
}

@keyframes cornerFlash {
    0% {
        width: 40px;
        height: 40px;
        border-width: 5px;
    }
    50% {
        width: 0px;
        height: 0px;
        border-width: 5px;
    }
    100% {
        width: 40px;
        height: 40px;
        border-width: 5px;
    }
}
</style>