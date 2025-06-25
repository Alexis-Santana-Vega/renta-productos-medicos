<template>
    <v-card :variant="variant" :color="color">
        <v-card-text class="d-flex justify-space-between">
            <div class="pr-4">
                <div class="text-h5 font-weight-bold"v-text="number"></div>
                <div class="text-body-1" v-text="text"></div>
            </div>
            <v-avatar :variant="variant" :color="color" size="x-large">
                <v-icon :icon="icon" size="x-large"></v-icon>
            </v-avatar>
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