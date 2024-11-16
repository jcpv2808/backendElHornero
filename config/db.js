const mongoose = require("mongoose")
const global = require('./global.js')

const conectarBD = async () =>{
    try{
        await mongoose.connect(global.dataBase, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("conexion exitosa - RESERVAS")
    }catch(error){
        console.log("No se pudo conectar con la BD: " + error)
        process.exit()
    }
}

module.exports = conectarBD