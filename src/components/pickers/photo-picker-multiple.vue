<template>
    <v-sheet class="mx-auto bg-background border border-dashed" elevation="0" max-width="100%">
        <v-slide-group class="pa-1" show-arrows>
            <v-slide-group-item v-for="(src, index) in imagePreviews" :key="`preview-${index}`">
                <div class="ma-1">
                    <photo-picker-preview :height="height" :width="width" :src="src">
                        <template v-slot:actions>
                            <v-btn icon="mdi-close" size="x-small" variant="flat" color="surface"
                                class="position-fixed top-0 mt-3 ml-2" @click.stop="deleteImg(index, 'new')"></v-btn>
                        </template>
                    </photo-picker-preview>
                </div>
            </v-slide-group-item>
            <v-slide-group-item v-for="(src, index) in existingImages" :key="`existing-${index}`">
                <v-card class="ma-1">
                    <photo-picker-preview :height="height" :width="width" :src="src">
                        <template v-slot:actions>
                            <v-btn icon="mdi-close" size="x-small" variant="flat" color="surface"
                                class="position-fixed top-0 mt-3 ml-2"
                                @click.stop="deleteImg(index, 'existing')"></v-btn>
                        </template>
                    </photo-picker-preview>
                </v-card>
            </v-slide-group-item>
            <v-slide-group-item v-if="!readonly">
                <v-card class="ma-1 d-flex flex-column align-center justify-center" :height="height" :width="width"
                    @click.stop="overlay = true">
                    <v-overlay v-model="overlay" contained class="d-flex align-center justify-center" scrim="primary">
                        <v-btn-toggle color="primary">
                            <v-btn icon="mdi-camera-outline" rounded="0" @click.stop="openCamera()"></v-btn>
                            <v-btn icon="mdi-image-outline" rounded="0" @click.stop="uploadFile()"></v-btn>
                        </v-btn-toggle>
                    </v-overlay>
                    <v-icon icon="mdi-plus" size="40" class="opacity-60"></v-icon>
                </v-card>
            </v-slide-group-item>
        </v-slide-group>
        <v-dialog v-model="dialogCamera" width="600px" persistent>
            <camera-picker @upload-photo="(n) => uploadPhoto(n)" @close="closeCamera()"></camera-picker>
        </v-dialog>
        <v-file-input v-show="false" multiple ref="uploadInput" @change="onFileChange"
            accept="image/jpeg"></v-file-input>
    </v-sheet>
</template>

<script>
export default {
    props: {
        readonly: {
            type: Boolean,
            default: false
        },
        src: {
            type: Array,
            default: []
        },
        height: {
            type: String,
            default: '175'
        },
        width: {
            type: String,
            default: '125'
        },
        editable: {
            type: Boolean,
            default: false
        }
    },
    data: () => ({
        dialogCamera: false,
        overlay: false,
        imagePreviews: [], // Son los previews locales mostrados cuando recien se cargan las imagenes
        existingImages: [], // Son las imagenes (URL) que ya estaban guardadas
        imageDefault: 'api/image?url=photos/upload-image.jpg',
        fileList: [], // Es el array del input file que guarda los archivos que se enviaran
        deletedImages: [] // Para llevar un registro de las imágenes eliminadas
    }),
    mounted() {
        this.existingImages = this.src
    },
    methods: {
        /* Metodo para abrir el explorador de archivos */
        uploadFile() {
            this.$refs.uploadInput.click()
        },
        uploadPhoto(file) {
            const fileInput = this.$refs.uploadInput
            if (fileInput) {
                const files = fileInput.internalValue || []
                fileInput.internalValue = [...files, file]
                this.generatePreview(file);
            }
        },
        /* Metodo que carga los archivos y genera una visualizacion local */
        onFileChange() {
            const files = this.$refs.uploadInput.files
            if (files.length) {
                Array.from(files).forEach((file) => this.generatePreview(file))
            }
        },
        generatePreview(file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                this.fileList.push(file);
                this.imagePreviews.push(evt.target.result);
            };
            reader.readAsDataURL(file);
        },
        /* Metodo que elimina la visualizacion local de las imagenes y llena el array de deletedImages */
        deleteImg(index, type) {
            if (type === 'new') {
                this.imagePreviews.splice(index, 1)
                this.fileList.splice(index, 1)
            } else if (type === 'existing') {
                this.deletedImages.push(this.existingImages[index])
                this.existingImages.splice(index, 1)
            }
        },

        openCamera() {
            this.dialogCamera = true
        },
        closeCamera() {
            this.dialogCamera = false
        }
    },
    unmounted() {
        this.imagePreviews.length = 0
        this.existingImages.length = 0
        this.fileList.length = 0
        this.deletedImages.length = 0
    }
}
</script>