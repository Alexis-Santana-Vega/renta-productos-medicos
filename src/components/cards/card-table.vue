<template>
    <v-card :title="title" :subtitle="subtitle">
        <template v-slot:prepend>
            <v-avatar :icon="icon" class="ml-n2" v-if="icon"></v-avatar>
        </template>
        <v-card-text class="px-4 pb-4" v-if="$slots.default">
            <slot></slot>
        </v-card-text>
        <template v-slot:append>
            <slot name="append"></slot>
        </template>
    </v-card>
</template>
<script>
export default {
    props: {
        title: {
            type: String,
            default: null
        },
        subtitle: {
            type: String,
            default: null
        },
        icon: {
            type: String,
            default: null
        }
    }
}
</script>