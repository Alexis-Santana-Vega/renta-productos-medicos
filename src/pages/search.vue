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
                <v-data-iterator :items="products" :items-per-page="6">
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
        <v-dialog v-model="controls.dialogProduct"></v-dialog>
    </v-container>
</template>
<script>
import { reactive, ref } from 'vue';

export default {
    setup() {
        const products = ref([])
        const controls = reactive({
            dialogProduct: false
        })
        const filter = reactive({
            ofert: [],
            categories: []
        })
        /** Methods */
        const initialize = () => {
            products.value = [
                {
                    id: '1', name: 'ThermaBath 100', price: '$ 50.00', status: 'Venta', photoUrl: [
                        'https://www.somatechnology.com/spanish/wp-content/uploads/sites/2/2018/03/ERBE-VIO-300S-Electrobisturis-2.jpg', 'https://d17eythm3w95tp.cloudfront.net/media/1224/conversions/68389-9611056-large.webp', 'https://medgill.co.uk/cdn/shop/files/Erbecosmeticdisplay.jpg?v=1714652022&width=1946'
                    ], brand: 'Erbe Bio', rentPrice: '$2,00.00 / día', sellingPrice: '$150,000.00',
                },
                {
                    id: '2', name: 'BioSafe B2', price: '$ 250.00', status: 'Renta', photoUrl: [
                        'https://bioap.com.mx/wp-content/uploads/2023/05/Lina-xcise-Cordless-Morcellator-2-e1686345910274.jpg', 'https://img.medicalexpo.es/images_me/photo-m2/110269-16145408.jpg'
                    ], brand: 'BiMarks', rentPrice: '$500.00 / día', sellingPrice: '$450,000.00'
                },
                {
                    id: '3', name: 'MicroScope Pro', price: '$ 400.00', status: 'Ambos', photoUrl: [
                        'https://image.made-in-china.com/2f0j00DJYiZIRzYgpS/B2-Biosafeti-2-Esco-II-A2-Class-3-Heal-Force-Cabinets-Laboratory-Biosafety-Cabinet.webp', 'https://5.imimg.com/data5/SELLER/Default/2022/2/XU/LI/AC/132352180/pathology-products-500x500.jpg'
                    ], brand: 'Heal Force', rentPrice: null, sellingPrice: '$40,000.00'
                },
                {
                    id: '4', name: 'AutoPipette X3', price: '$ 100.00', status: 'Renta', photoUrl: [
                        'https://images-na.ssl-images-amazon.com/images/I/51vqUoHqmKL._AC_UL495_SR435,495_.jpg', 'https://m.media-amazon.com/images/I/71pG4APOtbL._UF350,350_QL80_.jpg', 'https://www.eppendorf.com/product-media/img/global/540218/Eppendorf_Liquid-Handling_Research-plus-12-channel-pipette-epTIPS-384_Research-plus-12-channel-pipette-filling-384-well-plate_product.jpg?imwidth=540'
                    ], brand: 'XPipe', rentPrice: '$120.00 / día', sellingPrice: null
                },
                {
                    id: '5', name: 'Drager Oxylog 3000', price: '$ 100.00', status: 'Renta', photoUrl: [
                        'https://www.draeger.com/Media/Content/Products/Default/Draeger-Oxylog-3000-plus-1-MT-5809-2008.jpg', 'https://storage.googleapis.com/avante/images/12671-1-drager-oxylog-3000.jpg'
                    ], brand: 'Drager', rentPrice: '$200.00 / día', sellingPrice: '$50,000.00'
                },
                {
                    id: '6', name: 'HoneyWell h60240 a10 Plus', price: '$ 100.00', status: 'Renta', photoUrl: [
                        'https://m.media-amazon.com/images/I/61sIys3lxaL._UF894,1000_QL80_.jpg', 'https://www.amresupply.com/thumbnail/product/1656514/625/469/1656514-H6062A1000-Honeywell-H6062A1000-Home-HumidiPRO-Digital-Humidistat-Control-with-Outdoor-Sensor.jpg'
                    ], brand: 'HoneyHome', rentPrice: '$120.00 / día', sellingPrice: null
                },
                {
                    id: '7', name: 'Oxyflow 5L Oxygen XML', price: '$ 100.00', status: 'Renta', photoUrl: [
                        'https://5.imimg.com/data5/SELLER/Default/2021/6/KP/DV/GP/109247365/oxyflow-5-500x500.jpg', 'https://5.imimg.com/data5/SELLER/Default/2023/6/321315275/IP/FL/SG/74865603/oxyflow-5l-zy-5af-oxygen-concentrator-500x500.jpg'
                    ], brand: 'India Mart', rentPrice: '$2,500.00 / día', sellingPrice: '$3,000,000.00'
                },
            ]
        }
        const openDialogProduct = (item) => {
            controls.dialogProduct = true
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