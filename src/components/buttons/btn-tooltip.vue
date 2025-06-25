<template>
    <v-btn :color="iconColor" icon :variant="variant" :size="size" :density="density">
        <v-icon :icon="icon" :size="iconSize"></v-icon>
        <v-tooltip activator="parent" :text="text" :location="location" :content-class="`bg-${color} font-weight-medium`" v-if="text"></v-tooltip>
    </v-btn>
</template>
<script>
export default {
    props: {
        density: {
            type: String,
            default: 'default'
        },
        text: {
            type: String,
            default: null
        },
        color: {
            type: String,
            default: null
        },
        icon: {
            type: String,
            default: null
        },
        variant: {
            type: String,
            default: 'text'
        },
        location: {
            type: String,
            default: 'top'
        },
        size: {
            type: String,
            default: 'small'
        },
        iconSize: {
            type: String,
            default: 'large'
        },
        iconColor: {
            type: String,
            default: null
        }
    }
}
</script>