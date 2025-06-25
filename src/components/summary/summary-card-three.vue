<template>
    <v-card variant="flat" :class="`border-b-lg border-opacity-100 border-${color}`">
        <v-card-text>
            <div class="d-flex align-center justify-center pb-2">
                <v-avatar :variant="variant" :color="color" size="x-large">
                    <v-icon :icon="icon" size="x-large"></v-icon>
                </v-avatar>
                <div class="text-h5 font-weight-bold pl-4" v-text="number"></div>
            </div>
            <div class="text-body-1 text-center" v-text="text"></div>
        </v-card-text>
    </v-card>
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