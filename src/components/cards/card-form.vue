<template>
    <v-card>
        <v-card-text>
            <v-icon :icon="icon" opacity=".7" class="mr-2" v-if="icon"></v-icon>
            <span class="text-body-1 font-weight-bold text-medium-emphasis" v-text="title"></span>
            <div class="pt-4">
                <slot></slot>
            </div>
        </v-card-text>
    </v-card>
</template>
<script>
export default {
    props: {
        title: {
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