/* Datos para fake API de Scanner */
const fakeEquipment = [
    { productId: '5012345678900', name: 'Ventiler Nat QA', photoUrl: 'https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcTkA7_5ETVLqFMvg79zbM7CMMKnXR_EFHdAqpBEgrFa-wwx7u_KB9XL8pwdTyda0fPU0io-dhbWNvP_K2g36z6kG7sPPrrHVQYiiIU_mgUrebjNXTV4gX1-mg' },
    { productId: '4006381333931', name: 'Neo Camilla v3', photoUrl: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQ4M0d9OtSE8EuxyPoLrSRioIjcnJDZFcjBTbSkiEdptI9bilNIM8F_GRXKcTL7ep76X98oltTtKruk4d02l18YB6B0EWQs3m6fw8Gc0xYQgeBFSCeevHCdc1E' },
    { productId: '9780201379624', name: 'ThermaBath 100', photoUrl: 'https://www.somatechnology.com/spanish/wp-content/uploads/sites/2/2018/03/ERBE-VIO-300S-Electrobisturis-2.jpg' },
    { productId: '6901234567892', name: 'BioSafe B2', photoUrl: 'https://bioap.com.mx/wp-content/uploads/2023/05/Lina-xcise-Cordless-Morcellator-2-e1686345910274.jpg' },
    { productId: '8801234567896', name: 'MicroScope Pro', photoUrl: 'https://image.made-in-china.com/2f0j00DJYiZIRzYgpS/B2-Biosafeti-2-Esco-II-A2-Class-3-Heal-Force-Cabinets-Laboratory-Biosafety-Cabinet.webp' },
    { productId: '5601234567897', name: 'AutoPipette X3', photoUrl: 'https://m.media-amazon.com/images/I/71pG4APOtbL._UF350,350_QL80_.jpg' },
    { productId: '8901234567893', name: 'Drager Oxylog 300', photoUrl: 'https://www.draeger.com/Media/Content/Products/Default/Draeger-Oxylog-3000-plus-1-MT-5809-2008.jpg' },
    { productId: '7701234567890', name: 'HoneyWell H6024 a10 Plus', photoUrl: 'https://m.media-amazon.com/images/I/61sIys3lxaL._UF894,1000_QL80_.jpg' },
    { productId: '7501031311305', name: 'OxyFlow 5L Oxygen XML', photoUrl: 'https://5.imimg.com/data5/SELLER/Default/2021/6/KP/DV/GP/109247365/oxyflow-5-500x500.jpg' },
    { productId: '8412345678902', name: 'RadowLife 1', photoUrl: 'https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcRypcJCgyQicFzMqxS1BDB4YMEPx2BQTVqe9nVHgPr6Rg-xADuFSt_AInyeJfXAIi29uCcjGR1E3qebtRpcKSdLCFqgbSpKu3da4BdpuXIJZZnuRZKulDDq' },
]

/* Simulacion API para seleccionar equipo de la base de datos */
const fakeApiGetUser = (productId) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const equipment = fakeEquipment.find(i => i.productId === String(productId))
            if (equipment) {
                resolve(equipment)
            } else {
                reject(new Error("Equipo no registrado"))
            }
        }, 500)
    })
}

/* Datos para fake API de Usuarios */
const fakeUsers = [
    { id: '1', firstName: 'Alexis', lastName: 'Santana', fullName: 'Alexis Santana', userName: 'alexis.santana', mobilePhone: '', phoneOffice: '', phoneExt: '', roles: ['ADMIN'], active: true, email: 'alexis@gmail.com', location: 'Monterrey, N.L', locationId: '1' },
    { id: '2', firstName: 'Gerardo', lastName: 'Suarez', fullName: 'Gerardo Suarez', userName: 'gerardo.suarez', mobilePhone: '', phoneOffice: '', phoneExt: '', roles: ['ADMIN', 'CLIENTE'], active: true, email: 'gerardo@gmail.com', location: 'Apodaca, N.L', locationId: '2' },
    { id: '3', firstName: 'Carmen', lastName: 'Vega', fullName: 'Carmen Vega', userName: 'carmen.vega', mobilePhone: '7744110022', phoneOffice: '', phoneExt: '', roles: ['CLIENTE'], active: false, email: 'carmen@gmail.com', location: 'Santa Catarina, N.L', locationId: '3' },
    { id: '4', firstName: 'Hector', lastName: 'Nuñez', fullName: 'Hector Nuñez', userName: 'hector.nunez', mobilePhone: '', phoneOffice: '', phoneExt: '', roles: ['CLIENTE'], active: true, email: 'hector@gmail.com', location: 'Monterrey, N.L', locationId: '1' },
    { id: '5', firstName: 'Moises', lastName: 'Avila', fullName: 'Moises Avila', userName: 'moises.avila', mobilePhone: '1122334455', phoneOffice: '9988776655', phoneExt: '52', roles: ['CLIENTE'], active: true, email: 'marvin@gmail.com', location: 'Apodaca, N.L', locationId: '2' },
]
/** Simulacion API para seleccionar usuarios de la base de datos */
const fakeApiGetUsers = (locationId) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = fakeUsers.filter(i => i.locationId === locationId)
            if (users.length > 0) {
                resolve(users)
            } else {
                reject(new Error("Alerta de ejemplo, no hay usuarios en esta locación"))
            }
        }, 500)
    })
}
export { fakeApiGetUser, fakeApiGetUsers }
