<template>
    <v-container fluid>
        <card-table icon="mdi-elevator-up" title="Entradas"
            subtitle="Registro de entradas de equipo médico hacia almacén">
            <v-row dense>
                <v-col cols="12" sm="12" md="6" lg="8" xl="9">
                    <iterator-header>
                        <btn-custom prepend-icon="mdi-plus" :block="$isMobile()" @click="openDialogExit()">Nueva
                            Entrada</btn-custom>
                    </iterator-header>
                </v-col>
                <v-col cols="12" sm="12" md="6" lg="4" xl="3">
                    <iterator-header>
                        <v-text-field v-model="controls.search" placeholder="Buscar" single-line hide-details clearable
                            prepend-inner-icon="mdi-magnify"></v-text-field>
                    </iterator-header>
                </v-col>
                <v-col cols="12">
                    <v-data-table :items="entraces.items" :headers="headers" :search="controls.search">
                    </v-data-table>
                </v-col>
            </v-row>
        </card-table>
        <v-dialog v-model="controls.dialogExit" fullscreen scrollable persistent>
            <card-dialog :icon="iconDialog" :title="titleDialog" fullscreen @close="closeDialogExit()">
                <v-row>
                    <v-col cols="12">
                        <card-form icon="mdi-elevator-down" title="Recepción de Equipo">
                            <v-row dense>
                                <v-col cols="12" sm="12" md="2" lg="2" xl="2">
                                    <v-text-field v-model="entraces.editedItem.id" label="Folio"
                                        prepend-inner-icon="mdi-identifier" readonly></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="2" offset-md="8" lg="2" xl="2">
                                    <v-text-field v-model="entraces.editedItem.receptionDay" label="Día Recepción *"
                                        prepend-inner-icon="mdi-calendar-outline" type="date" readonly></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="4" lg="4" xl="4">
                                    <v-select v-model="entraces.editedItem.inputType" label="Tipo de Entrada *"
                                        :items="inputType" @update:model-value="handleInputType"></v-select>
                                </v-col>
                                <template v-if="entraces.editedItem.inputType === 'TRANSFERENCIA'">
                                    <v-col cols="12" sm="12" md="4" lg="4" xl="4">
                                        <v-select v-model="entraces.editedItem.originLocationId"
                                            label="Locación de Origen *"
                                            prepend-inner-icon="mdi-map-marker-outline"></v-select>
                                    </v-col>
                                </template>
                                <template v-if="entraces.editedItem.inputType === 'COMPRA'">
                                    <v-col cols="12" sm="12" md="4" lg="4" xl="4">
                                        <v-select v-model="entraces.editedItem.providerId" label="Proveedor *"
                                            prepend-inner-icon="mdi-handshake-outline"></v-select>
                                    </v-col>
                                </template>
                                <v-col cols="12" sm="12" md="4" lg="4" xl="4"
                                    :offset-md="entraces.editedItem.inputType === null ? 4 : 0">
                                    <v-text-field v-model="entraces.editedItem.invoiceAmount" type="number"
                                        label="Monto de Factura *" prepend-inner-icon="mdi-cash" prefix="$"
                                        :disabled="entraces.editedItem.inputType !== 'COMPRA'"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                    <v-textarea v-model="entraces.editedItem.note" label="Nota/Descripción"
                                        prepend-inner-icon="mdi-text-long"></v-textarea>
                                </v-col>
                            </v-row>
                        </card-form>
                    </v-col>
                    {{ entraces.editedItem.items }}
                    <v-col cols="12">
                        <card-form icon="mdi-hospital-box-outline" title="Equipo a Recibir">
                            <v-data-table :items="entraces.editedItem.items" :headers="headersExitDialog"
                                items-per-page="-1" hide-default-footer>
                                <template v-slot:item.actions="{ item }">
                                    <btn-tooltip icon="mdi-delete-outline" :text="`Eliminar ${item.name}`" color="error" @click="deleteEquipment(item)"></btn-tooltip>
                                </template>
                                <template v-slot:item.product-id="{ value, index }">
                                    <v-text-field v-model="entraces.editedItem.items[index].productId" density="compact" variant="underlined"
                                        hide-details @keydown.enter="handleEnter($event, index)" @keydown.tab="handleEnter($event, index)"></v-text-field>
                                </template>
                                <template v-slot:item.name="{ value, index }">
                                    <v-text-field :model-value="value" density="compact" variant="underlined"
                                        hide-details @keydown.enter="handleEnter($event, index)" @keydown.tab="handleEnter($event, index)"></v-text-field>
                                </template>
                                <template v-slot:item.quantity="{ value, index }">
                                    <v-text-field :model-value="value" density="compact" variant="underlined"
                                        hide-details @keydown.enter="handleEnter($event, index)" @keydown.tab="handleEnter($event, index)"></v-text-field>
                                </template>
                                <template v-slot:no-data>
                                    <btn-custom prepend-icon="mdi-plus" class="mt-4" @click="createNewRegister()">Agregar Equipo</btn-custom>
                                </template>
                            </v-data-table>
                        </card-form>
                    </v-col>
                </v-row>
                <v-tooltip text="Escanear Equipo">
                    <template v-slot:activator="{ props: activatorProps }">
                        <v-btn icon="mdi-barcode-scan" color="primary" size="x-large" rounded="circle"
                    style="z-index: 1000; position: fixed; right: 16px; bottom: 16px;" v-bind="activatorProps"></v-btn>
                    </template>
                </v-tooltip>
                
            </card-dialog>
        </v-dialog>
    </v-container>
</template>
<script>
import { computed, getCurrentInstance, reactive, nextTick, ref } from 'vue';

export default {
    setup() {
        const { proxy } = getCurrentInstance()
        const globals = proxy

        const controls = reactive({
            search: '',
            dialogExit: false,
        })
        const entraces = reactive({
            items: [],
            editedItem: {
                id: '',
                receptionDay: new Date().toISOString().slice(0, 10),
                inputType: null,
                note: '',
                invoiceAmount: 0,
                originLocationId: null,
                providerId: null,
                items: []
            },
            defaultItem: {

            },
            editedIndex: -1
        })
        const headers = [
            { key: 'folio', title: 'FOLIO' },
            { key: '', title: '' },
            { key: '', title: '' },
            { key: '', title: '' }
        ]
        const headersExitDialog = [
            { key: 'actions', title: null },
            { key: 'product-id', title: 'ID Producto', value: 'productId' },
            { key: 'name', title: 'Nombre Producto' },
            { key: 'quantity', title: 'Cantidad' },
        ]
        const inputType = [
            { value: 'COMPRA', title: 'Compra' },
            { value: 'TRANSFERENCIA', title: 'Transferencia' },
        ]
        /** Computed */
        const isEdited = computed(() => entraces.editedIndex !== -1)
        const titleDialog = computed(() => isEdited.value ? 'Ver Entrada' : 'Nueva Entrada')
        const iconDialog = computed(() => isEdited.value ? 'mdi-magnify' : 'mdi-plus')
        const colorDialog = computed(() => isEdited.value ? 'secondary' : 'primary')
        /** Methods */
        const openDialogExit = () => controls.dialogExit = true
        const closeDialogExit = () => {
            controls.dialogExit = false
            globals.$nextTick(() => {
                entraces.editedItem = Object.assign({}, entraces.defaultItem)
                entraces.editedIndex = -1
            })
        }
        const createNewRegister = () => entraces.editedItem.items.push({ idProduct: '', name: '', stock: '' })
        const moveFocusToNext = (current, position) => {
            const focusable = Array.from(
                document.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
            ).filter(el => !el.disabled && el.tabIndex >= 0)
            const index = focusable.indexOf(current)
            if (index > -1 && index < focusable.length - 1) {
                focusable[index + position].focus()
            }
        }
        const handleEnter = async (e, index) => {
            if (e.key === 'Enter') {
                e.preventDefault()
                moveFocusToNext(e.target, 1)
            }
        }
        const handleEnterStock = async (e, index) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
                createNewRegister()
                await nextTick()
                    e.preventDefault()
                    moveFocusToNext(e.target, 2)
            }
        }
        const handleInputType = (e) => {
            entraces.editedItem.invoiceAmount = 0
        }

        return { controls, entraces, headers, openDialogExit, titleDialog, iconDialog, colorDialog, closeDialogExit, headersExitDialog, handleEnter, handleEnterStock, inputType, handleInputType, createNewRegister }
    }
}
</script>