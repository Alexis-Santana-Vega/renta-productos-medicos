<template>
    <v-container fluid>
        <card-table icon="mdi-elevator-down" title="Entradas"
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
                                        :items="inputType" @update:model-value="handleInputType"
                                        :rules="formRules.inputType"></v-select>
                                </v-col>
                                <template v-if="entraces.editedItem.inputType === 'TRANSFERENCIA'">
                                    <v-col cols="12" sm="12" md="4" lg="4" xl="4">
                                        <v-select v-model="entraces.editedItem.originLocationId"
                                            label="Locación de Origen *" prepend-inner-icon="mdi-map-marker-outline"
                                            :rules="formRules.originLocation"></v-select>
                                    </v-col>
                                </template>
                                <template v-if="entraces.editedItem.inputType === 'COMPRA'">
                                    <v-col cols="12" sm="12" md="4" lg="4" xl="4">
                                        <v-select v-model="entraces.editedItem.providerId" label="Proveedor *"
                                            prepend-inner-icon="mdi-handshake-outline"
                                            :rules="formRules.provider"></v-select>
                                    </v-col>
                                </template>
                                <v-col cols="12" sm="12" md="4" lg="4" xl="4"
                                    :offset-md="entraces.editedItem.inputType === null ? 4 : 0">
                                    <v-text-field v-model="entraces.editedItem.invoiceAmount" label="Monto de Factura *"
                                        prepend-inner-icon="mdi-cash" prefix="$"
                                        :disabled="entraces.editedItem.inputType !== 'COMPRA'"
                                        :rules="formRules.invoiceAmount"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                    <v-textarea v-model="entraces.editedItem.note" label="Nota/Descripción"
                                        prepend-inner-icon="mdi-text-long" :rules="formRules.note"></v-textarea>
                                </v-col>
                            </v-row>
                        </card-form>
                    </v-col>
                    <v-col cols="12">
                        <card-form icon="mdi-hospital-box-outline" title="Equipo a Recibir">
                            <v-data-table :items="entraces.editedItem.items" :headers="headersExitDialog"
                                items-per-page="-1" hide-default-footer>
                                <template v-slot:item.actions="{ item }">
                                    <btn-tooltip icon="mdi-delete-outline" text="Descartar entrada" color="error"
                                        @click="deleteEquipment(item)"></btn-tooltip>
                                </template>
                                <template v-slot:item.product-id="{ index }">
                                    <v-text-field v-model="entraces.editedItem.items[index].productId" inputmode="decimal" density="compact"
                                        variant="underlined" hide-details
                                        @keydown.enter="handleEnter($event, index, 'productId')"
                                        @keydown.tab="handleEnter($event, index, 'productId')"
                                        @keypress="onlyIntegerNumbers"></v-text-field>
                                </template>
                                <template v-slot:item.quantity="{ index }">
                                    <v-text-field v-model="entraces.editedItem.items[index].quantity" type="number" density="compact"
                                        variant="underlined" hide-details
                                        @keydown.enter="handleEnterStock($event, index)"
                                        @keydown.tab="handleEnterStock($event, index)"
                                        @keypress="onlyIntegerNumbers"></v-text-field>
                                </template>
                                <template v-slot:no-data>
                                    <btn-custom prepend-icon="mdi-plus" class="mt-4"
                                        @click="createNewRegister()">Agregar Equipo</btn-custom>
                                </template>
                            </v-data-table>
                        </card-form>
                    </v-col>
                </v-row>
                <v-tooltip text="Escanear Equipo">
                    <template v-slot:activator="{ props: activatorProps }">
                        <v-btn icon="mdi-barcode-scan" color="primary" size="x-large" rounded="circle"
                            style="z-index: 1000; position: fixed; right: 16px; bottom: 16px;" v-bind="activatorProps"
                            @click="openScanner()"></v-btn>
                    </template>
                </v-tooltip>
                <v-tooltip text="Agregar Equipo Manualmente">
                    <template v-slot:activator="{ props: activatorProps }">
                        <v-btn icon="mdi-plus" color="secondary" size="x-large" rounded="circle"
                            style="z-index: 1000; position: fixed; right: 90px; bottom: 16px;" v-bind="activatorProps"
                            @click="createNewRegister()"></v-btn>
                    </template>
                </v-tooltip>
                <v-dialog :model-value="controls.dialogScanner" persistent scrollable width="600">
                    <scanner-picker @add-equipment="(n) => addEquipment(n)"
                        @close-scanner="closeScanner()"></scanner-picker>
                </v-dialog>
            </card-dialog>
        </v-dialog>
    </v-container>
</template>
<script>
import { fakeApiGetUser } from '@/plugins/fakeApi';
import { onlyIntegerNumbers } from '@/plugins/formatters';
import { maxLength, required, requiredLength, onlyNumbers } from '@/plugins/globalRules';
import { computed, getCurrentInstance, reactive, nextTick, ref } from 'vue';

export default {
    setup() {
        const { proxy } = getCurrentInstance()
        const globals = proxy

        const controls = reactive({
            search: '',
            dialogExit: false,
            dialogScanner: false
        })
        const entraces = reactive({
            items: [],
            editedItem: {
                id: '',
                receptionDay: new Date().toISOString().slice(0, 10),
                inputType: null,
                note: '',
                invoiceAmount: '',
                originLocationId: null,
                providerId: null,
                items: []
            },
            defaultItem: {

            },
            editedIndex: -1
        })
        const formRules = {
            inputType: [required('Tipo de Entrada requerida'), requiredLength('Tipo de Entrada requerida')],
            invoiceAmount: [],
            note: [maxLength(300, 'Nota/Descripción')],
            originLocation: [required('Locación de Origen requerida')],
            provider: [required('Proveedor requerido')]
        }
        const formRulesTable = {
            productId: [onlyNumbers('Código de Barras')],
            quantity: [onlyNumbers('Cantidad')]
        }
        const headers = [
            { key: 'folio', title: 'FOLIO' },
            { key: '', title: '' },
            { key: '', title: '' },
            { key: '', title: '' }
        ]
        const headersExitDialog = [
            { key: 'actions', title: null, align: 'center', width: '40' },
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
        const createNewRegister = () => entraces.editedItem.items.push({ idProduct: '', name: '', stock: 0 })
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
        const handleEnter = (e, index, field) => {
            e.preventDefault()
            if (field === 'productId') {
                fakeApiGetUser(entraces.editedItem.items[index].productId)
                    .then(result => {
                        entraces.editedItem.items[index] = { ...result, quantity: 0 }
                        moveFocusToNext(e.target, 1)
                    })
                    .catch(error => {
                        globals.$toast.fire({ icon: 'error', text: 'Equipo no encontrado' })
                    })
            } else {
                moveFocusToNext(e.target, 1)
            }
            /*
            if (e.key === 'Enter') {
                e.preventDefault()
                moveFocusToNext(e.target, 1)
            }
            */
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
            entraces.editedItem.invoiceAmount = ''
        }

        const openScanner = () => {
            controls.dialogScanner = true
        }

        const closeScanner = () => {
            controls.dialogScanner = false
        }

        const addEquipment = (n) => {
            console.log(n)
            entraces.editedItem.items.push(n)
            globals.$toast.fire({ icon: 'success', text: 'Equipo agregado a la lista' })
        }

        const deleteEquipment = (item) => {
            globals.$deleteFromArray(entraces.editedItem.items, item.productId)
            globals.$toast.fire({ icon: 'success', text: 'Entrada descartada' })
        }

        return { controls, entraces, headers, openDialogExit, titleDialog, iconDialog, colorDialog, closeDialogExit, headersExitDialog, handleEnter, handleEnterStock, inputType, handleInputType, createNewRegister, openScanner, addEquipment, closeScanner, deleteEquipment, formRules, formRulesTable, onlyIntegerNumbers, }
    }
}
</script>