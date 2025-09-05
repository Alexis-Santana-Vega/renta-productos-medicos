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
                            <audio-recorder v-model="audioRecorder" multiple />
                        </card-form>
                    </v-col>
                </v-row>
                <template v-slot:actions>
                    <v-spacer></v-spacer>
                    <btn-custom variant="tonal">Cancelar</btn-custom>
                    <btn-custom variant="flat" @click="sendAudios()">Guardar</btn-custom>
                </template>
            </card-dialog>
        </div>
    </v-container>
</template>
<script>
import { ref } from 'vue'
export default {
    props: [],
    setup(props, { emit }) {
        const audioRecorder = ref([])
        const sendAudios = () => {
            console.log(audioRecorder.value)
        }
        return {
            sendAudios,
            audioRecorder
        }
    }
}
</script>