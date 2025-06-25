<template>
    <v-container fluid>
        <card-table title="Administradores Sistema" subtitle="Gestión de administradores de la plataforma"
            icon="mdi-account-cog-outline">
            <v-row dense>
                <v-col cols="12" sm="12" md="6" lg="8" xl="9">
                    <iterator-header>
                        <btn-custom prepend-icon="mdi-plus" :block="$isMobile()" @click="openDialogForm()">Nuevo Administrador</btn-custom>
                    </iterator-header>
                </v-col>
                <v-col cols="12" sm="12" md="6" lg="4" xl="3">
                    <iterator-header>
                        <v-text-field v-model="controls.search" placeholder="Buscar administrador" single-line
                            hide-details clearable prepend-inner-icon="mdi-magnify"></v-text-field>
                    </iterator-header>
                </v-col>
                <v-col cols="12">
                    <v-tabs v-model="controls.tabModel" grow>
                        <v-tab :value="1">Todos</v-tab>
                        <v-tab :value="2">Administradores</v-tab>
                        <v-tab :value="3">Clientes</v-tab>
                    </v-tabs>
                </v-col>
                <v-col cols="12">
                    <v-data-table :items="admins.items" :headers="headers" :search="controls.search">
                        <template v-slot:item.userName="{ value }">
                            <span class="text-caption font-weight-medium">{{ value }}</span>
                        </template>
                        <template v-slot:item.roles="{ value }">
                            <v-chip v-for="(item, i) in value" :key="i" class="ma-1">{{ item }}</v-chip>
                        </template>
                        <template v-slot:item.active="{ value }">
                            <v-chip :color="value ? 'success' : 'error'">{{ value ? 'Activo' : 'Inactivo' }}</v-chip>
                        </template>
                        <template v-slot:item.actions="{ item }">
                            <btn-tooltip icon="mdi-delete-outline" text="Eliminar administrador" color="error"
                                @click="deleteAdmin(item)"></btn-tooltip>
                            <btn-tooltip icon="mdi-circle-edit-outline" text="Editar administrador" color="secondary"
                                @click="editAdmin(item)"></btn-tooltip>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </card-table>
        <v-dialog v-model="controls.dialogForm" persistent scrollable width="1000" :fullscreen="$isMobile()">
            <card-dialog :title="titleDialog" :icon="iconDialog" actions @close="closeDialogForm()">
                <v-row>
                    <v-col cols="12">
                        <card-form title="Datos Generales" icon="mdi-account-outline">
                            <v-row dense>
                                <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                    <v-text-field label="Nombre(s) *" :color="colorDialog" :rules="[]"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                    <v-text-field label="Apellido(s) *" :color="colorDialog" :rules="[]"></v-text-field>
                                </v-col>
                            </v-row>
                        </card-form>
                    </v-col>
                    <v-col cols="12">
                        <card-form title="Datos de Usuario" icon="mdi-account-circle-outline">
                            <v-row dense>
                                <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                    <v-text-field label="ID Usuario *" prepend-inner-icon="mdi-badge-account-outline"
                                        :color="colorDialog" :rules="[]"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                    <v-select label="Selecciona un rol *" prepend-inner-icon="mdi-account-cog-outline"
                                        :color="colorDialog" :rules="[]" :items="roles" chips></v-select>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="6" xl="6" align="center">
                                    <btn-custom variant="text" :block="isEdited" @click="openDialogPassword()" :color="colorDialog" v-if="isEdited">Cambiar
                                        Contraseña</btn-custom>
                                    <v-text-field label="Contraseña *" prepend-inner-icon="mdi-account-key-outline"
                                        :color="colorDialog" :rules="[]" v-else></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                    <v-checkbox hide-details :color="colorDialog" label="Activo"></v-checkbox>
                                </v-col>
                            </v-row>
                        </card-form>
                    </v-col>
                    <v-col cols="12">
                        <card-form title="Información de Contacto" icon="mdi-card-account-details-outline">
                            <v-row dense>
                                <v-col cols="12" sm="12" md="4" lg="5" xl="5">
                                    <v-text-field label="Tel. Móvil *" prepend-inner-icon="mdi-phone-outline"
                                        :color="colorDialog" :rules="[]"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="4" lg="5" xl="5">
                                    <v-text-field label="Tel. Oficina *" prepend-inner-icon="mdi-deskphone"
                                        :color="colorDialog" :rules="[]"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="4" lg="2" xl="2">
                                    <v-text-field label="Extensión *"
                                        prepend-inner-icon="mdi-card-account-phone-outline" :color="colorDialog"
                                        :rules="[]"></v-text-field>
                                </v-col>
                                <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                    <v-text-field label="Email *" prepend-inner-icon="mdi-email-outline"
                                        :color="colorDialog" :rules="[]"></v-text-field>
                                </v-col>
                            </v-row>
                        </card-form>
                    </v-col>
                </v-row>
                <template v-slot:actions>
                    <v-spacer />
                    <btn-custom variant="tonal" :color="colorDialog" @click="closeDialogForm()">Cancelar</btn-custom>
                    <btn-custom variant="elevated" :color="colorDialog" @click="saveAdmin()">Guardar</btn-custom>
                </template>
            </card-dialog>
            <v-dialog v-model="controls.dialogPassword" persistent scrollable width="500">
                <card-dialog title="Cambiar Contraseña" icon="mdi-lock-reset" @close="closeDialogPassword()" :loading="controls.loadingPassword" :disabled="controls.loadingPassword">
                    <v-form @submit.prevent="savePassword()">
                        <card-form>
                            <v-row dense>
                                <v-col cols="12">
                                    <v-text-field label="Nueva Contraseña *"
                                        prepend-inner-icon="mdi-account-key-outline" :rules="[]"></v-text-field>
                                </v-col>
                                <v-col cols="12" class="d-flex flex-wrap ga-2 justify-end">
                                    <btn-custom variant="tonal" @click="closeDialogPassword()">Cancelar</btn-custom>
                                    <btn-custom variant="elevated" color="primary" type="submit" :loading="controls.loadingPassword">Cambiar</btn-custom>
                                </v-col>
                            </v-row>
                        </card-form>
                    </v-form>
                </card-dialog>
            </v-dialog>
        </v-dialog>
        <loading-overlay v-model="controls.loadingOverlay" />
    </v-container>
</template>
<script>
import { computed, getCurrentInstance, reactive, watch } from 'vue';

export default {
    setup() {
        const { proxy } = getCurrentInstance()
        /* Data */
        const controls = reactive({
            dialogForm: false,
            dialogPassword: false,
            loadingOverlay: false,
            loadingForm: false,
            loadingPassword: false,
            tabModel: 1,
            search: ''
        })
        const admins = reactive({
            items: [],
            editedItem: {},
            defaultItem: {},
            editedIndex: -1
        })
        const headers = [
            { key: 'fullName', title: 'NOMBRE', value: 'fullName' },
            { key: 'userName', title: 'ID USUARIO', value: 'userName' },
            { key: 'roles', title: 'ROLES' },
            { key: 'active', title: 'ACTIVO' },
            { key: 'actions', title: 'ACCIONES', sortable: false, align: 'end' },
        ]
        const roles = ['admin', 'client']
        /* Watchers */
        watch(() => controls.tabModel, (nv, ov) => {
            /* API Call to pagination */
        })
        /* Computed methods */
        const isEdited = computed(() => admins.editedIndex !== -1)
        const titleDialog = computed(() => isEdited.value ? 'Editar Administrador' : 'Nuevo Administrador')
        const iconDialog = computed(() => isEdited.value ? 'mdi-circle-edit-outline' : 'mdi-plus')
        const colorDialog = computed(() => isEdited.value ? 'secondary' : 'primary')
        
        /* Methods */
        const initialize = () => {
            admins.items.splice(0, admins.items.length,
                { id: '1', firstName: 'Alexis', lastName: 'Santana', fullName: 'Alexis Santana', userName: 'alexis.santana', roles: ['admin'], active: true, email: 'alexis@gmail.com' },
                { id: '2', firstName: 'Alexis', lastName: 'Santana', fullName: 'Gerardo Suarez', userName: 'gerardo.suarez', roles: ['admin', 'cliente'], active: true, email: 'gerardo@gmail.com' },
                { id: '3', firstName: 'Alexis', lastName: 'Santana', fullName: 'Liz Vega', lastName: 'Cruz', userName: 'johan.cruz', roles: ['admin'], active: false, email: 'johan@gmail.com' }
            )
        }
        const openDialogForm = () => {
            controls.dialogForm = true
        }
        const closeDialogForm = () => {
            controls.dialogForm = false
            proxy.$nextTick(() => {
                admins.editedItem = Object.assign({}, admins.defaultItem)
                admins.editedIndex = -1
            })
        }
        const deleteAdmin = (item) => {
            proxy.$swalConfirm(`Eliminar ${item.fullName}`, 'warning', `¿Desea eliminar a este administrador?`)
                .then(result => {
                    if (result.isConfirmed) {
                        proxy.$deleteFromArray(admins.items, item.id)
                        proxy.$toast.fire({ icon: 'success', text: 'Administrador eliminado con éxito' })
                    }
                })
                .catch(error => proxy.$toast.fire({ icon: 'error', text: 'No fue posible eliminar al administrador' }))
        }
        const editAdmin = (item) => {
            controls.loadingOverlay = true
            setTimeout(() => {
                admins.editedIndex = admins.items.indexOf(item)
                admins.editedItem = Object.assign({}, item)
                controls.loadingOverlay = false
                openDialogForm()
            }, 500)
        }
        const openDialogPassword = () => controls.dialogPassword = true
        const closeDialogPassword = () => {
            admins.editedItem.password = ''
            controls.dialogPassword = false
        }
        const savePassword = () => {
            /* API Call to update password */
            controls.loadingPassword = true
            setTimeout(() => {
                controls.loadingPassword = false
                closeDialogPassword()
                proxy.$toast.fire({ icon: 'success', text: 'Contraseña actualizada' })
            }, 1000)
        }
        /*  */
        initialize()

        return { headers, deleteAdmin, editAdmin, controls, admins, openDialogForm, closeDialogForm, titleDialog, iconDialog, colorDialog, roles, closeDialogPassword, openDialogPassword, isEdited, savePassword }
    }
}
</script>