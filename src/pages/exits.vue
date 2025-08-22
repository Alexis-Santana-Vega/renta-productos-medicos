<template>
    <v-container fluid>
        <card-table icon="mdi-elevator-up" title="Salidas"
            subtitle="Registro de salidas de equipo médico de almacén">
            <v-row dense>
                <v-col cols="12" sm="12" md="6" lg="8" xl="9">
                    <iterator-header>
                        <btn-custom prepend-icon="mdi-plus" :block="$isMobile()" @click="openDialogExit()">Nueva
                            Salida</btn-custom>
                    </iterator-header>
                </v-col>
                <v-col cols="12" sm="12" md="6" lg="4" xl="3">
                    <iterator-header>
                        <v-text-field v-model="controls.search" placeholder="Buscar" single-line hide-details clearable
                            prepend-inner-icon="mdi-magnify"></v-text-field>
                    </iterator-header>
                </v-col>
                <v-col cols="12">
                    <v-data-table :items="exits.items" :headers="headers" :search="controls.search"
                        :loading="controls.loadingTable">
                        <template v-slot:loading>
                            <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
                        </template>
                        <template v-slot:item.id="{ value }">
                            <v-chip variant="text">{{ value }}</v-chip>
                        </template>
                        <template v-slot:item.exit-type="{ value }">
                            <v-chip :prepend-icon="$selectIconExit(value)">{{ $capitalizeFirstLetter(value)
                                }}</v-chip>
                        </template>
                        <template v-slot:item.amount="{ value }">
                            <v-icon icon="mdi-cash" color="success" class="mr-2"></v-icon>
                            <span>{{ `$ ${value}` }}</span>
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <btn-tooltip icon="mdi-open-in-new" text="Ver Salida" color="secondary"
                                @click="openEntrace(item)"></btn-tooltip>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </card-table>
        <v-dialog v-model="controls.dialogExit" fullscreen scrollable persistent>
            <card-dialog :icon="iconDialog" :title="titleDialog" fullscreen @close="closeDialogExit()">
                <v-form v-model="controls.validForm" @submit.prevent="console.log('Valido')">
                    <v-row>
                        <v-col cols="12">
                            <card-form icon="mdi-elevator-up" title="Salida de Equipo">
                                <v-row dense>
                                    <v-col cols="12" sm="12" md="2" lg="2" xl="2">
                                        <v-text-field v-model="exits.editedItem.id" label="Folio" hint="No editable"
                                            prepend-inner-icon="mdi-identifier" :counter="false"
                                            readonly></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="2" offset-md="8" lg="2" xl="2">
                                        <v-text-field v-model="exits.editedItem.datetime" type="datetime-local"
                                            label="Día Salida" hint="No editable"
                                            prepend-inner-icon="mdi-calendar-outline" :counter="false"
                                            readonly></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="4" lg="4" xl="4">
                                        <v-select v-model="exits.editedItem.exitType" label="Tipo de Salida *"
                                            :items="exitType" @update:model-value="handleExitType"
                                            :rules="formRules.exitType" :readonly="isEdited"></v-select>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="4" lg="4" xl="4">
                                        <template v-if="exits.editedItem.exitType === 'TRANSFERENCIA'">
                                            <v-select v-model="exits.editedItem.destinyLocationId"
                                                label="Locación de Destino *" prepend-inner-icon="mdi-map-marker-outline"
                                                :items="locationDestinies" item-value="locationId" item-title="name"
                                                :rules="formRules.destinyLocation" :readonly="isEdited"></v-select>
                                        </template>
                                        <template v-else-if="exits.editedItem.exitType === 'VENTA'">
                                            <v-select v-model="exits.editedItem.buyerId" label="Comprador *"
                                                prepend-inner-icon="mdi-handshake-outline" :items="buyers"
                                                item-value="buyerId" item-title="name" :rules="formRules.buyer"
                                                :readonly="isEdited"></v-select>
                                        </template>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="4" lg="4" xl="4">
                                        <v-text-field v-model="exits.editedItem.invoiceAmount"
                                            label="Monto de Factura *" inputmode="decimal" prepend-inner-icon="mdi-cash"
                                            prefix="$" :disabled="exits.editedItem.exitType !== 'VENTA'"
                                            :rules="formRules.invoiceAmount" :readonly="isEdited"
                                            @keydown="(e) => validateNumberInput(e, exits.editedItem.invoiceAmount)"
                                            @input="(e) => formatCurrencyInput(e, exits.editedItem, 'invoiceAmount')"
                                            :counter="false"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                        <v-textarea v-model="exits.editedItem.note" label="Nota/Descripción"
                                            prepend-inner-icon="mdi-text-long" :rules="formRules.note"
                                            :readonly="isEdited"></v-textarea>
                                    </v-col>
                                </v-row>
                            </card-form>
                        </v-col>
                        <v-col cols="12">
                            <card-form icon="mdi-hospital-box-outline" title="Equipo para Salida">
                                <v-data-table :items="exits.editedItem.items" :headers="headersExitDialog"
                                    items-per-page="-1" hide-default-footer fixed-header>
                                    <template v-slot:item.product-id="{ index }">
                                        <v-text-field v-model="exits.editedItem.items[index].productId"
                                            inputmode="numeric" density="compact" variant="underlined" hide-details
                                            @keydown.enter="handleEnter($event, index, 'productId')"
                                            @keydown.tab="handleEnter($event, index, 'productId')"
                                            @keypress="onlyIntegerNumbers"
                                            :ref="el => setInputRef(index, 'productId', el)"
                                            :rules="formRulesTable.productId" :readonly="isEdited || exits.editedItem.items[index].codeValid"
                                            :prepend-icon="exits.editedItem.items[index].codeValid ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'">
                                        </v-text-field>
                                    </template>
                                    <template v-slot:item.quantity="{ index }">
                                        <v-text-field v-model="exits.editedItem.items[index].quantity" type="number"
                                            min="1" density="compact" variant="underlined" hide-details
                                            @keydown.enter="handleEnterStock($event, index)"
                                            @keydown.tab="handleEnterStock($event, index)"
                                            @keypress="onlyIntegerNumbers"
                                            :ref="el => setInputRef(index, 'quantity', el)"
                                            :rules="formRulesTable.quantity" :readonly="isEdited"></v-text-field>
                                    </template>
                                    <template v-slot:item.actions="{ item }">
                                        <btn-tooltip icon="mdi-delete-outline" text="Descartar salida" color="error"
                                            @click="deleteEquipment(item)" :disabled="isEdited"></btn-tooltip>
                                    </template>
                                </v-data-table>
                            </card-form>
                        </v-col>
                        <v-col cols="12" v-if="!isEdited">
                            <btn-custom :disabled="!isValidForm">Generar Salida</btn-custom>
                        </v-col>
                    </v-row>
                </v-form>
                <v-tooltip text="Escanear Equipo" v-if="!isEdited">
                    <template v-slot:activator="{ props: activatorProps }">
                        <v-btn icon="mdi-barcode-scan" color="primary" size="x-large" rounded="circle"
                            style="z-index: 1000; position: fixed; right: 16px; bottom: 16px;" v-bind="activatorProps"
                            @click="openScanner()"></v-btn>
                    </template>
                </v-tooltip>
                <v-tooltip text="Agregar Equipo Manualmente" v-if="!isEdited">
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
        <loading-overlay v-model="controls.loadingOverlay"></loading-overlay>
    </v-container>
</template>
<script>
import { fakeApiGetExitById, fakeApiGetExits, fakeApiGetUser } from '@/plugins/fakeApi';
import { onlyIntegerNumbers, validateNumberInput, formatCurrencyInput } from '@/plugins/formatters';
import { maxLength, required, requiredLength, onlyNumbers, onlyAmount, minLength, minNumber, maxNumber } from '@/plugins/globalRules';
import { computed, getCurrentInstance, reactive, nextTick, ref } from 'vue';

export default {
    setup() {
        const { proxy } = getCurrentInstance()
        const globals = proxy

        const controls = reactive({
            search: '',
            dialogExit: false,
            dialogScanner: false,
            loadingTable: false,
            loadingOverlay: false,
            validForm: false
        })
        const exits = reactive({
            items: [],
            editedItem: {
                id: '',
                datetime: new Date().toISOString().slice(0, 16),
                exitType: null,
                destinyLocationId: null,
                buyerId: null,
                note: '',
                invoiceAmount: '0',
                items: []
            },
            defaultItem: {
                id: '',
                datetime: new Date().toISOString().slice(0, 16),
                exitType: null,
                destinyLocationId: null,
                buyerId: null,
                note: '',
                invoiceAmount: '0',
                items: []
            },
            editedIndex: -1
        })
        const formRules = {
            exitType: [required('Tipo de Salida requerida'), requiredLength('Tipo de Salida requerida')],
            invoiceAmount: [required('Monto de Factura requerido'), onlyAmount('Monto de Factura')],
            note: [maxLength(300, 'Nota/Descripción')],
            destinyLocation: [required('Locación de Destino requerida')],
            buyer: [required('Comprador requerido')],
        }
        const formRulesTable = {
            productId: [required('Código de Barras requerido'), onlyNumbers('Código de Barras'), maxLength(30, 'Código de Barras')],
            quantity: [required('Cantidad requerida'), onlyNumbers('Cantidad'), minNumber(1, 'Cantidad'), maxNumber(30, 'Cantidad')]
        }
        const headers = [
            { key: 'id', title: 'FOLIO', sortable: false },
            { key: 'exit-type', value: 'exitType', title: 'TIPO SALIDA' },
            { key: 'datetime', title: 'FECHA/HORA', sortable: false },
            { key: 'amount', title: 'MONTO', sortable: false },
            { key: 'actions', title: 'ACCIONES', sortable: false, align: 'end', width: '40' }
        ]
        const headersExitDialog = [
            { key: 'product-id', title: 'CÓDIGO', value: 'productId', sortable: false, width: '300' },
            { key: 'name', title: 'NOMBRE', sortable: false },
            { key: 'quantity', title: 'CANTIDAD', sortable: false, width: '200' },
            { key: 'actions', title: 'ACCIONES', sortable: false, align: 'center', width: '40' },
        ]
        const exitType = [
            { value: 'VENTA', title: 'Venta' },
            { value: 'TRANSFERENCIA', title: 'Transferencia' }
        ]
        const buyers = []
        const locationDestinies = []

        const inputRefs = ref({})

        // Guardar refs por fila y campo
        const setInputRef = (index, field, el) => {
            if (!inputRefs.value[index]) inputRefs.value[index] = {}
            inputRefs.value[index][field] = el
        }

        // Enfocar un campo específico
        const focusInput = async (index, field) => {
            await nextTick()
            inputRefs.value[index]?.[field]?.focus()
        }

        /** Computed */
        const isEdited = computed(() => exits.editedIndex !== -1)
        const titleDialog = computed(() => isEdited.value ? 'Ver Salida' : 'Nueva Salida')
        const iconDialog = computed(() => isEdited.value ? 'mdi-eye-outline' : 'mdi-plus')
        const colorDialog = computed(() => isEdited.value ? 'secondary' : 'primary')
        const isValidForm = computed(() => {
            const length = exits.editedItem.items.length > 0
            let codeValid = false
            if (length) {
                codeValid = exits.editedItem.items.every(i => i.codeValid === true)
            }
            return controls.validForm && length && codeValid
        })
        /** Methods */
        const openDialogExit = () => controls.dialogExit = true
        const closeDialogExit = () => {
            controls.dialogExit = false
            globals.$nextTick(() => {
                exits.editedItem = Object.assign({}, exits.defaultItem)
                exits.editedIndex = -1
            })
        }
        const createNewRegister = () => exits.editedItem.items.push({ id: globals.$randomUUID(), idProduct: '', name: '', quantity: 1, codeValid: false })
        const handleEnter = (e, index, field) => {
            e.preventDefault()
            if (field === 'productId') {
                fakeApiGetUser(exits.editedItem.items[index].productId)
                    .then(async result => {
                        exits.editedItem.items[index] = { ...result, quantity: 1, codeValid: true }
                        await nextTick()
                        focusInput(index, 'quantity')
                    })
                    .catch(error => {
                        globals.$toast.fire({ icon: 'error', text: 'Equipo no encontrado' })
                        Object.assign(exits.editedItem.items[index], { productId: '', name: '', quantity: 1, codeValid: false })
                    })
            }
        }
        const handleEnterStock = async (e, index) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
                if (exits.editedItem.items.length === (index + 1)) {
                    createNewRegister()
                }
                await nextTick()
                e.preventDefault()
                focusInput(index + 1, 'productId')
            }
        }
        const handleExitType = (e) => {
            exits.editedItem.invoiceAmount = '0'
            exits.editedItem.buyerId = null
            exits.editedItem.destinyLocationId = null
        }

        const openScanner = () => {
            controls.dialogScanner = true
        }

        const closeScanner = () => {
            controls.dialogScanner = false
        }

        const addEquipment = (n) => {
            console.log(n)
            exits.editedItem.items.push(n)
            globals.$toastFullscreen().fire({ icon: 'success', text: 'Equipo agregado a la lista' })
        }

        const deleteEquipment = (item) => {
            globals.$deleteFromArray(exits.editedItem.items, item.id)
            globals.$toast.fire({ icon: 'success', text: 'Salida descartada' })
        }

        const initialize = () => {
            controls.loadingTable = true
            fakeApiGetExits()
                .then(result => {
                    exits.items.splice(0, exits.items.length, ...result.exits)
                    locationDestinies.splice(0, 0, ...result.locationDestinies)
                    buyers.splice(0, 0, ...result.buyers)
                })
                .catch(error => {
                    // globals.$toast.fire({ icon: 'warning', text: error })
                })
                .finally(() => controls.loadingTable = false)
        }
        const openEntrace = item => {
            controls.loadingOverlay = true
            fakeApiGetExitById(item.id)
                .then(result => {
                    exits.editedIndex = exits.items.indexOf(item)
                    exits.editedItem = Object.assign({}, result)
                    openDialogExit()
                })
                .catch(error => {
                    globals.$toast.fire({ icon: 'error', text: error })
                })
                .finally(() => controls.loadingOverlay = false)
        }
        initialize()
        return { controls, exits, headers, openDialogExit, titleDialog, iconDialog, colorDialog, closeDialogExit, headersExitDialog, handleEnter, handleEnterStock, exitType, handleExitType, createNewRegister, openScanner, addEquipment, closeScanner, deleteEquipment, formRules, onlyIntegerNumbers, buyers, locationDestinies, openEntrace, isEdited, formatCurrencyInput, validateNumberInput, formRulesTable, isValidForm, setInputRef }
    }
}
</script>