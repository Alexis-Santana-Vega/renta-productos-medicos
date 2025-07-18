<template>
    <v-dialog :model-value="true" width="500" scrollable>
        <v-theme-provider theme="dark">
            <v-card rounded="0" color="background" class="h-100 d-flex flex-column justify-space-center">
                <!--Boton de flash-->
                <div style="z-index: 3;" class="position-absolute mt-2 ml-2 d-flex flex-wrap ga-2">
                    <v-btn icon="mdi-flash-outline" @click="torchActive = !torchActive" v-if="torchSupported">
                    </v-btn>
                    <v-btn icon="mdi-cog-outline" @click="controls.dialogConfig = true">
                    </v-btn>
                </div>
                <!--Area
                <v-btn icon="mdi-flash-outline" @click="torchActive = !torchActive" class="position-absolute mt-2 ml-2"
                    style="z-index: 3;">
                </v-btn>
                <v-btn icon="mdi-cog-outline" @click="torchActive = !torchActive" class="position-absolute mt-6 ml-6"
                    style="z-index: 3;">
                </v-btn>-->
                <!--Area de video-->
                <qrcode-stream :torch="torchActive" :constraints="selectedConstraints" :track="trackFunctionSelected.value"
                    :formats="selectedBarcodeFormats" @error="onError" @detect="onDetect" @camera-on="onCameraReady" />
                <loading-overlay v-model="loading"></loading-overlay>
                <!--Controles-->
                <div class="mx-2 mb-2">
                    <v-tabs v-model="selectedConstraints" align-tabs="center">
                        <v-tab v-for="(item, i) in constraintOptions" :key="i" :value="item.constraints">
                            {{ `Camara ${i + 1}` }}
                        </v-tab>
                    </v-tabs>
                    <p class="decode-result">
                        Last result: <b>{{ result }}</b>
                    </p>
                    <p class="error">{{ error }}</p>
                </div>
                <v-dialog :model-value="controls.dialogConfig" width="500" scrollable>
                    <card-dialog icon="mdi-cog-outline" title="Configuración" @close="controls.dialogConfig = false">
                        <v-row dense>
                            <v-col cols="12">
                                <v-select v-model="trackFunctionSelected" label="Cuadro de Lectura"
                                    :items="trackFunctionOptions" item-value="option" item-title="text"
                                    hide-details></v-select>
                            </v-col>
                            <v-col cols="12">
                                <v-label>Código de Barras soportados: </v-label>
                                <template v-for="option in Object.keys(barcodeFormats)" :key="option">
                                    <v-checkbox v-model="barcodeFormats[option]" :label="option" hide-details
                                        density="compact"></v-checkbox>
                                </template>
                            </v-col>
                        </v-row>
                        <!--
                        <select v-model="trackFunctionSelected">
                            <option v-for="option in trackFunctionOptions" :key="option.text" :value="option">
                                {{ option.text }}
                            </option>
                        </select>    
                        -->
                    </card-dialog>
                </v-dialog>
            </v-card>
        </v-theme-provider>
    </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { QrcodeStream } from 'vue-qrcode-reader'

/** controls */
const controls = reactive({
    dialogConfig: false
})

/** detection torch */
const torchActive = ref(false)
const torchSupported = ref(false)

/*** detection handling ***/

const result = ref('')

function onDetect(detectedCodes) {
    console.log(detectedCodes)
    result.value = JSON.stringify(detectedCodes.map((code) => code.rawValue))
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

function paintOutline(detectedCodes, ctx) {
    for (const detectedCode of detectedCodes) {
        const [firstPoint, ...otherPoints] = detectedCode.cornerPoints

        ctx.strokeStyle = 'red'

        ctx.beginPath()
        ctx.moveTo(firstPoint.x, firstPoint.y)
        for (const { x, y } of otherPoints) {
            ctx.lineTo(x, y)
        }
        ctx.lineTo(firstPoint.x, firstPoint.y)
        ctx.closePath()
        ctx.stroke()
    }
}
function paintBoundingBox(detectedCodes, ctx) {
    for (const detectedCode of detectedCodes) {
        const {
            boundingBox: { x, y, width, height }
        } = detectedCode

        ctx.lineWidth = 2
        ctx.strokeStyle = '#007bff'
        ctx.strokeRect(x, y, width, height)
    }
}
function paintCenterText(detectedCodes, ctx) {
    for (const detectedCode of detectedCodes) {
        const { boundingBox, rawValue } = detectedCode

        const centerX = boundingBox.x + boundingBox.width / 2
        const centerY = boundingBox.y + boundingBox.height / 2

        const fontSize = Math.max(12, (50 * boundingBox.width) / ctx.canvas.width)

        ctx.font = `bold ${fontSize}px sans-serif`
        ctx.textAlign = 'center'

        ctx.lineWidth = 3
        ctx.strokeStyle = '#35495e'
        ctx.strokeText(detectedCode.rawValue, centerX, centerY)

        ctx.fillStyle = '#5cb984'
        ctx.fillText(rawValue, centerX, centerY)
    }
}
const trackFunctionOptions = [
    { text: 'nothing (default)', value: undefined },
    { text: 'outline', value: paintOutline },
    { text: 'centered text', value: paintCenterText },
    { text: 'bounding box', value: paintBoundingBox }
]
const trackFunctionSelected = ref(trackFunctionOptions[1])

/*** barcode formats ***/

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

/*** error handling ***/

const error = ref('')

function onError(err) {
    error.value = `[${err.name}]: `

    if (err.name === 'NotAllowedError') {
        error.value += 'you need to grant camera access permission'
    } else if (err.name === 'NotFoundError') {
        error.value += 'no camera on this device'
    } else if (err.name === 'NotSupportedError') {
        error.value += 'secure context required (HTTPS, localhost)'
    } else if (err.name === 'NotReadableError') {
        error.value += 'is the camera already in use?'
    } else if (err.name === 'OverconstrainedError') {
        error.value += 'installed cameras are not suitable'
    } else if (err.name === 'StreamApiNotSupportedError') {
        error.value += 'Stream API is not supported in this browser'
    } else if (err.name === 'InsecureContextError') {
        error.value +=
            'Camera access is only permitted in secure context. Use HTTPS or localhost rather than HTTP.'
    } else {
        error.value += err.message
    }
}
</script>

<style scoped>
.error {
    font-weight: bold;
    color: red;
}

.barcode-format-checkbox {
    margin-right: 10px;
    white-space: nowrap;
    display: inline-block;
}
</style>