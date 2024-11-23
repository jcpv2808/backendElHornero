require('dotenv').config();
const express = require('express')
const cors = require('cors')

const conectarBD = require('./config/db')

const app = express()
const port =  process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors())

app.get('/', (req, res)=>{
    res.send("API funcionando")
})

//CRUD - RESERVAS
app.use('/api/reservas', require('./routes/reservas'))

//CRUD - LOCALES 
app.use('/api/locales', require('./routes/locales'))

//CONECCION
conectarBD()
    .then(() => {
        app.listen(port, () => {
            console.log(`Escuchando en el puerto ${port} - http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.log("Error al conectar a la base de datos", error);
    });
