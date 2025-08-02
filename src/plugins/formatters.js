export const onlyIntegerNumbers = event => {
    const key = event.key
    if (!/^\d$/.test(key)) {
        event.preventDefault()
    }
}