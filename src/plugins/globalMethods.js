import Swal from "sweetalert2"

export default {
    install(app) {
        app.config.globalProperties.$isMobile = function () {
            return this.$vuetify.display.smAndDown
        }

        app.config.globalProperties.$randomUUID = function () {
            return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c => (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16).toUpperCase())
        }

        app.config.globalProperties.$deleteFromArray = function (array, id) {
            const index = array.findIndex(obj => obj.id == id)
            if (index != -1) {
                array.splice(index, 1)
            }
        }

        app.config.globalProperties.$toast = Swal.mixin({
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3500,
            timerProgressBar: true,
            background: 'rgb(var(--v-theme-surface))',
            color: 'rgb(var(--v-theme-surface-variant))',
            didOpen: (evtToast) => {
                evtToast.addEventListener('mouseenter', Swal.stopTimer)
                evtToast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })

        app.config.globalProperties.$swalConfirm = async (title, icon, text) => {
            return await Swal.fire({
                title: title,
                icon: icon,
                text: text,
                showCancelButton: true,
                color: 'rgb(var(--v-theme-surface-variant))',
                background: 'rgb(var(--v-theme-surface))',
                confirmButtonColor: 'rgb(var(--v-theme-primary))',
                cancelButtonColor: 'rgb(var(--v-theme-surface))',
                confirmButtonText: '<span style="color: #FFFFFF;">Confirmar</span>',
                cancelButtonText: '<span style="color: rgb(var(--v-theme-primary));">Cancelar</span>',
                reverseButtons: true,
            })
        }

        app.config.globalProperties.$productStatusColor = (status) => {
            switch(status) {
                case 'DISPONIBLE': return 'success'
                case 'OCUPADO': return 'warning'
                case 'SUSPENDIDO': return 'error'
                default: return 'primary'
            }
        }

        app.config.globalProperties.$productStatus = [
            'DISPONIBLE', 'OCUPADO', 'SUSPENDIDO'
        ]
    }
}