require('dotenv').config(); 
const mongoose = require("mongoose")
const conectarBD = async () =>{
    try{
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("conexion exitosa - ELHORNERO")
    }catch(error){
        console.log("No se pudo conectar con la BD: " + error)
        process.exit()
    }
}

module.exports = conectarBD