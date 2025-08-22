<template>
    <v-card color="background" class="h-100 d-flex flex-column">
        <div :class="{ fullscreen: fullscreen }" ref="wrapper" @fullscreenchange="onFullscreenChange"
            style="overflow: hidden;">
            <qrcode-stream :paused="controls.paused" :torch="torch.active" :constraints="selectedConstraints"
                :track="trackFunctionSelected.value" :formats="selectedBarcodeFormats" @error="onError"
                @detect="onDetect" @camera-on="onCameraReady">
                <!--
                *
                * Cambios de botones: INICIO
                *
                -->
                <!--Boton de flash y de fullscreen-->
                <div style="z-index: 3;" class="position-absolute right-0 bottom-0 mr-2 mb-4 d-flex flex-wrap ga-2">
                    <v-btn icon="mdi-flash-outline" @click="torch.active = !torch.active" v-if="torch.supported">
                    </v-btn>
                    <v-btn :icon="fullscreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
                        @click="fullscreen = !fullscreen"></v-btn>
                </div>
                <!--Boton de modo salida-->
                <v-btn icon="mdi-close" style="position: absolute; bottom: 16px; left: 9px; z-index: 3;"
                    @click="closeScanner()">
                </v-btn>
                <!--
                *
                * Cambios de botones: FIN
                *
                -->
                <!--Animacion CSS-->
                <div class="h-100 w-100 d-flex align-center justify-center overlay pb-4" v-if="!controls.loading">
                    <div class="scanner">
                        <div class="corner top-left" :class="{ 'corner-highlight': controls.animation }"></div>
                        <div class="corner top-right" :class="{ 'corner-highlight': controls.animation }"></div>
                        <div class="corner bottom-left" :class="{ 'corner-highlight': controls.animation }"></div>
                        <div class="corner bottom-right" :class="{ 'corner-highlight': controls.animation }"></div>
                        <div class="scan-line"></div>
                    </div>
                </div>
            </qrcode-stream>
            <v-dialog :model-value="controls.dialogEquipment" width="500" scrollable persistent :attach="$refs.wrapper" @after-enter="focusQuantity()">
                <card-dialog icon="mdi-hospital-box-outline" title="Información" @close="closeDialog()">
                    <card-form>
                        <v-form v-model="controls.valid" @submit.prevent="addEquipment()">
                            <v-row dense>
                                <v-col cols="12" class="text-center">
                                    <v-avatar size="64">
                                        <v-img :src="equipment.editedItem.photoUrl"></v-img>
                                    </v-avatar>
                                    <div class="text-body-1 font-weight-bold text-medium-emphasis my-2">{{
                                        equipment.editedItem.name }}
                                    </div>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field ref="quantityField" v-model="equipment.editedItem.quantity" label="Cantidad *"
                                        type="number" min="1" :rules="formRules.quantity"
                                        @keypress="onlyIntegerNumbers"></v-text-field>
                                </v-col>
                                <v-col cols="12" class="d-flex justify-end flex-wrap ga-2">
                                    <btn-custom variant="tonal" @click="closeDialog()">Cancelar</btn-custom>
                                    <btn-custom type="submit" :disabled="!controls.valid">Agregar</btn-custom>
                                </v-col>
                            </v-row>
                        </v-form>
                    </card-form>
                </card-dialog>
            </v-dialog>
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
    </v-card>
</template>

<script setup>
import { fakeApiGetUser } from '@/plugins/fakeApi'
import { ref, computed, reactive, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'
import beepSound from '@/assets/beep.mp3'
import { maxNumber, minNumber, onlyNumbers, required } from '@/plugins/globalRules'
import { onlyIntegerNumbers } from '@/plugins/formatters'
import { getCurrentInstance } from 'vue'

/** Data to global methods */
const { proxy } = getCurrentInstance()
const globals = proxy

/** Emits */
const emit = defineEmits(['addEquipment', 'closeScanner'])

/** Data ***/
const result = ref('')
const quantityField = ref(null)
/** Controls */
const controls = reactive({
    paused: false,
    dialogEquipment: false,
    valid: false,
    animation: false,
    loading: true
})
/** Torch controls */
const torch = reactive({
    active: false,
    supported: false
})
/** Fullscreen Controls */
const fullscreen = ref(false)
const wrapper = ref(null)
/** Data equipment */
const equipment = reactive({
    editedItem: { name: '', photoUrl: '', quantity: 1 },
    defaultItem: { name: '', photoUrl: '', quantity: 1 }
})
/** Validation Form Rules */
const formRules = {
    quantity: [required('Cantidad requerida'), onlyNumbers('Cantidad'), minNumber(1, 'Cantidad'), maxNumber(30, 'Cantidad')]
}
/** Audio Scanner */
let audioScanner = new Audio(beepSound)
/** Camera options */
const selectedConstraints = ref({ facingMode: 'environment' })
const constraintOptions = ref([
    { label: "rear camera", constraints: { facingMode: "environment" } },
    { label: "front camera", constraints: { facingMode: "user" } },
])
/*** Barcode Format Options ***/
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
/** Error message */
const error = ref('')
/** Watcher */
watch(fullscreen, (enterFullscreen) => {
    if (enterFullscreen) {
        requestFullscreen()
    } else {
        exitFullscreen()
    }
})
/** Computed Methods */
const selectedBarcodeFormats = computed(() => {
    return Object.keys(barcodeFormats.value).filter((format) => barcodeFormats.value[format])
})
/** Methods */
/** Fullscreen methods */
const requestFullscreen = () => {
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
const exitFullscreen = () => {
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
const onFullscreenChange = (event) => {
    // This becomes important when the user doesn't use the button to exit
    // fullscreen but hits ESC on desktop, pushes a physical back button on
    // mobile etc.
    fullscreen.value = document.fullscreenElement !== null
}
/*** Detection handling ***/
const onDetect = ([firstDetectedCode]) => {
    result.value = firstDetectedCode.rawValue.trim()
    controls.paused = true
    controls.animation = true
    audioScanner.play()
    fakeApiGetUser(result.value)
        .then(result => {
            equipment.editedItem = Object.assign({}, { ...result, codeValid: true, quantity: 1 })
            controls.dialogEquipment = true
        })
        .catch(error => {
            globals.$toastFullscreen().fire({ icon: 'warning', text: 'Código no reconocido' })
            controls.paused = false
        })
        .finally(() => {
            controls.animation = false
            result.value = ''
        })
}

const onCameraReady = async (capabilities) => {
    // NOTE: on iOS we can't invoke `enumerateDevices` before the user has given
    // camera access permission. `QrcodeStream` internally takes care of
    // requesting the permissions. The `camera-on` event should guarantee that this
    // has happened.
    try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const videoDevices = devices.filter(({ kind }) => kind === 'videoinput')
        constraintOptions.value = [
            ...videoDevices.map(({ deviceId, label }) => ({
                label: `${label} (ID: ${deviceId})`,
                constraints: { deviceId }
            }))
        ]
        torch.supported = capabilities.torch
        error.value = ''
    } catch (error) {
        error.value = `Error fetching devices: ${error.message}`
    } finally {
        controls.loading = false
    }
}
/*** Track Functions ***/
const paintCustom = (detectedCodes, ctx) => {
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
/*** Handling errors ***/
const onError = (err) => {
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
        error.value = 'Ocurrió un error al intentar acceder a la cámara.'
    }
}
/*** Handling Emits ***/
const addEquipment = () => {
    const data = {
        id: globals.$randomUUID(),
        productId: equipment.editedItem.productId,
        name: equipment.editedItem.name,
        quantity: equipment.editedItem.quantity,
        codeValid: equipment.editedItem.codeValid
    }
    emit('addEquipment', data)
    closeDialog()
}
const closeScanner = () => {
    emit('closeScanner')
}
const closeDialog = async () => {
    controls.dialogEquipment = false
    controls.paused = false
    await nextTick()
    equipment.editedItem = Object.assign({}, equipment.defaultItem)
}

const focusQuantity = async () => {
    await nextTick()
    quantityField.value.focus()
    quantityField.value.select()
}
</script>

<style scoped>
/* ----- Pantalla completa ----- */
.fullscreen {
    position: fixed;
    z-index: 5000;
    inset: 0;
}

/* ----- Línea de escaneo ----- */
.scan-line {
    position: absolute;
    top: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(to right,
            transparent 0%,
            white 20%,
            white 80%,
            transparent 100%);
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

/* ----- Overlay con recorte central ----- */
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
    margin-top: -8px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.3);
    z-index: 1;
    overflow: hidden;
}

/* ----- Área del escáner ----- */
.scanner {
    position: absolute;
    width: 80%;
    height: 70%;
    overflow: hidden;
}

/* ----- Esquinas del marco ----- */
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

/* ----- Destello en esquinas ----- */
.corner-highlight {
    animation: cornerFlash 0.3s ease-out;
}

@keyframes cornerFlash {

    0%,
    100% {
        width: 40px;
        height: 40px;
        border-width: 5px;
    }

    50% {
        width: 0;
        height: 0;
        border-width: 5px;
    }
}
</style>