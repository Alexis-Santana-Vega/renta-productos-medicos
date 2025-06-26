<template>
    <v-theme-provider theme="dark">
        <v-card rounded="0" color="background" class="h-100 d-flex flex-column justify-space-center">
            <v-alert v-model="alert" color="warning" location="top end" class="text-body-2" rounded="0" closable
                density="compact">{{ errorMessage }}</v-alert>
            <!--Boton de flash-->
            <v-btn icon="mdi-flash-outline" @click="enableFlash()" class="position-absolute mt-2 ml-2"
                style="z-index: 3;" v-if="flashSupported">
            </v-btn>
            <!--Area de video-->
            <div>
                <video ref="video" autoplay class="w-100" style="background: rgba(0, 0, 0, 0.2);"></video>
                <canvas ref="canvas" class="d-none"></canvas>
            </div>
            <!--Area de control de Zoom-->
            <div>
                <v-tabs v-model="currentZoom" align-tabs="center" class="position-relative mt-n16" style="z-index: 2;"
                    @update:model-value="(v) => updateZoom(v)" v-if="zoomSuported">
                    <v-tab :value="1">1X</v-tab>
                    <v-tab :value="1.5">1.5X</v-tab>
                    <v-tab :value="2">2X</v-tab>
                </v-tabs>
            </div>
            <!--Area de eleccion de camara, tomar fotografia, guardar fotografia y cerrar camara-->
            <div class="mx-2 mb-2">
                <v-tabs v-model="selectedCamera" align-tabs="center">
                    <v-tab v-for="(item, i) in cameraOptions" :key="i" :value="item.value">
                        {{ `Camara ${i + 1}` }}
                    </v-tab>
                </v-tabs>
                <div class="d-flex justify-space-around align-center mt-4">
                    <v-avatar size="large" color="surface" @click="saveImage()" style="cursor: pointer;">
                        <v-img :src="screenshotSrc" v-if="screenshotSrc"></v-img>
                    </v-avatar>
                    <v-btn icon size="80" @click="takeScreenshot" rounded="circle">
                        <v-icon icon="mdi-circle" size="72"></v-icon>
                    </v-btn>
                    <v-btn icon="mdi-chevron-right" @click="closeCamera()"></v-btn>
                </div>
            </div>
        </v-card>
    </v-theme-provider>
</template>

<script>
export default {
    emits: ['close', 'uploadPhoto'],
    data: () => ({
        cameraOptions: [],
        selectedCamera: null,
        streamStarted: false,
        screenshotSrc: null,
        flashEnabled: false,
        flashSupported: false,
        zoomSuported: false,
        currentZoom: 1,
        minZoom: 0,
        maxZoom: 0,
        errorMessage: null,
        alert: false
    }),
    watch: {
        selectedCamera() {
            this.startStream()
        },
        errorMessage() {
            this.alert = true
        }
    },
    methods: {
        // Metodo para tomar la fotografia
        takeScreenshot() {
            try {
                // Declaracion de constantes enlaces por referencias a tags del componente
                const canvas = this.$refs.canvas
                const video = this.$refs.video
                // Verificar el alto y ancho para establecer si se puede capturar el video
                if (!video.videoWidth || !video.videoHeight) {
                    throw new Error('No hay un video activo para capturar.')
                }
                // Se le define el ancho y alto al canvan
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight
                // Se definen propiedades para marcar el canvas con la captura del video
                const context = canvas.getContext('2d')
                context.drawImage(video, 0, 0)
                // Conversion de canvas a DataURL
                this.screenshotSrc = canvas.toDataURL('image/jpeg')
                // Prepara la imagen para enviarla al input file exterior
                canvas.toBlob((blob) => {
                    if (!blob) {
                        this.errorMessage = 'No se pudo cargar la imagen tomada.'
                        return
                    }
                    const file = new File([blob], `photo-${Date.now()}.jpeg`, {
                        type: 'image/jpeg',
                    })
                    this.$emit('uploadPhoto', file)
                }, 'image/jpeg')
                this.errorMessage = null
            } catch (error) {
                this.errorMessage = 'Error al capturar la imagen.'
            }
        },
        // Metodo para guardar como archivo la imagen capturada
        saveImage() {
            if (!this.screenshotSrc) {
                this.errorMessage = 'No hay imagen para guardar.'
                return
            }
            const link = document.createElement("a")
            link.href = this.screenshotSrc
            link.download = 'image.jpeg'
            link.click()
        },
        // Metodo de inicializacion para obtener las camaras disponibles
        async initializeCameras() {
            try {
                // Verificar si la API de mediaDevices está disponible en el dispositivo
                if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
                    this.errorMessage = 'Tu navegador no soporta acceso a la cámara.'
                    return
                }
                // Definimos las constantes a utilizar
                const devices = await navigator.mediaDevices.enumerateDevices()
                const videoDevices = devices.filter((device) => device.kind === 'videoinput')
                // Verificamos si existen camaras disponibles
                if (videoDevices.length === 0) {
                    this.errorMessage = 'No se encontraron cámaras disponibles.'
                } else {
                    // Mapeamos a la variable cameraOptios para mostrar las opciones al usuario
                    this.cameraOptions = videoDevices.map((device) => ({
                        text: device.label || `Cámara ${device.deviceId}`,
                        value: device.deviceId,
                    }))
                    // Si hay cámaras disponibles, seleccionamos la primera
                    this.selectedCamera = this.cameraOptions[0].value
                }
            } catch (error) {
                this.errorMessage = 'Error al obtener las cámaras.'
            }
        },
        // Metodo para iniciar la transmision de video y habilitar los controles flash y zoom
        async startStream() {
            try {
                // Limpia las configuraciones anteriores
                await this.cleanConfigurations()
                // Verificar si la API getUserMedia está disponible
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    this.errorMessage = 'Tu navegador no soporta acceso a la cámara.'
                    return
                }
                // Generacion de stream de video
                const constraints = {
                    video: {
                        deviceId: this.selectedCamera ? { exact: this.selectedCamera } : undefined,
                    },
                }
                const stream = await navigator.mediaDevices.getUserMedia(constraints)
                this.$refs.video.srcObject = stream
                this.streamStarted = true
                this.errorMessage = null
                // Obtener la referencia del video para verificar soporte de zoom y flash
                const videoTrack = stream.getVideoTracks()[0]
                await this.checkZoomSupport(videoTrack)
                await this.checkFlashSupport(videoTrack)
            } catch (error) {
                if (error.message == 'Permission denied') {
                    this.errorMessage = 'Error al iniciar la cámara: permisos denegados'
                }
            }
        },
        // Metodo para verificar el soporte de zoom de la camara a iniciar
        async checkZoomSupport(videoTrack) {
            const capabilities = videoTrack.getCapabilities()
            if (capabilities.zoom) {
                this.minZoom = capabilities.zoom.min
                this.maxZoom = capabilities.zoom.max
                this.zoomSuported = true
            } else {
                this.zoomSuported = false
            }
        },
        // Metodo para actualizar el zoom de la camara
        async updateZoom(zoomLevel) {
            try {
                const videoTrack = this.$refs.video.srcObject.getVideoTracks()[0]
                if (videoTrack) {
                    await videoTrack.applyConstraints({
                        advanced: [{ zoom: zoomLevel }],
                    })
                    this.currentZoom = zoomLevel
                } else {
                    console.warn('No hay una cámara activa para controlar el flash.')
                }
            } catch (error) {
                this.errorMessage = 'Error al aplicar el zoom.'
            }
        },
        // Metodo para verificar el soporte de flash en la camara a iniciar
        async checkFlashSupport(videoTrack) {
            const capabilities = videoTrack.getCapabilities()
            this.flashSupported = capabilities.torch !== undefined
        },
        // Metodo para habilitar/deshabilitar flash
        async enableFlash() {
            try {
                // Toma el video actual
                const videoTrack = this.$refs.video.srcObject
                    ?.getVideoTracks()
                    ?.find((track) => track.readyState === 'live')
                // Verifica si hay un video activo
                if (videoTrack) {
                    const capabilities = videoTrack.getCapabilities()
                    // Verifica la capacidad de flash
                    if (capabilities.torch) {
                        const settings = videoTrack.getSettings()
                        const flashEnabled = settings.torch || false
                        this.flashEnabled = settings.torch || false
                        // Habilita/deshabilita flash
                        await videoTrack.applyConstraints({
                            advanced: [{ torch: !flashEnabled }],
                        })
                    } else {
                        console.warn('El dispositivo no soporta el uso del flash.')
                    }
                } else {
                    console.warn('No hay una cámara activa para controlar el flash.')
                }
            } catch (error) {
                console.error('Error al controlar el flash', error)
            }
        },
        // Metodo para limpiar las configuraciones del componente y de la camara
        async cleanConfigurations() {
            try {
                // Detener la transmisión actual
                const stream = this.$refs.video.srcObject
                if (stream) {
                    const tracks = stream.getTracks()
                    tracks.forEach((track) => track.stop()) // Detiene todas las pistas
                    this.$refs.video.srcObject = null // Limpia el video
                }
                // Restablecer configuraciones predeterminadas
                this.flashEnabled = false
                this.flashSupported = false
                this.zoomSuported = false
                this.currentZoom = 1
                this.minZoom = 0
                this.maxZoom = 0
                this.screenshotSrc = null
                this.errorMessage = null
            } catch (error) {
                console.error('Error al limpiar configuraciones: ', error)
            }
        },
        // Metodo para finalizar el uso de la camara
        async closeCamera() {
            await this.cleanConfigurations()
            this.$emit('close')
        }
    },
    mounted() {
        this.initializeCameras()
    },
}
</script>