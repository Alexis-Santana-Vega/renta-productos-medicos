<template>
    <v-container fluid>
        <card-table title="Usuarios Sistema" :subtitle="subtitlePage" icon="mdi-account-cog-outline">
            <template v-slot:append>
                <v-btn variant="tonal" icon="mdi-cog-outline" @click="roleControls.dialog = true"></v-btn>
            </template>
            <v-row dense>
                <v-col cols="12" sm="12" :md="isSysAdmin ? 4 : 8" :lg="isSysAdmin ? 4 : 8" :xl="isSysAdmin ? 6 : 9">
                    <iterator-header>
                        <btn-custom prepend-icon="mdi-plus" :block="$isMobile()" @click="openDialogForm()">Nuevo
                            Usuario</btn-custom>
                    </iterator-header>
                </v-col>
                <v-col cols="12" sm="12" md="4" lg="4" xl="3" v-if="isSysAdmin">
                    <iterator-header>
                        <v-select v-model="controls.location" placeholder="Locación" single-line hide-details
                            prepend-inner-icon="mdi-map-marker-outline" :items="locations" item-value="id"
                            item-title="name" @update:model-value="handleLocation"></v-select>
                    </iterator-header>
                </v-col>
                <v-col cols="12" sm="12" md="4" lg="4" xl="3">
                    <iterator-header>
                        <v-text-field v-model="controls.search" placeholder="Buscar" single-line hide-details clearable
                            prepend-inner-icon="mdi-magnify"></v-text-field>
                    </iterator-header>
                </v-col>
                <v-col cols="12">
                    <v-data-table :items="admins.items" :headers="headers" :search="controls.search"
                        :loading="controls.loadingTable">
                        <template v-slot:loading>
                            <v-skeleton-loader type="table-row@10"></v-skeleton-loader>
                        </template>
                        <template v-slot:item.userName="{ value }">
                            <span class="text-caption font-weight-medium">{{ value }}</span>
                        </template>
                        <template v-slot:item.roles="{ value }">
                            <v-chip v-for="(item, i) in value" :key="i" class="ma-1">{{ item }}</v-chip>
                        </template>
                        <template v-slot:item.active="{ value }">
                            <v-chip :color="value ? 'success' : 'error'">{{ value ? 'Activo' : 'Inactivo' }}</v-chip>
                        </template>
                        <template v-slot:item.location="{ value }">
                            <v-avatar icon="mdi-map-marker-outline" variant="tonal" color="tertiary" size="small" />
                            <span class="text-caption ml-2">{{ value }}</span>
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
                                    <v-col cols="12" sm="12" md="5" lg="5" xl="2">
                                        <v-select v-model="admins.editedItem.roles" label="Selecciona un rol *"
                                            prepend-inner-icon="mdi-account-cog-outline" :color="colorDialog"
                                            :rules="formRules.roles" :items="roles" item-value="value"
                                            item-title="title" multiple chips></v-select>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="5" lg="5" xl="2">
                                        <v-select v-model="admins.editedItem.locationId" label="Locación *"
                                            :color="colorDialog" :items="locations" item-value="id" item-title="name"
                                            :rules="formRules.location" :readonly="!isSysAdmin"></v-select>
                                    </v-col>
                                    <v-col cols="12" sm="12" md="2" lg="2" xl="2">
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
                                        :type="controls.showPassword ? 'text' : 'password'"
                                        :rules="formRules.password"></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field v-model="admins.passwordEditedItem.newPassword"
                                        label="Nueva Contraseña *" prepend-inner-icon="mdi-account-key-outline"
                                        :type="controls.showPassword ? 'text' : 'password'"
                                        :rules="formRules.repPass"></v-text-field>
                                </v-col>
                                <v-col cols="12">
                                    <v-switch v-model="controls.showPassword" label="Mostrar campos" color="primary"
                                        hide-details></v-switch>
                                </v-col>
                                <v-col cols="12" class="text-caption text-disabled">* Campos requeridos</v-col>
                                <v-col cols="12" class="d-flex flex-wrap ga-2 justify-end">
                                    <btn-custom variant="tonal" @click="closeDialogPassword()">Cancelar</btn-custom>
                                    <btn-custom variant="elevated" color="primary" type="submit"
                                        :loading="controls.loadingPassword"
                                        :disabled="!controls.validPassForm">Cambiar</btn-custom>
                                </v-col>
                            </v-row>
                        </card-form>
                    </v-form>
                </card-dialog>
            </v-dialog>
        </v-dialog>
        <v-dialog v-model="roleControls.dialog" scrollable width="400">
            <card-dialog title="Cambiar Rol" icon="mdi-cog-outline" @close="roleControls.dialog = false">
                <v-select v-model="user.role" label="Seleccionar Rol *" :items="roleControls.vSelectItems"
                    item-value="value" item-title="title" @update:model-value="handleRole"></v-select>
            </card-dialog>
        </v-dialog>
        <loading-overlay v-model="controls.loadingOverlay" />
    </v-container>
</template>
<script>
import { fakeApiGetUsers } from '@/plugins/fakeApi';
import { maxLength, onlyEmail, onlyNumbers, onlyPassword, required, requiredLength } from '@/plugins/globalRules';
import { computed, getCurrentInstance, nextTick, reactive, watch } from 'vue';

export default {
    setup() {
        const { proxy } = getCurrentInstance()
        const globals = proxy
        /* Data */
        const controls = reactive({
            dialogForm: false,
            dialogPassword: false,
            loadingTable: false,
            loadingOverlay: false,
            loadingForm: false,
            loadingPassword: false,
            tabModel: 1,
            search: '',
            showPassword: false,
            validForm: false,
            validPassForm: false,
            location: null
        })
        const admins = reactive({
            items: [],
            editedItem: {
                id: '', locationId: null, firstName: '', lastName: '', userName: '', password: '', roles: ['CLIENTE'], active: true, mobilePhone: '', phoneOffice: '', phoneExt: '', email: ''
            },
            defaultItem: {
                id: '', locationId: null, firstName: '', lastName: '', userName: '', password: '', roles: ['CLIENTE'], active: true, mobilePhone: '', phoneOffice: '', phoneExt: '', email: ''
            },
            passwordEditedItem: {
                idUser: '', oldPassword: '', newPassword: ''
            },
            passwordDefaultItem: {
                idUser: '', oldPassword: '', newPassword: ''
            },
            editedIndex: -1
        })
        const formRules = {
            firstName: [required('Nombre(s) requerido(s)'), maxLength(30, 'Nombre(s)')],
            lastName: [required('Apellido(s) requerido(s)'), maxLength(30, 'Apellido(s)')],
            userName: [required('ID Usuario requerido'), maxLength(30, 'ID Usuario')],
            roles: [required('Rol requerido'), requiredLength('Rol requerido')],
            password: [required('Contraseña requerida'), maxLength(30, 'Contraseña'), onlyPassword()],
            repPass: [required('Contraseña requerida'), maxLength(30, 'Contraseña'), onlyPassword()],
            location: [required('Locación requerida'), requiredLength('Locación requerida')],
            mobilePhone: [maxLength(15, 'Tel. Móvil'), onlyNumbers('Tel. Móvil')],
            phoneOffice: [maxLength(15, 'Tel. Oficina'), onlyNumbers('Tel. Oficina')],
            phoneExt: [maxLength(15, 'Extensión'), onlyNumbers('Extensión')],
            email: [required('Email requerido'), maxLength(60, 'Email'), onlyEmail()]
        }
        const roles = [
            { value: 'ADMIN', title: 'Admin' },
            { value: 'CLIENTE', title: 'Cliente' }
        ]
        const locations = [
            { id: '1', name: 'Monterrey, N.L' },
            { id: '2', name: 'Apodaca, N.L' },
            { id: '3', name: 'Santa Catarina, N.L' },
            { id: '4', name: 'Escobedo, N.L' },
        ]
        const headers = reactive( // Quitar reactive después
            [
                { key: 'fullName', title: 'NOMBRE', value: 'fullName' },
                { key: 'userName', title: 'ID USUARIO', value: 'userName' },
                { key: 'roles', title: 'ROLES' },
                { key: 'active', title: 'ACTIVO' },
                { key: 'actions', title: 'ACCIONES', sortable: false, align: 'end' },
            ]
        )
        /* User Params from Javalin */
        const user = reactive({
            role: 'SYSADMIN',
            locationId: '1',
            location: 'Monterrey, N.L'
        })
        /* Data to render by role */
        const roleControls = reactive({
            dialog: false,
            vSelectItems: [
                { title: 'Admin de sistema', value: 'SYSADMIN' },
                { title: 'Admin de locación (Monterrey)', value: 'ADMIN' },
            ]
        })
        /* Computed methods */
        const isSysAdmin = computed(() => user.role === 'SYSADMIN')
        const subtitlePage = computed(() => isSysAdmin.value ? 'Gestión de todos los usuarios del sistema' : `Gestión de los usuarios de: ${user.location}`) // Quitar del computed despues
        const isEdited = computed(() => admins.editedIndex !== -1)
        const titleDialog = computed(() => isEdited.value ? 'Editar Usuario' : 'Nuevo Usuario')
        const iconDialog = computed(() => isEdited.value ? 'mdi-circle-edit-outline' : 'mdi-plus')
        const colorDialog = computed(() => isEdited.value ? 'secondary' : 'primary')

        /* Methods */
        const initialize = () => {
            if (isSysAdmin) headers.splice(4, 0, { key: 'location', title: 'LOCACIÓN' })
            else {
                admins.defaultItem.locationId = user.locationId
                admins.editedItem.locationId = user.locationId
            }
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
        const handleLocation = (e) => {
            controls.loadingTable = true
            admins.items.length = 0
            fakeApiGetUsers(e)
                .then(result => {
                    admins.items.splice(0, admins.items.length, ...result)
                })
                .catch(error => {
                    // globals.$toast.fire({ icon: 'warning', text: error })
                })
                .finally(() => controls.loadingTable = false)
        }
        /* Method only used to show render. Delete this method later */
        const handleRole = async (e) => {
            if (e === 'SYSADMIN') {
                headers.splice(4, 0, { key: 'location', title: 'LOCACIÓN' })
                admins.defaultItem.locationId = null
                admins.editedItem.locationId = null
                admins.items.length = 0
                controls.location = null
            }
            else {
                headers.splice(4, 1)
                admins.defaultItem.locationId = user.locationId
                admins.editedItem.locationId = user.locationId
                handleLocation(user.locationId)
            }
        }
        /*  */
        initialize()

        return { headers, deleteAdmin, editAdmin, controls, admins, openDialogForm, closeDialogForm, titleDialog, iconDialog, colorDialog, roles, closeDialogPassword, openDialogPassword, isEdited, savePassword, saveAdmin, formRules, subtitlePage, isSysAdmin, locations, roleControls, user, handleRole, handleLocation }
    }
}
</script>