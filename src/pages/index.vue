<template>
  <div class="h-100 pa-4">
    <v-card class="h-100" :loading="loadingLogin" :disabled="loadingLogin">
      <template v-slot:loader="{ isActive }">
        <v-progress-linear :active="isActive" color="primary" indeterminate></v-progress-linear>
      </template>
      <v-row class="h-100" no-gutters>
        <v-col cols="0" sm="12" md="6" lg="6" xl="7" class="pa-4">
          <div
            class="rounded-lg background-image d-flex flex-column align-center justify-center h-100 text-white pa-4">
            <div class="text-h3 font-weight-black">Bienvenido</div>
            <div class="my-2 font-weight-medium">Tu equipo médico, en un clic.</div>
            <div class="d-flex">
              <v-tooltip location="left">
                <template v-slot:activator="{ props }">
                  <v-avatar icon="mdi-hospital-box-outline" variant="tonal" size="large" class="mr-2"
                    v-bind="props"></v-avatar>
                </template>
                <span>Equipos</span>
              </v-tooltip>
              <v-tooltip location="right">
                <template v-slot:activator="{ props }">
                  <v-avatar icon="mdi-medication-outline" variant="tonal" size="large" v-bind="props"></v-avatar>
                </template>
                <span>Insumos</span>
              </v-tooltip>
            </div>
          </div>
        </v-col>
        <v-col cols="12" sm="12" md="6" lg="6" xl="5" class="pa-4">
          <div class="h-100 d-flex align-center justify-center">
            <div class="container-form">
              <v-row dense class="d-flex justify-center">
                <v-avatar rounded="circle" size="90">
                  <v-img src="https://static.vecteezy.com/system/resources/previews/053/066/817/non_2x/icon-free-logo-javascript-free-png.png" />
                </v-avatar>
              </v-row>
              <v-window v-model="step" class="h-100">
                <v-window-item :value="1" class="h-100">
                  <v-form v-model="formRules.valid" @submit.prevent="loginUser()">
                    <v-row dense>
                      <v-col class="text-center text-medium-emphasis">
                        <div class="text-h5 font-weight-black mt-4">Inicio de Sesión</div>
                        <div class="text-body-2 mb-6">Ingrese a la plataforma para consultar nuestro catálogo:</div>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field v-model="userModel.userName" :rules="formRules.userName" label="ID Usuario"
                          prepend-inner-icon="mdi-account-outline"></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field v-model="userModel.password" :rules="formRules.password" label="Contraseña"
                          prepend-inner-icon="mdi-key-outline"
                          :append-inner-icon="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                          :type="showPassword ? 'text' : 'password'"
                          @click:append-inner="showPassword = !showPassword"></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field v-model="userModel.role" :rules="formRules.role" label="Rol"
                          prepend-inner-icon="mdi-account-group-outline"></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <btn-custom :block="true" :disabled="!formRules.valid" :loading="loadingLogin"
                          type="submit">Ingresar</btn-custom>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-window-item>
                <v-window-item :value="2" class="h-100">
                  <v-form ref="formOtp" v-model="otpValid" @submit.prevent="verifyCode()" class="w-100">
                    <v-row dense>
                      <v-col class="text-center text-medium-emphasis">
                        <div class="text-h5 font-weight-black mt-4">Inicio de Sesión</div>
                        <div class="text-body-2 mb-0">Consulte su correo para obtener su código de ingreso:</div>
                      </v-col>
                      <v-col cols="12">
                        <v-otp-input v-model="otpModel" length="6"></v-otp-input>
                      </v-col>
                      <v-col cols="12">
                        <btn-custom :block="true" :disabled="!otpValid" :loading="loadingLogin"
                          type="submit">Confirmar</btn-custom>
                      </v-col>
                      <v-col cols="12" class="text-center">
                        <v-btn size="small" variant="text" prepend-icon="mdi-email-sync-outline" class="text-caption mt-4"
                          @click="resendEmail()" :loading="loadingCode" :disabled="loadingCode">
                          Reenviar código de verificación
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-form>
                </v-window-item>
              </v-window>
              <v-row>
                <v-col cols="12" class="mt-6 text-caption text-center">
                  <div class="text-medium-emphasis mb-2">
                    Renta de Equipo Médico a Hospitales y Particulares
                  </div>
                  <v-chip prepend-icon="mdi-phone-outline">¿Desea comunicarse directamente?</v-chip>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
import { maxLength, required } from '@/plugins/globalRules'

export default {
  data: () => ({
    step: 1,
    loadingCode: false,
    loadingLogin: false,
    showPassword: false,
    userModel: { role: null, userName: null, password: null },
    formRules: {
      valid: false,
      role: [required('Rol requerido'), maxLength(15, 'Rol')],
      userName: [required('ID Usuario requerido'), maxLength(30, 'ID Usuario')],
      password: [required('Contraseña requerida'), maxLength(60, 'Contraseña')]
    },
    otpModel: "",
  }),
  computed: {
    otpValid() {
      return this.otpModel.length === 6
    }
  },
  methods: {
    loginUser() {
      console.log("Iniciando sesión")
      this.loadingLogin = true
      setTimeout(() => {
        this.step = 2
        this.loadingLogin = false
      }, 1000)
    },
    verifyCode() {
      console.log("Revisando código")
      console.log(this.otpModel)
      this.loadingLogin = true
      setTimeout(() => {
        this.loadingLogin = false
      }, 1000)
    },
    resendEmail() {
      console.log("Reenviando código")
      this.loadingCode = true
      setTimeout(() => {
        this.loadingCode = false
      }, 1000)
    },
    callToPhone() {
      console.log("Mandando mensaje directo al télefono")
    }
  }
}
</script>
<style scoped>
.background-image {
  background-image: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.8)), url('../assets/login-background.jpg');
  background-size: cover;
  background-position: center;
  border-radius: 0;
}

.container-form {
  width: 400px;
  max-width: 500px;
}
</style>