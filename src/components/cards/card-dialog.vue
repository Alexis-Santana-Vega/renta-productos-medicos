<template>
    <v-card :loading="loading" :disabled="disabled" :rounded="(isMobile || fullscreen) ? '0' : 'lg'">
        <template v-slot:loader="{ isActive }">
            <v-progress-linear :active="isActive" :color="color" indeterminate></v-progress-linear>
        </template>
        <v-toolbar :class="isMobile || fullscreen ? '' : 'vss-movable'" density="comfortable">
            <v-avatar :icon="icon" class="ml-4"></v-avatar>
            <v-toolbar-title class="vss-movable text-medium-emphasis" v-text="title"></v-toolbar-title>
            <v-btn icon="mdi-close" @click="$emit('close')"></v-btn>
            <template v-slot:extension v-if="extension">
                <slot name="extension"></slot>
            </template>
        </v-toolbar>
        <!-- Form  -->
        <v-card-text class="bg-background pt-6">
            <slot></slot>
        </v-card-text>
        <!-- Card action events  -->
        <v-card-actions v-if="actions">
            <slot name="actions"></slot>
        </v-card-actions>
    </v-card>
</template>
<script>
export default {
    emits: ['close'],
    props: {
        title: {
            type: String,
            default: null
        },
        icon: {
            type: String,
            default: null
        },
        loading: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        color: {
            type: String,
            default: 'primary'
        },
        actions: {
            type: Boolean,
            default: false
        },
        fullscreen: {
            type: Boolean,
            default: false
        }, 
        mobile: {
            type: Boolean,
            default: false
        },
        extension: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        isMobile() {
            return this.mobile && this.$isMobile()
        }
    }
}
</script>