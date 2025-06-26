<template>
    <v-card :height="height" :width="width" :max-height="maxHeight" :max-width="maxWidth" :rounded="rounded"
        :image="src" @click.stop="dialog = true">
        <slot name="actions"></slot>
    </v-card>
    <v-dialog v-model="dialog" fullscreen scrollable>
        <v-card rounded="0" class="h-100 w-100">
            <v-toolbar color="surface">
                <v-toolbar-title v-if="!isMobile" class="font-weight-medium">Visualización</v-toolbar-title>
                <div class="d-flex align-center flex-wrap ga-1">
                    <span class="text-caption"><span class="font-weight-black">Zoom </span>{{ size }}</span>
                    <v-btn icon="mdi-minus" variant="tonal" color="primary" size="small" @click="decrementZoom()"
                        :disabled="sizeInt === 150"></v-btn>
                    <v-btn icon="mdi-plus" variant="tonal" color="primary" size="small" @click="incrementZoom()"
                        :disabled="sizeInt === 500"></v-btn>
                </div>
                <v-spacer></v-spacer>
                <v-btn icon="mdi-close" @click="dialog = false"></v-btn>
            </v-toolbar>
            <v-card-text class="d-flex align-center justify-center">
                <div id="imageZoom"
                    :class="`text-center bg-surface ${$vuetify.display.smAndDown ? 'w-100' : 'w-50'} h-100`" :style="{
                        '--url': `url(${src})`,
                        '--zoom-x': zoomX,
                        '--zoom-y': zoomY,
                        '--display': display,
                        '--size': size
                    }" @mousemove="handleMouseMove" @mouseout="handleMouseOut">
                    <v-img :src="src" alt="Imagen con Zoom"></v-img>
                </div>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>

<script>
export default {
    props: {
        src: {
            type: String,
            required: true
        },
        height: {
            type: String,
            default: '200px'
        },
        width: {
            type: String,
            default: '200px'
        },
        maxWidth: String,
        maxHeight: String,
        rounded: String
    },
    data: () => ({
        dialog: false,
        hover: false,
        zoomX: '0%',
        zoomY: '0%',
        display: 'none',
        size: '150%',
        sizeInt: 150,
    }),
    computed: {
        isMobile() {
            return this.$vuetify.display.smAndDown
        }
    },
    methods: {
        handleMouseMove(event) {
            this.display = 'block';
            const rect = event.currentTarget.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 100;
            const y = ((event.clientY - rect.top) / rect.height) * 100;
            this.zoomX = `${x}%`;
            this.zoomY = `${y}%`;
        },
        handleMouseOut() {
            this.display = 'none';
        },
        incrementZoom() {
            this.sizeInt += 50
            this.size = `${this.sizeInt}%`
        },
        decrementZoom() {
            this.sizeInt -= 50
            this.size = `${this.sizeInt}%`
        }
    }
}
</script>

<style scoped>
#imageZoom {
    position: relative;
}

#imageZoom .v-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: 0 0;
}

#imageZoom::after {
    display: var(--display);
    content: '';
    width: 100%;
    height: 100%;
    background-color: transparent;
    background-image: var(--url);
    background-size: var(--size);
    background-position: var(--zoom-x) var(--zoom-y);
    position: absolute;
    left: 0;
    top: 0;
}
</style>