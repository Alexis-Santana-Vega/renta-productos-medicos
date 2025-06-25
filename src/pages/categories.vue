<template>
    <v-container fluid>
        <card-table icon="mdi-tag-outline" title="Categorías" subtitle="Categorías de Equipo Médico">
            <v-row dense>
                <v-col cols="12" sm="12" md="6" lg="8" xl="9">
                    <iterator-header>
                        <btn-custom prepend-icon="mdi-plus" @click="openDialogForm()">Agregar Categoría</btn-custom>
                    </iterator-header>
                </v-col>
                <v-col cols="12" sm="12" md="6" lg="4" xl="3">
                    <iterator-header>
                        <v-text-field v-model="categories.search" placeholder="Buscar categoría" single-line hide-details clearable
                            prepend-inner-icon="mdi-magnify"></v-text-field>
                    </iterator-header>
                </v-col>
                <v-col cols="12">
                    <v-data-table :items="categories.items" :headers="categories.headers" :search="categories.search">
                        <template v-slot:item.name="{ value }">
                            <span class="font-weight-medium">{{ value }}</span>
                        </template>
                        <template v-slot:item.description="{ value }">
                            <span class="text-caption">{{ value }}</span>
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <btn-tooltip icon="mdi-delete-outline" text="Eliminar categoría" color="error"
                                @click="deleteCategory(item)"></btn-tooltip>
                            <btn-tooltip icon="mdi-circle-edit-outline" text="Editar categoría" color="secondary"
                                @click="editCategory(item)"></btn-tooltip>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </card-table>
        <v-dialog v-model="dialogForm" persistent scrollable width="1000" :fullscreen="$isMobile()">
            <card-dialog :title="titleDialog" :icon="iconDialog" @close="closeDialogForm()" actions>
                <v-row>
                    <v-col cols="12">
                        <card-form title="Información General">
                            <v-row dense>
                                <v-col cols="12">
                                    <v-text-field label="Nombre *" v-model="categories.editedItem.name"
                                        :color="colorDialog"></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-textarea label="Descripción *" v-model="categories.editedItem.description"
                                        :color="colorDialog"></v-textarea>
                                </v-col>
                                <v-col cols="12" class="text-caption text-disabled">* Campos requeridos</v-col>
                            </v-row>
                        </card-form>
                    </v-col>
                    <v-col cols="12">
                        <card-form title="Características" icon="mdi-tag-multiple-outline">
                            <v-data-table :items="categories.editedItem.features" :headers="features.headers"
                                :search="features.search">
                                <template v-slot:top>
                                    <v-row dense>
                                        <v-col cols="12" sm="12" md="6" lg="7" xl="7">
                                            <iterator-header>
                                                <btn-custom prepend-icon="mdi-plus" :block="$isMobile()" @click="openDialogFeature()">Nueva Característica</btn-custom>
                                            </iterator-header>
                                        </v-col>
                                        <v-col cols="12" sm="12" md="6" lg="5" xl="5">
                                            <iterator-header>
                                                <v-text-field v-model="features.search"
                                                    placeholder="Buscar característica" single-line hide-details clearable
                                                    prepend-inner-icon="mdi-magnify"></v-text-field>
                                            </iterator-header>
                                        </v-col>
                                    </v-row>
                                </template>
                                <template v-slot:item.measure="{ item }">
                                    <v-chip :prepend-icon="item.icon" :color="item.color" v-if="item.measure">
                                        <v-tooltip activator="parent" location="end" :text="item.abbr"
                                            :content-class="`bg-${item.color} font-weight-medium`"></v-tooltip>
                                        {{ item.measure }}</v-chip>
                                    <span v-else>-</span>
                                </template>
                                <template v-slot:item.actions="{ item }">
                                    <btn-tooltip icon="mdi-delete-outline" text="Eliminar característica" color="error"
                                        @click="deleteFeature(item)"></btn-tooltip>
                                    <btn-tooltip icon="mdi-circle-edit-outline" text="Editar característica"
                                        color="secondary" @click="editFeature(item)"></btn-tooltip>
                                </template>
                            </v-data-table>
                        </card-form>
                    </v-col>
                </v-row>
                <v-dialog v-model="dialogFeature" persistent scrollable width="500">
                    <card-dialog :title="titleDialogFeature" :icon="iconDialogFeature" @close="closeDialogFeature()" actions>
                        <card-form>
                            <v-row dense>
                                <v-col cols="12">
                                    <v-text-field v-model="features.editedItem.name" label="Nombre Característica *"
                                        :color="colorDialogFeature"></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-autocomplete v-model="features.editedItem.idMeasure" label="Unidad de Medida *"
                                        :color="colorDialogFeature" :items="features.measureItems" item-value="id"
                                        item-title="name" chips>
                                        <template v-slot:chip="{ props, item }">
                                            <v-chip v-bind="props" :color="item.raw.color" :prepend-icon="item.raw.icon"
                                                :text="item.raw.name"></v-chip>
                                        </template>
                                        <template v-slot:item="{ props, item }">
                                            <v-list-item v-bind="props" :title="item.raw.name">
                                                <template v-slot:prepend>
                                                    <v-avatar variant="tonal" :icon="item.raw.icon"
                                                        :color="item.raw.color" v-if="item.raw.id"></v-avatar>
                                                    <v-avatar variant="tonal" class="font-weight-bold"
                                                        v-else>N/A</v-avatar>
                                                </template>
                                            </v-list-item>
                                        </template>
                                    </v-autocomplete>
                                </v-col>
                                <v-col cols="12" class="text-caption text-disabled">* Campos requeridos</v-col>
                            </v-row>
                        </card-form>
                    <template v-slot:actions>
                    <v-spacer></v-spacer>
                    <btn-custom variant="tonal" :color="colorDialogFeature" @click="closeDialogFeature()">Cancelar</btn-custom>
                    <btn-custom variant="elevated" :color="colorDialogFeature" @click="saveFeature()">Guardar</btn-custom>
                </template>
                    </card-dialog>
                </v-dialog>
                <template v-slot:actions>
                    <v-spacer></v-spacer>
                    <btn-custom variant="tonal" :color="colorDialog" @click="closeDialogForm()">Cancelar</btn-custom>
                    <btn-custom variant="elevated" :color="colorDialog" @click="saveCategory()">Guardar</btn-custom>
                </template>
            </card-dialog>
        </v-dialog>
    </v-container>
</template>
<script>
export default {
    data: () => ({
        categories: {
            items: [],
            editedItem: {
                id: '', name: '', description: '', features: []
            },
            defaultItem: {
                id: '', name: '', description: '', features: []
            },
            editedIndex: -1,
            headers: [
                { key: 'name', title: 'NOMBRE' },
                { key: 'description', title: 'DESCRIPCIÓN', sortable: false },
                { key: 'actions', title: 'ACCIONES', sortable: false, align: 'end' }
            ],
            search: '',
        },
        features: {
            measureItems: [],
            editedItem: {
                id: '', idMeasure: null, name: ''
            },
            defaultItem: {
                id: '', idMeasure: null, name: ''
            },
            headers: [
                { key: 'name', title: 'NOMBRE' },
                { key: 'measure', title: 'MEDIDA' },
                { key: 'actions', title: 'ACCIONES', sortable: false, align: 'end' },
            ],
            search: '',
        },
        dialogForm: false,
        dialogFeature: false,
        loadingOverlay: false
    }),
    computed: {
        titleDialog() { return this.categories.editedIndex === -1 ? 'Nueva Categoría' : 'Editar Categoría' },
        iconDialog() { return this.categories.editedIndex === -1 ? 'mdi-plus' : 'mdi-circle-edit-outline' },
        colorDialog() { return this.categories.editedIndex === -1 ? 'primary' : 'secondary' },
        titleDialogFeature() { return this.features.editedIndex === -1 ? 'Nueva Característica' : 'Editar Característica' },
        iconDialogFeature() { return this.features.editedIndex === -1 ? 'mdi-plus' : 'mdi-circle-edit-outline' },
        colorDialogFeature() { return this.features.editedIndex === -1 ? 'primary' : 'secondary' },
    },
    created() {
        this.initialize()
    },
    methods: {
        /* API call */
        initialize() {
            this.categories.items = [
                { id: '1', name: 'Monitoreo', description: 'Miden signos vitales y corporales' },
                { id: '2', name: 'Respiratorio', description: 'Asisten en la respiración o suministro de oxígeno' },
                { id: '3', name: 'Laboratorio', description: 'Equipo para análisis clínicos' },
                { id: '4', name: 'Quirújico', description: 'Herramientas utilizadas en procedimientos médicos' },
                {
                    id: '5', name: 'Neonatal', description: 'Cuidado médico para recién nacidos', features: [
                        { id: '51', idCategory: '5', idMeasure: '1002', name: 'Peso', measure: 'Kilogramo', abbr: 'kg', icon: 'mdi-weight-kilogram', color: 'primary' },
                        { id: '52', idCategory: '5', idMeasure: null, name: 'Certificaciones', measure: null, abbr: null, icon: null, color: null },
                        { id: '53', idCategory: '5', idMeasure: '1001', name: 'Panel de control', measure: 'Pulgada', abbr: 'in', icon: 'mdi-ruler', color: 'tertiary' },
                    ]
                }
            ]
            this.features.measureItems = [
                { id: null, name: 'No aplica unidad', abbr: null, color: null, icon: null },
                { id: '1000', name: 'Grados Celsius', abbr: '°C', color: 'error', icon: 'mdi-thermometer-low' },
                { id: '1001', name: 'Kilogramo', abbr: 'kg', color: 'primary', icon: 'mdi-weight-kilogram' },
                { id: '1002', name: 'Pulgada', abbr: 'in', color: 'tertiary', icon: 'mdi-ruler' },
            ]
        },
        /* API call to delete category by its id */
        deleteCategory(item) {
            this.$swalConfirm(`Eliminar ${item.name}`, 'warning', `¿Desea eliminar esta categoría? Todos los productos asociados perderán esta referencia`)
                .then(result => {
                    if (result.isConfirmed) {
                        this.$deleteFromArray(this.categories.items, item.id)
                        this.$toast.fire({ icon: 'success', text: 'Categoría eliminada con éxito' })
                    }
                })
                .catch(error => this.$toast.fire({ icon: 'error', text: 'No fue posible eliminar el producto' }))
        },
        /* API call to get a category by its id */
        editCategory(item) {
            this.loadingOverlay = true
            setTimeout(() => {
                this.categories.editedIndex = this.categories.items.indexOf(item)
                this.categories.editedItem = Object.assign({}, item)
                this.loadingOverlay = false
                this.openDialogForm()
            }, 500)
        },
        openDialogForm() {
            this.dialogForm = true
        },
        closeDialogForm() {
            this.dialogForm = false
            this.$nextTick(() => {
                this.categories.editedItem = Object.assign({}, this.categories.defaultItem)
                this.categories.editedIndex = -1
            })
        },
        openDialogFeature() {
            this.dialogFeature = true
        },
        closeDialogFeature() {
            this.dialogFeature = false
            this.$nextTick(() => {
                this.features.editedItem = Object.assign({}, this.features.defaultItem)
                this.features.editedIndex = -1
            })
        },
        editFeature(item) {
            this.loadingOverlay = true
            setTimeout(() => {
                this.features.editedIndex = this.categories.editedItem.features.indexOf(item)
                this.features.editedItem = Object.assign({}, item)
                this.loadingOverlay = false
                this.openDialogFeature()
            }, 500)
        },
        deleteFeature(item) {
            this.$swalConfirm(`Eliminar ${item.name}`, 'warning', `¿Desea eliminar esta característica? Todos los productos asociados perderán esta referencia`)
                .then(result => {
                    if (result.isConfirmed) {
                        this.$deleteFromArray(this.categories.editedItem.features, item.id)
                        this.$toast.fire({ icon: 'success', text: 'Característica eliminada con éxito' })
                    }
                })
                .catch(error => this.$toast.fire({ icon: 'error', text: 'No fue posible eliminar la característica' }))
        }
    }
}
</script>