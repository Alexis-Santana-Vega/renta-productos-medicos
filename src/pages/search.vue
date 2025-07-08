<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12" sm="12" md="4" lg="4" xl="4">
                <card-table icon="mdi-filter-variant" title="Filtros">
                    <template v-slot:append>
                        <v-btn color="tertiary" variant="tonal" icon="mdi-sync" size="small"></v-btn>
                    </template>
                </card-table>
            </v-col>
            <v-col cols="12" sm="12" md="8" lg="8" xl="8">
                <v-data-iterator :items="products">
            <template v-slot:default="{ items }">
                <v-row dense>
                    <v-col cols="12" sm="12" md="4" lg="4" xl="4" v-for="(item, i) in items" :key="i">
                        <v-card>
                            <v-carousel hide-delimiters show-arrows="hover" height="250">
                                <v-carousel-item v-for="(img, im) in item.raw.photoUrl" :key="im"
                                    :src="img"></v-carousel-item>
                            </v-carousel>
                            <v-card-title>{{ item.raw.name }}</v-card-title>
                            <v-card-text>
                                <div>{{ item.raw.price }}</div>
                                <v-chip>{{ item.raw.status }}</v-chip>
                            </v-card-text>
                        </v-card>
                    </v-col>
                </v-row>
            </template>
        </v-data-iterator>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
import { ref } from 'vue';

export default {
    setup() {
        const products = ref([])
        /** Methods */
        const initialize = () => {
            products.value = [
                {
                    id: '1', name: 'Producto 1', price: '$ 50.00', status: 'VENTA', photoUrl: [
                        'https://www.somatechnology.com/spanish/wp-content/uploads/sites/2/2018/03/ERBE-VIO-300S-Electrobisturis-2.jpg', 'https://d17eythm3w95tp.cloudfront.net/media/1224/conversions/68389-9611056-large.webp', 'https://medgill.co.uk/cdn/shop/files/Erbecosmeticdisplay.jpg?v=1714652022&width=1946'
                    ]
                },
                {
                    id: '2', name: 'Producto 2', price: '', status: 'RENTA', photoUrl: [
                        'https://bioap.com.mx/wp-content/uploads/2023/05/Lina-xcise-Cordless-Morcellator-2-e1686345910274.jpg', 'https://img.medicalexpo.es/images_me/photo-m2/110269-16145408.jpg'
                    ]
                },
                {
                    id: '3', name: 'Producto 3', price: '', status: 'AMBOS', photoUrl: [
                        '', '', ''
                    ]
                },
                {
                    id: '4', name: 'Producto 4', price: '', status: 'RENTA', photoUrl: [
                        '', '', ''
                    ]
                }
            ]
        }
        initialize()
        return { products }
    }
}
</script>