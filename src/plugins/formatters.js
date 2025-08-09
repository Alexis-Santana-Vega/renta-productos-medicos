export const onlyIntegerNumbers = event => {
    const key = event.key
    if (key === 'Enter') return
    if (!/^\d$/.test(key)) {
        event.preventDefault()
    }
}

export const validateNumberInput = (event, currentValue) => {
    // Permitir teclas de control
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
    if (allowedKeys.includes(event.key)) {
        return true
    }
    // Permitir solo números y un solo punto decimal
    if (!/[0-9]|\./.test(event.key)) {
        event.preventDefault()
        return false
    }
    // Evitar más de un punto decimal
    if (event.key === '.' && currentValue.includes('.')) {
        event.preventDefault()
        return false
    }
}

export const addCommasToNumber = (value) => {
    if (!value) return ''
    // Separar parte entera y decimal
    const parts = String(value).split('.')
    let integerPart = parts[0]
    const decimalPart = parts.length > 1 ? `.${parts[1]}` : ''
    // Agregar comas cada 3 dígitos
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return integerPart + decimalPart
}

export const formatCurrencyInput = (inputEvent, targetObject, propertyName) => {
    // Obtener el valor sin formato
    let value = inputEvent.target.value.replace(/,/g, '')
    // Verificar si el valor es válido
    if (!value || isNaN(value)) {
        targetObject[propertyName] = ''
        return
    }
    // Limitar a dos decimales
    if (value.includes('.')) {
        const parts = value.split('.')
        if (parts[1].length > 2) {
            value = `${parts[0]}.${parts[1].substring(0, 2)}`
        }
    }
    // Formatear con comas
    targetObject[propertyName] = addCommasToNumber(value)
}