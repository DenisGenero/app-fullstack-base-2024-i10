//=======[ Settings, Imports & Data ]==========================================

var PORT    = 3000;
var express = require('express');
var app     = express();
var utils   = require('./mysql-connector');

// to parse application/json
app.use(express.json()); 
// to serve static files
app.use(express.static('/home/node/app/static/'));

//=======[ Main module code ]==================================================

// Obtener todos los dispositivos de la base de datos
app.get('/devices/', function(req,res) {
    utils.query("SELECT * FROM Devices", (error,respuesta,fields) => {
        if(error){
            res.status(409).send(error.sqlMessage);    
        }else{
            res.status(200).send(respuesta);
        }
    })
})

// Insertar un nuevo dispositivo a la base de datos
app.post('/device', function (req, res) {
    // Los dispositivos se agregan apagados por defecto
    req.body.state = false;
    // Chequeo de parámetros para cargar un nuevo dispositivo
    if (req.body.name !== undefined && req.body.description !== undefined && req.body.type !== undefined) {
        // Si los parámetros están bien, se hace el insert
        const query = "INSERT INTO Devices (name, description, state, type) VALUES (?, ?, ?, ?)";
        const params = [req.body.name, req.body.description, req.body.state, req.body.type];

        utils.query(query, params, (err, resp) => {
            if (err) {
                // Informar si hubo un error
                res.status(409).send(err.sqlMessage);
            } else {
                // Todo salió bien, devolver un 200
                res.status(200).send(resp);
            }
        });
    } else {
        res.status(400).send("Error en los datos");
    }
});

// Actualizar la información de un dispositivo
app.put('/device/info/', function (req, res) {

    // Consulta preparada para evitar inyección SQL
    const query = "UPDATE Devices SET name = ?, description = ?, type = ? WHERE id = ?";
    const params = [req.body.name, req.body.description, req.body.type, req.body.id];
    
    utils.query(query, params, (err, resp) => {
        if (err) {
            res.status(409).send(err.sqlMessage);
        } else {
            res.status(204).send(resp);
        }
    });
});

// Actualizar el estado de un dispositivo
app.put('/device/state/', function (req, res) {
    utils.query("update Devices set state=" + req.body.state + " where id=" + req.body.id,
        (err, resp) => {
            if (err) {
                res.status(409).send(err.sqlMessage);
            } else {
                res.status(204).send(resp);
            }
        })
})

// Eliminar un dispositivo
app.delete('/device/:id', function (req, res) {
    const deviceId = req.params.id; // Obtener el ID del dispositivo de los parámetros de la URL

    // Consulta para borrar el dispositivo
    const query = "DELETE FROM Devices WHERE id = ?";
    const params = [deviceId];

    utils.query(query, params, (err, resp) => {
        if (err) {
            // Informar si hubo un error
            res.status(409).send(err.sqlMessage);
        } else if (resp.affectedRows === 0) {
            // Si no se encontró ningún dispositivo con ese ID
            res.status(404).send("Dispositivo no encontrado");
        } else {
            // Todo salió bien, devolver un 200
            res.status(200).send("Dispositivo eliminado exitosamente");
        }
    });
});

app.listen(PORT, function(req, res) {
    console.log("NodeJS API running correctly");
});

//=======[ End of file ]=======================================================
