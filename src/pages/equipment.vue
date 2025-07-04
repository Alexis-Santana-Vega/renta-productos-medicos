<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12" sm="12" md="6" lg="3" xl="3" v-for="(item, i) in summary" :key="i">
                <summary-card-three :text="item.text" :number="item.number" :icon="item.icon" :color="item.color"
                    variant="text"></summary-card-three>
            </v-col>
            <v-col cols="12">
                <card-table icon="mdi-table-filter" title="Filtros">
                    <template v-slot:append>
                        <v-btn color="tertiary" icon="mdi-table-sync"></v-btn>
                    </template>
                    <v-row>
                        <v-col cols="12" sm="12" md="6" lg="4" xl="3">
                            <v-select label="Categoría" :items="categories" item-value="id" item-title="name" clearable
                                hide-details></v-select>
                        </v-col>
                        <v-col cols="12" sm="12" md="6" lg="4" xl="3">
                            <v-select label="Estado" :items="$productStatus" clearable hide-details></v-select>
                        </v-col>
                    </v-row>
                </card-table>
            </v-col>
            <v-col cols="12">
                <card-table icon="mdi-hospital-box-outline" title="Equipo Médico" subtitle="Gestión de equipo médico">
                    <v-row dense>
                        <v-col cols="12" sm="12" md="6" lg="8" xl="9">
                            <iterator-header>
                                <btn-custom prepend-icon="mdi-plus" :block="$isMobile()"
                                    @click="openDialogProduct()">Agregar
                                    Producto</btn-custom>
                            </iterator-header>
                        </v-col>
                        <v-col cols="12" sm="12" md="6" lg="4" xl="3">
                            <iterator-header>
                                <v-text-field v-model="controls.search" placeholder="Buscar" single-line hide-details
                                    clearable prepend-inner-icon="mdi-magnify"></v-text-field>
                            </iterator-header>
                        </v-col>
                        <v-col cols="12">
                            <v-data-table :items="products.items" :headers="headers" :search="controls.search">
                                <template v-slot:item.code="{ value }">
                                    <v-chip variant="text">{{ value }}</v-chip>
                                </template>
                                <template v-slot:item.name="{ item }">
                                    <div class="font-weight-medium">{{ item.name }}</div>
                                    <div class="text-caption">{{ item.description }}</div>
                                </template>
                                <template v-slot:item.category-name="{ value }">
                                    <v-chip>{{ value }}</v-chip>
                                </template>
                                <template v-slot:item.status="{ value }">
                                    <v-chip :color="$productStatusColor(value.toUpperCase())">{{ value }}</v-chip>
                                </template>
                                <template v-slot:item.actions="{ item }">
                                    <btn-tooltip icon="mdi-circle-edit-outline" text="Editar Producto" color="secondary"
                                        @click="editProduct(item)"></btn-tooltip>
                                    <v-menu>
                                        <template v-slot:activator="{ props }">
                                            <btn-tooltip icon="mdi-dots-vertical" v-bind="props">
                                            </btn-tooltip>
                                        </template>
                                        <v-sheet class="pa-2">
                                            <v-list class="pa-0" density="comfortable">
                                                <v-list-item title="Eliminar Producto" prepend-icon="mdi-delete-outline"
                                                    @click="deleteProduct(item)"></v-list-item>
                                            </v-list>
                                        </v-sheet>
                                    </v-menu>
                                </template>
                            </v-data-table>
                        </v-col>
                    </v-row>
                </card-table>
            </v-col>
        </v-row>
        <v-dialog v-model="controls.dialogProduct" persistent scrollable fullscreen>
            <card-dialog :title="titleDialog" :icon="iconDialog" :loading="controls.loadingProduct"
                :disabled="controls.loadingProduct" @close="closeDialogProduct()" actions fullscreen>
                <v-row>
                    <v-col cols="12">
                        <card-form title="Información General" icon="mdi-card-text-outline">
                            <v-row dense>
                                <v-col cols="12" sm="12" md="4" lg="3" xl="3">
                                    <v-text-field v-model="products.editedItem.barcode" label="Código de Barras *"
                                        :color="colorDialog" :rules="formRules.barcode" prepend-inner-icon="mdi-identifier"
                                        append-inner-icon="mdi-barcode-scan"
                                        @click:append-inner="console.log('Sacando el Scanner')"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="8" lg="3" xl="3">
                                    <v-select v-model="products.editedItem.categoryId" label="Categoría *" :color="colorDialog" prepend-inner-icon="mdi-tag-multiple-outline"
                                    :rules="formRules.categoryId" :items="categories" item-value="id" item-title="name"></v-select>
                                </v-col>
                                <v-col cols="12" sm="12" md="8" lg="6" xl="6">
                                    <v-text-field v-model="products.editedItem.name" label="Nombre Equipo *"
                                        :color="colorDialog" :rules="formRules.name"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                    <v-text-field v-model="products.editedItem.shortDescription"
                                        label="Descripción Corta *" :color="colorDialog" prepend-inner-icon="mdi-text-short"
                                        :rules="formRules.shortDescription"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                    <v-textarea v-model="products.editedItem.longDescription"
                                        label="Descripción Larga *" :color="colorDialog" prepend-inner-icon="mdi-text-long" :rules="formRules.longDescription"></v-textarea>
                                </v-col>
                            </v-row>
                        </card-form>
                    </v-col>
                    <v-col cols="12" sm="6" md="4" lg="4" xl="4">
                        <card-form title="Precios" icon="mdi-cash">
                            <v-row dense>
                                <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                    <v-text-field v-model="products.editedItem.purchasePrice" label="Precio Compra *"
                                        :color="colorDialog" prepend-inner-icon="mdi-currency-usd" :rules="formRules.purchasePrice"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                    <v-text-field v-model="products.editedItem.rentPrice"
                                        label="Precio Renta (por hora) *" :color="colorDialog" prepend-inner-icon="mdi-currency-usd"
                                        :rules="formRules.rentPrice"></v-text-field>
                                </v-col>
                            </v-row>
                        </card-form>
                    </v-col>
                    <v-col cols="12" sm="6" md="4" lg="4" xl="4">
                        <card-form title="Stock / Inventario" icon="mdi-list-box-outline">
                            <v-row dense>
                                <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                    <v-text-field v-model="products.editedItem.maxStock" label="Stock Máximo *"
                                        :color="colorDialog" prepend-inner-icon="" :rules="formRules.maxStock"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                    <v-text-field v-model="products.editedItem.minStock" label="Stock Mínimo *"
                                        :color="colorDialog" :rules="formRules.minStock"></v-text-field>
                                </v-col>
                            </v-row>
                        </card-form>
                    </v-col>
                    <v-col cols="12" sm="12" md="4" lg="4" xl="4">
                        <card-form title="Disponibilidad" class="h-100" icon="mdi-store-cog-outline">
                            <v-row dense>
                                <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                    <v-select v-model="products.editedItem.type" label="Oferta de Producto *"
                                        :color="colorDialog" :items="productTypes" chips></v-select>
                                </v-col>
                                <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                    <v-checkbox v-model="products.editedItem.active" label="Producto Activo"
                                        :color="colorDialog" hide-details></v-checkbox>
                                </v-col>
                            </v-row>
                        </card-form>
                    </v-col>
                    <v-col cols="12">
                        <card-form title="Imágenes del Equipo" icon="mdi-image-outline">
                            <photo-picker-multiple />
                        </card-form>
                    </v-col>
                    <v-col cols="12">
                        <card-form title="Proveedores">
                            <v-row dense>
                                <v-col cols="12" sm="12" md="6" lg="8" xl="9">
                                    <iterator-header>
                                        <btn-custom prepend-icon="mdi-plus" color="tertiary" :block="$isMobile()"
                                            @click="openDialogProvider()">Nuevo Proveedor</btn-custom>
                                    </iterator-header>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="4" xl="3">
                                    <iterator-header>
                                        <v-text-field v-model="controls.searchProvider" placeholder="Buscar" single-line
                                            hide-details clearable prepend-inner-icon="mdi-magnify"></v-text-field>
                                    </iterator-header>
                                </v-col>
                                <v-col cols="12">
                                    <v-data-table :items="products.editedItem.providers" :headers="headersProvider" :search="controls.searchProvider"></v-data-table>
                                </v-col>
                            </v-row>
                        </card-form>
                    </v-col>
                </v-row>
                <template v-slot:actions>
                    <v-spacer />
                    <btn-custom variant="tonal" :color="colorDialog" @click="closeDialogProduct()">Cancelar</btn-custom>
                    <btn-custom variant="elevated" :color="colorDialog" :disabled="!controls.validForm"
                        :loading="controls.loadingProduct" @click="saveProduct()">Guardar</btn-custom>
                </template>
            </card-dialog>
        </v-dialog>
        <v-dialog v-model="controls.dialogProvider" persistent scrollable width="900" :fullscreen="$isMobile()">
            <card-dialog :title="titleProvDialog" :icon="iconProvDialog" :loading="controls.loadingProvider" :disabled="controls.loadingProvider" actions mobile>
                <v-row>
                    <v-col cols="12">
                        <card-form title="Datos Personales">
                            <v-row dense>
                                <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                    <v-text-field v-model="providers.editedItem.firstName" label="Nombre(s) *" :rules="formProvRules.firstName"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                    <v-text-field v-model="providers.editedItem.lastName" label="Apellido(s) *" :rules="formProvRules.lastName"></v-text-field>
                                </v-col>
                            </v-row>
                        </card-form>
                    </v-col>
                    <v-col cols="12">
                        <card-form title="Información de Contacto">
                            <v-row dense>
                                <v-col cols="12" sm="12" md="4" lg="4" xl="4">
                                        <v-text-field v-model="providers.editedItem.mobilePhone" label="Tel. Móvil *"
                                            prepend-inner-icon="mdi-phone-outline" :color="colorProvDialog"
                                            :rules="formProvRules.mobilePhone"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="4" lg="4" xl="4">
                                        <v-text-field v-model="providers.editedItem.phoneOffice" label="Tel. Oficina"
                                            prepend-inner-icon="mdi-deskphone" :color="colorProvDialog"
                                            :rules="formProvRules.phoneOffice"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="4" lg="4" xl="4">
                                        <v-text-field v-model="providers.editedItem.phoneExt" label="Extensión"
                                            prepend-inner-icon="mdi-card-account-phone-outline" :color="colorProvDialog"
                                            :rules="formProvRules.phoneExt"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                        <v-text-field v-model="providers.editedItem.email" label="Email *"
                                            prepend-inner-icon="mdi-email-outline" :color="colorProvDialog"
                                            :rules="formProvRules.email"></v-text-field>
                                    </v-col>
                            </v-row>
                        </card-form>
                    </v-col>
                    <v-col cols="12" class="text-caption text-disabled">* Campos requeridos</v-col>
                </v-row>
                <template v-slot:actions>
                    <v-spacer />
                    <btn-custom variant="tonal" :color="colorProvDialog" @click="closeDialogProv()">Cancelar</btn-custom>
                    <btn-custom variant="elevated" :color="colorProvDialog" :disabled="!controls.validProvForm"
                        :loading="controls.loadingProvider" @click="saveProv()">Guardar</btn-custom>
                </template>
            </card-dialog>
        </v-dialog>
        <loading-overlay v-model="controls.loadingOverlay"></loading-overlay>
    </v-container>
</template>
<script>
import { maxLength, onlyEmail, onlyNumbers, required, requiredLength } from '@/plugins/globalRules';
import { computed, getCurrentInstance } from 'vue';
import { reactive, ref } from 'vue';

export default {
    setup() {
        const { proxy } = getCurrentInstance()
        const globals = proxy
        /* Data */
        const summary = ref([])
        const headers = [
            { key: 'code', title: 'CÓDIGO' },
            { key: 'name', title: 'NOMBRE' },
            { key: 'category-name', value: 'categoryName', title: 'CATEGORÍA' },
            { key: 'stock', title: 'STOCK' },
            { key: 'status', title: 'ESTADO' },
            { key: 'actions', title: 'ACCIONES', sortable: false, align: 'end' }
        ]
        const headersProvider = [
            { key: 'name', title: 'NOMBRE' },
            { key: 'mobile-phone', value: 'mobilePhone', title: 'TEL. MÓVIL' },
            { key: 'email', title: 'EMAIL' },
            { key: 'active', title: 'STATUS' },
            { key: 'actions', title: 'ACCIONES', sortable: false, align: 'end' }
        ]
        const controls = reactive({
            dialogProduct: false,
            dialogProvider: false,
            loadingProduct: false,
            loadingProvider: false,
            loadingOverlay: false,
            search: '',
            validForm: false,
            validProvForm: false,
            searchProvider: ''
        })
        const products = reactive({
            items: [],
            editedItem: {
                id: '', name: '', shortDescription: '', longDescription: '', barcode: '', purchasePrice: 0.0, rentPrice: 0.0, maxStock: 0, minStock: 0,
                type: ['Venta'], active: true, providers: []
            },
            defaultItem: {
                id: '', name: '', shortDescription: '', longDescription: '', barcode: '', purchasePrice: 0.0, rentPrice: 0.0, maxStock: 0, minStock: 0,
                type: ['Venta'], active: true, providers: []
            },
            editedIndex: -1
        })
        const providers = reactive({
            editedIndex: -1,
            editedItem: {
                id: '', idProduct: '', firstName: '', lastName: '', mobilePhone: '', phoneOffice: '', phoneExt: '', email: ''
            },
            defaultItem: {
                id: '', idProduct: '', firstName: '', lastName: '', mobilePhone: '', phoneOffice: '', phoneExt: '', email: ''
            }
        })
        const formRules = {
            name: [required('Nombre Equipo requerido'), maxLength(30, 'Nombre Equipo')],
            shortDescription: [required('Descripción Corta requerida'), maxLength(60, 'Descripción Corta')],
            longDescription: [required('Descripción Larga requerida'), maxLength(1200, 'Descripción Larga')],
            barcode: [required('Código de Barras requerido'), maxLength(10, 'Código de Barras'), onlyNumbers('Código de Barras')],
            purchasePrice: [required('Precio Venta requerido')],
            rentPrice: [required('Precio Renta requerido')],
            maxStock: [required('Stock Máximo requerido')],
            minStock: [required('Stock Mínimo requerido')],
            type: [required('Tipo de Producto requerido'), requiredLength('Tipo de Producto requerido')],
            providerName: [required('Nombre Proveedor requerido'), maxLength(60, 'Nombre Proveedor')]
        }
        const formProvRules = {
            firstName: [required('Nombre(s) requerido(s)'), maxLength(30, 'Nombre(s)')],
            lastName: [required('Apellido(s) requerido(s)'), maxLength(30, 'Apellido(s)')],
            mobilePhone: [required('Tel. Móvil requerido'), maxLength(15, 'Tel. Móvil'), onlyNumbers('Tel. Móvil')],
            phoneOffice: [maxLength(15, 'Tel. Oficina'), onlyNumbers('Tel. Oficina'), onlyNumbers('Tel. Oficina')],
            email: [required('Email requerido'), maxLength(60, 'Email'), onlyEmail()]
        }
        let categories = [
            { id: '1', name: 'Neonatal' },
            { id: '2', name: 'Laboratorio' },
            { id: '3', name: 'Respiratorio' }
        ]
        const productTypes = ['Venta', 'Renta', 'Ambos']
        /* Computed */
        const isEdited = computed(() => products.editedIndex !== -1)
        const titleDialog = computed(() => isEdited.value ? 'Editar Equipo' : 'Nuevo Equipo')
        const iconDialog = computed(() => isEdited.value ? 'mdi-circle-edit-outline' : 'mdi-plus')
        const colorDialog = computed(() => isEdited.value ? 'secondary' : 'primary')
        const isEditedProv = computed(() => providers.editedIndex !== -1)
        const titleProvDialog = computed(() => isEditedProv.value ? 'Editar Proveedor' : 'Nuevo Proveedor')
        const iconProvDialog = computed(() => isEditedProv.value ? 'mdi-circle-edit-outline' : 'mdi-plus')
        const colorProvDialog = computed(() => isEditedProv.value ? 'secondary' : 'primary')
        /* Methods */
        const initialize = () => {
            products.items.splice(0, products.items.length,
                { id: '1', categoryId: '1', code: '101012', name: 'Centrimax 12K', description: 'Centrífuga clínica de alta velocidad', categoryName: 'Laboratorio', stock: 2, status: 'Disponible' },
                { id: '2', categoryId: '2', code: '101020', name: 'PhotoCare LED', description: 'Luz azul para tratamiento de ictericia', categoryName: 'Neonatal', stock: 1, status: 'Suspendido' },
                { id: '3', categoryId: '1', code: '102021', name: 'AutoPipette X3', description: 'Pipeta electrónica de volumen variable', categoryName: 'Laboratorio', stock: 10, status: 'Ocupado' },
                { id: '4', categoryId: '3', code: '108520', name: 'NebulaCare Mini', description: 'Nebulizador portátil de alto rendimiento', categoryName: 'Respiratorio', stock: 5, status: 'Disponible' },
                { id: '5', categoryId: '3', code: '104000', name: 'SuctionMed V2', description: 'Aspirador eléctrico para secreciones', categoryName: 'Respiratorio', stock: 4, status: 'Disponible' },
                { id: '6', categoryId: '2', code: '500255', name: 'NeoMonitor V3', description: 'Monitorea signos vitales del recién nacido', categoryName: 'Neonatal', stock: 4, status: 'Ocupado' }
            )
            summary.value = [
                { text: 'Total', number: '6', icon: 'mdi-table-check', color: 'secondary' },
                { text: 'Disponibles', number: '3', icon: 'mdi-check-circle-outline', color: 'success' },
                { text: 'Rentados', number: '2', icon: 'mdi-table-cancel', color: 'warning' },
                { text: 'Mantenimiento', number: '1', icon: 'mdi-close-circle-outline', color: 'error' }
            ]
            categories = [
                { id: '1', name: 'Laboratorio' },
                { id: '2', name: 'Neonatal' },
                { id: '3', name: 'Respiratorio' }
            ]
        }
        const openDialogProduct = () => controls.dialogProduct = true
        const closeDialogProduct = () => {
            controls.dialogProduct = false
            globals.$nextTick(() => {
                products.editedItem = Object.assign({}, products.defaultItem)
                products.editedIndex = -1
            })
        }
        const editProduct = (item) => {
            controls.loadingOverlay = true
            setTimeout(() => {
                products.editedIndex = products.items.indexOf(item)
                products.editedItem = Object.assign({}, item)
                controls.loadingOverlay = false
                openDialogProduct()
            }, 500)
        }
        initialize()
        return { headers, summary, products, controls, categories, controls, openDialogProduct, closeDialogProduct, iconDialog, titleDialog, colorDialog, isEdited, editProduct, formRules, productTypes, headersProvider, titleProvDialog, colorProvDialog, iconProvDialog, providers, formProvRules }
    }
}
</script>