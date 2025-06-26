<template>
    <v-container fluid>
        <card-table title="Usuarios Sistema" subtitle="Gestión de usuarios de la plataforma"
            icon="mdi-account-cog-outline">
            <v-row dense>
                <v-col cols="12" sm="12" md="6" lg="8" xl="9">
                    <iterator-header>
                        <btn-custom prepend-icon="mdi-plus" :block="$isMobile()" @click="openDialogForm()">Nuevo
                            Usuario</btn-custom>
                    </iterator-header>
                </v-col>
                <v-col cols="12" sm="12" md="6" lg="4" xl="3">
                    <iterator-header>
                        <v-text-field v-model="controls.search" placeholder="Buscar" single-line hide-details clearable
                            prepend-inner-icon="mdi-magnify"></v-text-field>
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
                            <btn-tooltip icon="mdi-delete-outline" text="Eliminar Usuario" color="error"
                                @click="deleteAdmin(item)"></btn-tooltip>
                            <btn-tooltip icon="mdi-circle-edit-outline" text="Editar Usuario" color="secondary"
                                @click="editAdmin(item)"></btn-tooltip>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </card-table>
        <v-dialog v-model="controls.dialogForm" persistent scrollable width="1000" :fullscreen="$isMobile()">
            <card-dialog :title="titleDialog" :icon="iconDialog" mobile actions :loading="controls.loadingForm"
                :disabled="controls.loadingForm" @close="closeDialogForm()">
                <v-form v-model="controls.validForm" @submit.prevent>
                    <v-row>
                        <v-col cols="12">
                            <card-form title="Datos Generales" icon="mdi-account-outline">
                                <v-row dense>
                                    <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                        <v-text-field v-model="admins.editedItem.firstName" label="Nombre(s) *"
                                            :color="colorDialog" :rules="formRules.firstName"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                        <v-text-field v-model="admins.editedItem.lastName" label="Apellido(s) *"
                                            :color="colorDialog" :rules="formRules.lastName"></v-text-field>
                                    </v-col>
                                </v-row>
                            </card-form>
                        </v-col>
                        <v-col cols="12">
                            <card-form title="Datos de Usuario" icon="mdi-account-circle-outline">
                                <v-row dense>
                                    <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                        <v-text-field v-model="admins.editedItem.userName" label="ID Usuario *"
                                            prepend-inner-icon="mdi-badge-account-outline" :color="colorDialog"
                                            :rules="formRules.userName"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                        <v-select v-model="admins.editedItem.roles" label="Selecciona un rol *"
                                            prepend-inner-icon="mdi-account-cog-outline" :color="colorDialog"
                                            :rules="formRules.roles" :items="roles" multiple chips></v-select>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                        <btn-custom variant="text" :block="isEdited" @click="openDialogPassword()"
                                            :color="colorDialog" v-if="isEdited">Cambiar
                                            Contraseña</btn-custom>
                                        <v-text-field v-model="admins.editedItem.password" label="Contraseña *"
                                            prepend-inner-icon="mdi-account-key-outline" :color="colorDialog"
                                            :rules="formRules.password"
                                            :append-inner-icon="controls.showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                                            :type="controls.showPassword ? 'text' : 'password'"
                                            @click:append-inner="controls.showPassword = !controls.showPassword"
                                            v-else></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="6" lg="6" xl="6">
                                        <v-checkbox v-model="admins.editedItem.active" hide-details :color="colorDialog"
                                            label="Activo"></v-checkbox>
                                    </v-col>
                                </v-row>
                            </card-form>
                        </v-col>
                        <v-col cols="12">
                            <card-form title="Información de Contacto" icon="mdi-card-account-details-outline">
                                <v-row dense>
                                    <v-col cols="12" sm="12" md="4" lg="5" xl="5">
                                        <v-text-field v-model="admins.editedItem.mobilePhone" label="Tel. Móvil"
                                            prepend-inner-icon="mdi-phone-outline" :color="colorDialog"
                                            :rules="formRules.mobilePhone"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="4" lg="5" xl="5">
                                        <v-text-field v-model="admins.editedItem.phoneOffice" label="Tel. Oficina"
                                            prepend-inner-icon="mdi-deskphone" :color="colorDialog"
                                            :rules="formRules.phoneOffice"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="4" lg="2" xl="2">
                                        <v-text-field v-model="admins.editedItem.phoneExt" label="Extensión"
                                            prepend-inner-icon="mdi-card-account-phone-outline" :color="colorDialog"
                                            :rules="formRules.phoneExt"></v-text-field>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="12" lg="12" xl="12">
                                        <v-text-field v-model="admins.editedItem.email" label="Email *"
                                            prepend-inner-icon="mdi-email-outline" :color="colorDialog"
                                            :rules="formRules.email"></v-text-field>
                                    </v-col>
                                </v-row>
                            </card-form>
                        </v-col>
                        <v-col cols="12" class="text-caption text-disabled">* Campos requeridos</v-col>
                    </v-row>
                </v-form>
                <template v-slot:actions>
                    <v-spacer />
                    <btn-custom variant="tonal" :color="colorDialog" @click="closeDialogForm()">Cancelar</btn-custom>
                    <btn-custom variant="elevated" :color="colorDialog" :disabled="!controls.validForm"
                        :loading="controls.loadingForm" @click="saveAdmin()">Guardar</btn-custom>
                </template>
            </card-dialog>
            <v-dialog v-model="controls.dialogPassword" persistent scrollable width="500">
                <card-dialog title="Cambiar Contraseña" icon="mdi-lock-reset" @close="closeDialogPassword()"
                    :loading="controls.loadingPassword" :disabled="controls.loadingPassword">
                    <v-form v-model="controls.validPassForm" @submit.prevent="savePassword()">
                        <card-form>
                            <v-row dense>
                                <v-col cols="12">
                                    <v-text-field v-model="admins.passwordEditedItem.oldPassword"
                                        label="Contraseña Actual *" prepend-inner-icon="mdi-account-key-outline"
                                        :type="controls.showPassword ? 'text' : 'password'" :rules="formRules.password"></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field v-model="admins.passwordEditedItem.newPassword"
                                        label="Nueva Contraseña *" prepend-inner-icon="mdi-account-key-outline"
                                        :type="controls.showPassword ? 'text' : 'password'" :rules="formRules.repPass"></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-switch v-model="controls.showPassword" label="Mostrar campos" color="primary"
                                        hide-details></v-switch>
                                </v-col>
                                <v-col cols="12" class="text-caption text-disabled">* Campos requeridos</v-col>
                                <v-col cols="12" class="d-flex flex-wrap ga-2 justify-end">
                                    <btn-custom variant="tonal" @click="closeDialogPassword()">Cancelar</btn-custom>
                                    <btn-custom variant="elevated" color="primary" type="submit"
                                        :loading="controls.loadingPassword" :disabled="!controls.validPassForm">Cambiar</btn-custom>
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
import { maxLength, onlyEmail, onlyNumbers, onlyPassword, required, requiredLength } from '@/plugins/globalRules';
import { computed, getCurrentInstance, reactive, watch } from 'vue';

export default {
    setup() {
        const { proxy } = getCurrentInstance()
        const globals = proxy
        /* Data */
        const controls = reactive({
            dialogForm: false,
            dialogPassword: false,
            loadingOverlay: false,
            loadingForm: false,
            loadingPassword: false,
            tabModel: 1,
            search: '',
            showPassword: false,
            validForm: false,
            validPassForm: false,
        })
        const admins = reactive({
            items: [],
            editedItem: {
                id: '', firstName: '', lastName: '', userName: '', password: '', roles: ['cliente'], active: true, mobilePhone: '', phoneOffice: '', phoneExt: '', email: ''
            },
            defaultItem: {
                id: '', firstName: '', lastName: '', userName: '', password: '', roles: ['cliente'], active: true, mobilePhone: '', phoneOffice: '', phoneExt: '', email: ''
            },
            passwordEditedItem: {
                idUser: '', oldPassword: '', newPassword: ''
            },
            passwordDefaultItem: {
                idUser: '', oldPassword: '', newPassword: ''
            },
            editedIndex: -1
        })
        const headers = [
            { key: 'fullName', title: 'NOMBRE', value: 'fullName' },
            { key: 'userName', title: 'ID USUARIO', value: 'userName' },
            { key: 'roles', title: 'ROLES' },
            { key: 'active', title: 'ACTIVO' },
            { key: 'actions', title: 'ACCIONES', sortable: false, align: 'end' },
        ]
        const formRules = {
            firstName: [required('Nombre(s) requerido(s)'), maxLength(30, 'Nombre(s)')],
            lastName: [required('Apellido(s) requerido(s)'), maxLength(30, 'Apellido(s)')],
            userName: [required('ID Usuario requerido'), maxLength(30, 'ID Usuario')],
            roles: [required('Rol requerido'), requiredLength('Rol requerido')],
            password: [required('Contraseña requerida'), maxLength(30, 'Contraseña'), onlyPassword()],
            repPass: [required('Contraseña requerida'), maxLength(30, 'Contraseña'), onlyPassword()],
            mobilePhone: [maxLength(15, 'Tel. Móvil'), onlyNumbers('Tel. Móvil')],
            phoneOffice: [maxLength(15, 'Tel. Oficina'), onlyNumbers('Tel. Oficina')],
            phoneExt: [maxLength(15, 'Extensión'), onlyNumbers('Extensión')],
            email: [required('Email requerido'), maxLength(60, 'Email'), onlyEmail()]
        }
        const roles = ['admin', 'cliente']
        /* Watchers */
        watch(() => controls.tabModel, (nv, ov) => {
            /* API Call to pagination */
        })
        /* Computed methods */
        const isEdited = computed(() => admins.editedIndex !== -1)
        const titleDialog = computed(() => isEdited.value ? 'Editar Usuario' : 'Nuevo Usuario')
        const iconDialog = computed(() => isEdited.value ? 'mdi-circle-edit-outline' : 'mdi-plus')
        const colorDialog = computed(() => isEdited.value ? 'secondary' : 'primary')

        /* Methods */
        const initialize = () => {
            admins.items.splice(0, admins.items.length,
                { id: '1', firstName: 'Alexis', lastName: 'Santana', fullName: 'Alexis Santana', userName: 'alexis.santana', mobilePhone: '', phoneOffice: '', phoneExt: '', roles: ['admin'], active: true, email: 'alexis@gmail.com' },
                { id: '2', firstName: 'Gerardo', lastName: 'Suarez', fullName: 'Gerardo Suarez', userName: 'gerardo.suarez', mobilePhone: '', phoneOffice: '', phoneExt: '', roles: ['admin', 'cliente'], active: true, email: 'gerardo@gmail.com' },
                { id: '3', firstName: 'Liz', lastName: 'Vega', fullName: 'Liz Vega', lastName: 'Cruz', userName: 'liz.vega', mobilePhone: '', phoneOffice: '', phoneExt: '', roles: ['admin'], active: false, email: 'liz@gmail.com' }
            )
        }
        const openDialogForm = () => {
            controls.dialogForm = true
        }
        const closeDialogForm = () => {
            controls.dialogForm = false
            globals.$nextTick(() => {
                admins.editedItem = Object.assign({}, admins.defaultItem)
                admins.editedIndex = -1
                controls.showPassword = false
                console.log('Formulario de Administrador Limpio: ', admins.editedItem)
            })
        }
        const deleteAdmin = (item) => {
            globals.$swalConfirm(`Eliminar ${item.fullName}`, 'warning', `¿Desea eliminar a este usuario?`)
                .then(result => {
                    if (result.isConfirmed) {
                        globals.$deleteFromArray(admins.items, item.id)
                        globals.$toast.fire({ icon: 'success', text: 'Usuario eliminado con éxito' })
                    }
                })
                .catch(error => globals.$toast.fire({ icon: 'error', text: 'No fue posible eliminar al usuario' }))
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
            admins.passwordEditedItem = Object.assign({}, admins.passwordDefaultItem)
            controls.dialogPassword = false
            controls.showPassword = false
            console.log('Formulario de contraseña limpio', admins.passwordEditedItem)
        }
        const saveAdmin = () => {
            controls.loadingForm = true
            setTimeout(() => {
                if (isEdited.value) {
                    Object.assign(admins.items[admins.editedIndex], admins.editedItem)
                    globals.$toast.fire({ icon: 'success', text: 'Usuario editado con éxito' })
                } else {
                    admins.editedItem.id = globals.$randomUUID()
                    admins.items.push(admins.editedItem)
                    globals.$toast.fire({ icon: 'success', text: 'Usuario creado con éxito' })
                }
                console.log('Formulario de admin enviado: ', admins.editedItem)
                controls.loadingForm = false
                closeDialogForm()
            }, 1000)
        }
        const savePassword = () => {
            /* API Call to update password */
            controls.loadingPassword = true
            admins.passwordEditedItem.idUser = admins.editedItem.id
            console.log('Formulario de contraseña enviado: ', admins.passwordEditedItem)
            setTimeout(() => {
                controls.loadingPassword = false
                closeDialogPassword()
                globals.$toast.fire({ icon: 'success', text: 'Contraseña actualizada' })
            }, 1000)
        }
        /*  */
        initialize()

        return { headers, deleteAdmin, editAdmin, controls, admins, openDialogForm, closeDialogForm, titleDialog, iconDialog, colorDialog, roles, closeDialogPassword, openDialogPassword, isEdited, savePassword, saveAdmin, formRules }
    }
}
</script>