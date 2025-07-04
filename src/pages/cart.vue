<template>
    <v-container fluid>
        <v-row>
            <v-col cols="12" sm="12" md="6" lg="5" xl="4">
                <v-card>
                    <div class="d-flex align-center">
                        <v-img
                            src="https://static.vecteezy.com/system/resources/previews/053/066/817/non_2x/icon-free-logo-javascript-free-png.png"
                            height="56" width="56" class="mt-4"></v-img>
                    </div>
                    <v-card-title class="text-center">
                        <v-icon icon="mdi-shopping-outline" class="mr-2" /> Resumen de Pedido
                    </v-card-title>
                    <v-card-text>
                        <div class="text-body-1 font-weight-bold text-medium-emphasis mb-1">Renta</div>
                        <v-divider />
                        <v-list slim>
                            <v-list-item v-for="(item, i) in cartItems" :key="i">
                                <template v-slot:prepend>
                                    <v-badge color="tertiary" :content="item.stock" class="mr-4" rounded="xl">
                                        <v-avatar size="large" class="border">
                                            <v-img :src="item.photoUrl" />
                                        </v-avatar>
                                    </v-badge>
                                </template>
                                <v-list-item-title class="text-body-2">{{ item.name }}</v-list-item-title>
                                <template v-slot:append>
                                    <span class="text-body-2 font-weight-bold">{{ `$ ${item.price}.00` }}</span>
                                </template>
                            </v-list-item>
                        </v-list>
                        <div class="text-body-1 font-weight-bold text-medium-emphasis mb-1">Compra</div>
                        <v-divider />
                        <v-list slim>
                            <v-list-item v-for="(item, i) in cartItemsRent" :key="i">
                                <template v-slot:prepend>
                                    <v-badge color="tertiary" :content="item.stock" class="mr-4" rounded="xl">
                                        <v-avatar size="large" class="border">
                                            <v-img :src="item.photoUrl" />
                                        </v-avatar>
                                    </v-badge>
                                </template>
                                <v-list-item-title class="text-body-2">{{ item.name }}</v-list-item-title>
                                <template v-slot:append>
                                    <span class="text-body-2 font-weight-bold">{{ `$ ${item.price}.00` }}</span>
                                </template>
                            </v-list-item>
                        </v-list>
                        <div class="d-flex justify-space-between mt-2">
                            <div class="text-h6 text-medium-emphasis font-weight-bold">Total</div>
                            <div class="text-h6 font-weight-bold">$ 16,350.0</div>
                        </div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" sm="12" md="6" lg="7" xl="8">
                <v-row>
                    <v-col cols="12">
                        <card-table title="Entrega" icon="mdi-map-marker-radius-outline">
                            <v-form>
                                <v-row dense>
                                    <v-col cols="12" sm="12" md="4" lg="3" xl="3">
                                        <v-text-field label="Código Postal *"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="4" lg="3" xl="3">
                                        <v-select label="Estado *"></v-select>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="4" lg="6" xl="6">
                                        <v-text-field label="Ciudad *"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="4" lg="6" xl="6">
                                        <v-text-field label="Colonia *"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="4" lg="6" xl="6">
                                        <v-text-field label="Dirección *"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="4" lg="4" xl="4">
                                        <v-text-field label="Número Exterior *"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="4" lg="4" xl="4">
                                        <v-text-field label="Número Interior *"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="12" lg="4" xl="4">
                                        <v-select label="Tipo de Domicilio *"
                                            :items="['Residencial', 'Laboral']"></v-select>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                        <v-textarea label="Indicaciones de entrega"></v-textarea>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                        <v-text-field label="Nombre Completo *"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                        <v-text-field label="Número de Teléfono"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" class="text-caption text-disabled">* Campos requeridos</v-col>
                                    <v-col cols="12" align="end">
                                        <btn-custom color="tertiary">Guardar Dirección</btn-custom>
                                    </v-col>
                                </v-row>
                            </v-form>
                        </card-table>
                    </v-col>
                    <v-col cols="12">
                        <card-table title="Método de Pago" icon="mdi-credit-card-multiple-outline">
                            <v-expansion-panels v-model="controls.expansionModel">
                                <v-expansion-panel>
                                    <v-expansion-panel-title>
                                        <v-row no-gutters>
                                            <v-col cols="8" class="d-flex align-center">
                                                <v-checkbox hide-details single-line></v-checkbox>
                                                Tarjeta de crédito o débito
                                            </v-col>
                                            <v-col cols="4">
                                                <v-avatar>
                                                    <v-img
                                                        src="https://logoeps.com/wp-content/uploads/2025/02/Visa-logo-.png"></v-img>
                                                </v-avatar>
                                                <v-avatar>
                                                    <v-img
                                                        src="https://www.mastercard.com/content/dam/public/mastercardcom/mx/es/logos/mastercard-og-image.png"></v-img>
                                                </v-avatar>
                                                <v-avatar>
                                                    <v-img
                                                        src="https://cdn-icons-png.flaticon.com/512/825/825539.png"></v-img>
                                                </v-avatar>
                                            </v-col>
                                        </v-row>
                                    </v-expansion-panel-title>
                                    <v-expansion-panel-text>
                                        <v-row>
                                            <v-col cols="12" sm="12" md="12" lg="5" xl="5" align="center" class="mb-6">
                                                <v-card class="text-caption text-uppercase pa-4 background-card"
                                                    color="secondary" max-width="300">
                                                    <div class="d-flex justify-space-between">
                                                        <v-avatar rounded="0" size="24" class="ml-4 mt-4">
                                                            <v-img
                                                                src="https://png.pngtree.com/png-vector/20240601/ourmid/pngtree-creditcard-chip-business-chip-detail-png-image_12572016.png"></v-img>
                                                        </v-avatar>
                                                        <div>Mi tarjeta</div>
                                                    </div>
                                                    <div class="my-4 text-start">0000 0000 0000 0000</div>
                                                    <div class="d-flex justify-space-between">
                                                        <div>Alexis Santana</div>
                                                        <div>00/00</div>
                                                    </div>
                                                </v-card>
                                            </v-col>
                                            <v-col cols="12" sm="12" md="12" lg="7" xl="7">
                                                <v-row dense>
                                                    <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                                        <v-text-field label="Número de Tarjeta *"
                                                            placeholder="0000 0000 0000 0000"></v-text-field>
                                                    </v-col>
                                                    <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                                        <v-text-field label="Fecha Vencimiento *"
                                                            placeholder="MM/AA"></v-text-field>
                                                    </v-col>
                                                    <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                                        <v-text-field label="CVV (Código Seguridad) *"
                                                            placeholder="000"></v-text-field>
                                                    </v-col>
                                                    <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                                        <v-text-field
                                                            label="Nombre del Titular de la Tarjeta *"></v-text-field>
                                                    </v-col>
                                                    <v-col cols="12" class="text-caption text-disabled">* Campos
                                                        requeridos</v-col>
                                                    <v-col cols="12" align="end">
                                                        <btn-custom color="tertiary">Guardar Tarjeta</btn-custom>
                                                    </v-col>
                                                </v-row>
                                            </v-col>
                                        </v-row>
                                    </v-expansion-panel-text>
                                </v-expansion-panel>
                                <v-expansion-panel>
                                    <v-expansion-panel-title>
                                        <v-row no-gutters>
                                            <v-col cols="8" class="d-flex align-center">
                                                <v-checkbox hide-details single-line></v-checkbox>
                                                PayPal
                                            </v-col>
                                            <v-col cols="4">
                                                <v-avatar>
                                                    <v-img
                                                        src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Paypal_2014_logo.png"></v-img>
                                                </v-avatar>
                                            </v-col>
                                        </v-row>
                                    </v-expansion-panel-title>
                                    <v-expansion-panel-text class="text-center">
                                        <v-icon icon="mdi-credit-card-fast-outline" class="text-medium-emphasis" size="64"></v-icon>
                                        <div>Después de hacer clic en <strong>Finalizar Compra</strong>, se te redigirá a PayPal para completar tu compra.</div>
                                    </v-expansion-panel-text>
                                </v-expansion-panel>
                            </v-expansion-panels>
                        </card-table>
                    </v-col>
                    <v-col cols="12">
                        <btn-custom block>Finalizar Compra</btn-custom>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>
<script>
import { reactive } from 'vue'

export default {
    setup() {
        const cartItems = [
            { id: '10', name: 'Phoroptor Yeosn SLY-100', photoUrl: 'https://isem.mx/wp-content/uploads/2019/11/phoroptorpartetrasera.jpg', price: 3000.0, stock: 1 },
            { id: '20', name: 'Sistema VIOS 300s', photoUrl: 'https://www.somatechnology.com/spanish/wp-content/uploads/sites/2/2018/03/ERBE-VIO-300S-Electrobisturis-2.jpg', price: 6000.0, stock: 2 },
            { id: '30', name: 'Morcelador Gomedil 2025', photoUrl: 'https://endoscopia-gdl.com.mx/wp-content/uploads/2024/07/PAGINA-WEB-MORCELADOR-HAWK-2024.jpg', price: 1350.0, stock: 1 }
        ]
        const cartItemsRent = [
            { id: '50', name: 'Sistema VIOS 300s', photoUrl: 'https://www.somatechnology.com/spanish/wp-content/uploads/sites/2/2018/03/ERBE-VIO-300S-Electrobisturis-2.jpg', price: 6000.0, stock: 2 },
        ]
        const controls = reactive({
            expansionModel: null
        })
        return { cartItems, cartItemsRent, controls }
    }
}
</script>
<style scoped>
.background-card {
    background: linear-gradient(90deg, rgba(30, 58, 138, 1) 0%, rgba(59, 130, 246, 1) 50%, rgba(16, 185, 129, 1) 100%);
}
</style>