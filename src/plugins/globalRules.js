export const required = (warning = 'Campo requerido') => v => !!v || warning;

export const requiredLength = (warning = 'Campo requerido') => v => v.length > 0 || warning;

export const minLength = (length, fieldName = 'Campo') =>
    v => (v.length >= length) || `${fieldName} debe tener al menos ${length} caracteres`;

export const maxLength = (length, fieldName = 'Campo') =>
    v => (v.length <= length) || `${fieldName} debe tener máximo ${length} caracteres`;

export const regexMatch = (regex, errorMessage) =>
    v => regex.test(v) || errorMessage;

export const onlyEmail = (fieldName = 'Email') =>
    regexMatch(/.+@.+\..+/, `${fieldName} debe ser: usuario@dominio.ext`)

export const onlyPassword = (fieldName = 'Contraseña') =>
    regexMatch(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&])\S{8,15}$/, `${fieldName} debe contener 8-15, sin espacios, un número, una minúscula, una mayúscula y un carácter especial (ej: @ # $ % &)`)

export const onlyNumbers = (fieldName = 'Campo') =>
    regexMatch(/^[0-9\s()-]*$/, `${fieldName} solo debe contener números`)

export const onlyAmount = (fieldName = 'Monto') => 
    regexMatch(/^[0-9,]+(\.[0-9]{0,2})?$/, `${fieldName} inválido`)
/**
 * 
 * @returns 
 * v => !!v || 'El monto es requerido',
                v => /^[0-9,]+(\.[0-9]{0,2})?$/.test(v) || 'Formato de moneda inválido'
 */

export const requiredFiles = () => v => v.length > 0 || 'Campo requerido'

export const maxFiles = (length = 1) => v => {
    const result = v.length <= length
    if (length == 1) return result || `Máximo ${length} archivo`
    else return result || `Máximo ${length} archivos`
}

export const size = (maxSize = 1048576) => v => {
    const totalSize = v.reduce((sum, file) => sum + (file.size || 0), 0)
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2) // Convertir bytes a MB con 2 decimales
    const totalSizeMB = (totalSize / (1024 * 1024)).toFixed(2) // Tamaño total en MB con 2 decimales
    return totalSize <= maxSize ? true : `El total real(${totalSizeMB} MB) supera el límite de ${maxSizeMB} MB`;
}

export const onlyPDF = () => v => {
    const invalidFiles = v.filter(file => file.type !== "application/pdf");
    return invalidFiles.length === 0
        ? true
        : "Solo se permiten archivos PDF";
}