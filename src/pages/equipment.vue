<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12" sm="12" md="6" lg="3" xl="3" v-for="(item, i) in summary" :key="i">
                <summary-card-three :text="item.text" :number="item.number" :icon="item.icon"
                    :color="item.color"></summary-card-three>
            </v-col>
            <v-col cols="12">
                <card-table icon="mdi-table-filter" title="Filtros">
                    <template v-slot:append>
                        <v-btn color="tertiary" icon="mdi-table-sync"></v-btn>
                    </template>
                    <v-row>
                        <v-col cols="12" sm="12" md="6" lg="4" xl="3">
                            <v-select label="Categoría" :items="categories" item-value="id" item-title="name" clearable hide-details></v-select>
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
                                    @click="openDialogForm()">Agregar Producto</btn-custom>
                            </iterator-header>
                        </v-col>
                        <v-col cols="12" sm="12" md="6" lg="4" xl="3">
                            <iterator-header>
                                <v-text-field v-model="controls.search" placeholder="Buscar" single-line
                                    hide-details clearable prepend-inner-icon="mdi-magnify"></v-text-field>
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
                                        @click="editAdmin(item)"></btn-tooltip>
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
    </v-container>
</template>
<script>
import { reactive, ref } from 'vue';

export default {
    setup() {
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
        const controls = reactive({
            search: ''
        })
        const products = reactive({
            items: []
        })
        let categories = []
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
                { text: 'T. Productos', number: '6', icon: 'mdi-table-check', color: 'tertiary' },
                { text: 'Disponibles', number: '3', icon: 'mdi-check-circle-outline', color: 'success' },
                { text: 'Ocupados', number: '2', icon: 'mdi-table-cancel', color: 'warning' },
                { text: 'Suspendidos', number: '1', icon: 'mdi-close-circle-outline', color: 'error' }
            ]
            categories = [
                { id: '1', name: 'Laboratorio' },
                { id: '2', name: 'Neonatal' },
                { id: '3', name: 'Respiratorio' }
            ]
        }
        initialize()
        return { headers, summary, products, controls, categories }
    }
}
</script>