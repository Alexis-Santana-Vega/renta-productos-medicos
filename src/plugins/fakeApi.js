const fakeEquipment = [
    { id: '1_EM-0010-RT', name: '', photoUrl: '' },
    { id: '1_EM-0015-RT', name: '', photoUrl: '' },
    { id: '1_EM-0020-RT', name: '', photoUrl: '' },
    { id: '1_EM-0025-RT', name: '', photoUrl: '' },
    { id: '1_EM-0030-RT', name: '', photoUrl: '' },
    { id: '1_EM-0035-RT', name: '', photoUrl: '' },
    { id: '1_EM-0040-RT', name: '', photoUrl: '' },
    { id: '1_EM-0045-RT', name: '', photoUrl: '' },
    { id: '1_EM-0050-RT', name: '', photoUrl: '' },
    { id: '1_EM-0055-RT', name: '', photoUrl: '' },
]

/* Simulacion API para seleccionar equipo de la base de datos */
const fakeApiGetUser = (id) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const equipment = fakeEquipment.find(i => i.id === id)
            if (equipment) {
                resolve(equipment)
            } else {
                reject(new Error("Equipo no registrado"))
            }
        }, 500)
    })
}

export { fakeApiGetUser }
