export const required = (warning = 'Campo requerido') => v => !!v || warning;

export const requiredLength = (warning = 'Campo requerido') => v => v.length > 0 || warning;

export const minLength = (length, fieldName = 'Campo') =>
    v => (v.length >= length) || `${fieldName} debe tener al menos ${length} caracteres`;

export const maxLength = (length, fieldName = 'Campo') =>
    v => (v.length <= length) || `${fieldName} debe tener máximo ${length} caracteres`;