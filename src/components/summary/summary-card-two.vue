<template>
    <v-card-text class="d-flex">
        <v-avatar :variant="variant" :color="color" size="x-large">
            <v-icon :icon="icon" size="x-large"></v-icon>
        </v-avatar>
        <div class="pl-4">
            <div class="text-body-1 font-weight-medium" v-text="text"></div>
            <div :class="`text-h5 font-weight-bold text-${color}`" v-text="number"></div>
        </div>
    </v-card-text>
</template>
<script>
export default {
    props: {
        variant: {
            type: String,
            default: 'default'
        },
        color: {
            type: String,
            default: 'default'
        },
        text: {
            type: [String, Number],
            default: null
        },
        number: {
            type: [String, Number],
            default: null
        },
        icon: {
            type: [String, Number],
            default: null
        }
    }
}
</script>