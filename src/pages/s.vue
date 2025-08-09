<template>
    <div class="overlay">
        <div class="scan-area">
            <div class="corner top-left"></div>
            <div class="corner top-right"></div>
            <div class="corner bottom-left"></div>
            <div class="corner bottom-right"></div>
        </div>

    </div>
</template>
<style>

.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.7);
    /* Oscurece todo */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.scan-area {
    position: relative;
    width: 300px;
    height: 300px;
    box-sizing: border-box;
    background-color: transparent;
    z-index: 2;
}

/* Esquinas del marco */
.corner {
    position: absolute;
    width: 30px;
    height: 30px;
    border: 3px solid rgba(0, 255, 255, 0.5);
    z-index: 3;
}

.top-left {
    top: 0;
    left: 0;
    border-right: none;
    border-bottom: none;
}

.top-right {
    top: 0;
    right: 0;
    border-left: none;
    border-bottom: none;
}

.bottom-left {
    bottom: 0;
    left: 0;
    border-right: none;
    border-top: none;
}

.bottom-right {
    bottom: 0;
    right: 0;
    border-left: none;
    border-top: none;
}

/* Texto de instrucción */
.instruction {
    margin-top: 20px;
    font-size: 16px;
    color: white;
    z-index: 2;
}

/* "Ventana" transparente recortada */
.overlay::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 300px;
    height: 300px;
    transform: translate(-50%, -50%);
    box-shadow:
        0 0 0 9999px rgba(0, 0, 0, 0.7);
    z-index: 1;
    pointer-events: none;
}
</style>