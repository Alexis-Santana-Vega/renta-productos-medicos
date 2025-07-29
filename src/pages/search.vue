<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12" sm="12" md="3" lg="3" xl="3">
                <card-table icon="mdi-filter-variant" title="Filtros">
                    <template v-slot:append>
                        <v-btn color="tertiary" variant="tonal" icon="mdi-sync" size="small"></v-btn>
                    </template>
                    <v-expansion-panels flat multiple>
                        <v-expansion-panel>
                            <template v-slot:title>
                                <div class="font-weight-medium text-medium-emphasis">Disponibilidad</div>
                            </template>
                            <template v-slot:text>
                                <v-select v-model="filter.ofert" label="Oferta de Producto" :items="['Renta', 'Venta']"
                                    hide-details chips multiple clearable></v-select>
                            </template>
                        </v-expansion-panel>
                        <v-expansion-panel>
                            <template v-slot:title>
                                <div class="font-weight-medium text-medium-emphasis">Categorías</div>
                            </template>
                            <template v-slot:text>
                                <v-chip-group v-model="filter.categories" column multiple color="primary" filter>
                                    <v-chip
                                        v-for="(item, i) in ['Neonatal', 'Respiratorio', 'Laboratorio', 'Ortopédico', 'Terapéutico', 'Imagenología']"
                                        :key="i">{{ item }}</v-chip>
                                </v-chip-group>
                            </template>
                        </v-expansion-panel>
                        <v-expansion-panel>
                            <template v-slot:title>
                                <div class="font-weight-medium text-medium-emphasis">Precio</div>
                            </template>
                            <template v-slot:text>
                                <v-row dense>
                                    <v-col cols="6">
                                        <v-text-field label="Máximo"></v-text-field>
                                    </v-col>
                                    <v-col cols="6">
                                        <v-text-field label="Mínimo"></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-range-slider></v-range-slider>
                                    </v-col>
                                </v-row>
                            </template>
                        </v-expansion-panel>
                    </v-expansion-panels>
                </card-table>
            </v-col>
            <v-col cols="12" sm="12" md="9" lg="9" xl="9">
                <v-data-iterator :items="products" :items-per-page="6" :loading="controls.loadingIterator">
                    <template v-slot:loader>
                        <v-row>
                            <v-col v-for="i in 6" :key="i" cols="6" sm="6" md="4" lg="4" xl="4">
                                <v-skeleton-loader type="image, heading, chip, text"></v-skeleton-loader>
                            </v-col>
                        </v-row>
                    </template>
                    <template v-slot:default="{ items }">
                        <v-row dense>
                            <v-col cols="6" sm="6" md="4" lg="4" xl="4" v-for="(item, i) in items" :key="i">
                                <v-card height="100%" class="pointer-hover">
                                    <v-carousel @click.stop hide-delimiters show-arrows="hover"
                                        :height="$isMobile() ? 150 : 200">
                                        <v-carousel-item v-for="(img, im) in item.raw.photoUrl" :key="im"
                                            :src="img"></v-carousel-item>
                                    </v-carousel>
                                    <v-card-text @click="openDialogProduct(item.raw)"
                                        :class="`mouse-enter-point ${!$isMobile() || 'pa-2'}`">
                                        <div class="text-caption font-weight-medium text-medium-emphasis">{{
                                            item.raw.brand }}</div>
                                        <div class="text-body-2 font-weight-bold">{{ item.raw.name }}</div>
                                        <div class="mt-2 d-flex flex-column ga-2">
                                            <div v-if="item.raw.rentPrice">
                                                <v-chip color="success" density="comfortable">Renta</v-chip>
                                                <span class="ml-2 font-weight-medium">{{ item.raw.rentPrice }}</span>
                                            </div>
                                            <div v-if="item.raw.sellingPrice">
                                                <v-chip color="tertiary" density="comfortable">Venta</v-chip>
                                                <span class="ml-2 font-weight-medium">{{ item.raw.sellingPrice }}</span>
                                            </div>
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </v-col>
                        </v-row>
                    </template>
                    <template v-slot:footer="{ page, pageCount, setPage, setItemsPerPage, itemsPerPage }">
                        <v-row dense>
                            <v-col cols="2" sm="2" md="1" lg="1" xl="1">
                                <v-menu>
                                    <template v-slot:activator="{ props, isActive }">
                                        <v-btn variant="tonal" color="primary"
                                            :append-icon="isActive ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                                            v-bind="props" class="my-1">{{ itemsPerPage
                                            }}</v-btn>
                                    </template>
                                    <v-sheet class="text-center" elevation="8">
                                        <v-list density="compact" class="pa-1">
                                            <v-list-item v-for="(item, index) in [3, 6, 9, 12]" :key="index"
                                                @click="setItemsPerPage(item)">
                                                <v-list-item-title>{{ item }}</v-list-item-title>
                                            </v-list-item>
                                        </v-list>
                                    </v-sheet>
                                </v-menu>
                            </v-col>
                            <v-col cols="10" sm="10" md="11" lg="11" xl="11">
                                <v-pagination :model-value="page" color="primary" :length="pageCount" :total-visible="3"
                                    v-on:update:model-value="setPage"></v-pagination>
                            </v-col>
                        </v-row>
                    </template>
                </v-data-iterator>
            </v-col>
        </v-row>
        <v-dialog v-model="controls.dialogProduct" scrollable width="1500" :fullscreen="$isMobile()">
            <card-dialog title="Detalles" icon="mdi-hospital-box-outline" @close="closeDialogProduct()">
                <v-row>
                    <v-col cols="auto">
                        <v-slide-group v-model="controls.slide" show-arrows mandatory
                            :direction="$isMobile() ? 'horizontal' : 'vertical'"
                            selected-class="border-b-lg border-opacity-100 border-tertiary">
                            <v-slide-group-item v-for="(img, im) in products[0].photoUrl" :key="im"
                                v-slot="{ isSelected, toggle, selectedClass }">
                                <v-card height="100" width="100" rounded="0"
                                    :class="['d-flex align-center justify-center mb-2', selectedClass]" @click="toggle">
                                    <v-img :src="img" rounded="0"></v-img>
                                </v-card>
                            </v-slide-group-item>
                        </v-slide-group>
                    </v-col>
                    <v-col cols="12" sm="12" md="5">
                        <v-carousel @click.stop hide-delimiters show-arrows="hover" :height="$isMobile() ? 300 : 400">
                            <v-carousel-item v-for="(img, im) in products[0].photoUrl" :key="im"
                                :src="img"></v-carousel-item>
                        </v-carousel>
                    </v-col>
                    <v-col cols="12" sm="12" md="5" lg="5" xl="5">
                        <v-card>
                            <v-card-text>
                                <div class="text-h5 font-weight-bold">{{ products[0].name }}</div>
                                <div class="text-body-2 font-weight-medium text-medium-emphasis">{{ products[0].brand }}</div>
                                <div class="text-body-1 font-italic">{{ products[0].shortDescription }}</div>
                                
                                <v-row>
                                    <v-col cols="12">
                                        <v-text-field label="Cantidad de horas" prepend-icon="mdi-minus" append-icon="mdi-plus"></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-text-field label="Tiempo de Renta (horas)" prepend-icon="mdi-minus" append-icon="mdi-plus"></v-text-field>
                                    </v-col>
                                </v-row>
                                <btn-custom prepend-icon="mdi-cart-arrow-down" color="success">Rentar Equipo</btn-custom>
                                <v-divider>Opción de Compra</v-divider>
                                <div>{{ products[0].sellingPrice }}</div>
                                <v-row>
                                    <v-col cols="12">
                                        <v-text-field label="Cantidad" prepend-icon="mdi-minus" append-icon="mdi-plus"></v-text-field>
                                    </v-col>
                                </v-row>
                                <btn-custom prepend-icon="mdi-cart-arrow-down" color="tertiary">Comprar Equipo</btn-custom>
                            </v-card-text>
                        </v-card>
                    </v-col>
                    <v-col cols="12">
                        <v-expansion-panels>
                            <v-expansion-panel>
                                <template v-slot:title>
                                    Descripción
                                </template>
                                <template v-slot:text>
                                    {{ products[0].longDescription }}
                                </template>
                            </v-expansion-panel>
                            <v-expansion-panel>
                                <template v-slot:title>
                                    Características
                                </template>
                                <template v-slot:text>
                                    
                                </template>
                            </v-expansion-panel>
                        </v-expansion-panels>
                    </v-col>
                </v-row>
            </card-dialog>
        </v-dialog>
        <loading-overlay v-model="controls.loadingOverlay"></loading-overlay>
    </v-container>
</template>
<script>
import { fakeApiGetProductByIdOnSearch, fakeApiGetProductsBySearch } from '@/plugins/fakeApi';
import { getCurrentInstance, reactive, ref } from 'vue';

export default {
    setup() {
        /** To uses global methods */
        const { proxy } = getCurrentInstance()
        const globals = proxy

        const products = ref([])
        const controls = reactive({
            loadingIterator: false,
            dialogProduct: false,
            loadingOverlay: false,
            slide: null
        })
        const filter = reactive({
            ofert: [],
            categories: [],
            minPrice: 0.0,
            maxPrice: 0.0
        })
        /** Methods */
        const initialize = () => {
            controls.loadingIterator = true
            fakeApiGetProductsBySearch()
                .then(result => {
                    products.value = result
                })
                .catch(error => {
                    // globals.$toast.fire({ icon: 'warning', text: error })
                })
                .finally(() => controls.loadingIterator = false)
        }
        const openDialogProduct = (item) => {
            controls.loadingOverlay = true
            fakeApiGetProductByIdOnSearch()
                .then(() => {
                    controls.dialogProduct = true
                })
                .catch()
                .finally(() => controls.loadingOverlay = false)
        }
        initialize()
        return { products, controls, openDialogProduct, filter }
    }
}
</script>
<style scoped>
.mouse-enter-point {
    cursor: pointer;
}

.pointer-hover:hover {
    box-shadow: rgba(var(--v-box-shadow-color), var(--v-opacity-shadow)) 0px 4px 10px !important;
}
</style>