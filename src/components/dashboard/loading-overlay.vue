<template>
    <v-overlay class="d-flex justify-center align-center text-center" persistent :contained="contained" :scrim="color"
        :opacity="opacity">
        <v-progress-circular :color="color" bg-color="transparent" :size="size" width="8" indeterminate v-if="circular"></v-progress-circular>
        <slot></slot>
    </v-overlay>
</template>
<script>
export default {
    props: {
        color: {
            type: String,
            default: 'primary'
        },
        size: {
            type: String,
            default: '72'
        },
        contained: {
            type: Boolean,
            default: false
        },
        opacity: {
            type: [String, Number],
            default: 0.1
        },
        circular: {
            type: Boolean,
            default: true
        }
    }
}
</script>