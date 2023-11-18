const express = require('express')
const app = express()
const sqlite = require("sqlite3").verbose();
const cors = require('cors');
app.use(cors());
const port = 3500
const adminkey = "admin";
let destinations;
let flights;
let db = new sqlite.Database("db/main.db", (err) => {
    if (err)
        return console.log(err.message);
    console.log("Connected to webserver database!");
});
function updateDestinations() {
    db.all("SELECT * FROM destinations;", function (err, rows) {
        if (err)
            return console.error(err);
        destinations = rows;
    });
}
function updateFlights() {
    db.all("SELECT * FROM flights;", function (err, rows) {
        if (err)
            return console.error(err);
        flights = rows;
    });
}
updateDestinations();
updateFlights();
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.render("../public/index.html", {
    });
})
function getDestinationName(id) {
    for (var k = 0; k < destinations.length; k++) {
        if (destinations[k]['destinationId'] == parseInt(id))
            return destinations[k]['destinationName'];
    }
}
app.get('/adminpanel', (req, res) => {
    res.render("../public/adminpanel.ejs", {
        v_flights: flights,
        v_destinations: destinations,
        f_getDestinationName: getDestinationName
    });
})

app.get('/addflight/:originId/:destinationId/:departure/:arrival/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("INSERT INTO flights(originId, destinationId, departureTime, arrivalTime) VALUES(?,?,?,?)", [req.params.originId, req.params.destinationId, req.params.departure, req.params.arrival], (err) => {
        if (err)
            return console.error(err);
    });
    updateFlights();
    return res.redirect("/adminpanel")
});
app.get('/efl/:originId/:destinationId/:departure/:arrival/:flightId/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("UPDATE flights SET originId = ?, destinationId = ?, departureTime = ?, arrivalTime = ? WHERE flightId = ?", [req.params.originId, req.params.destinationId, req.params.departure, req.params.arrival, req.params.flightId], (err) => {
        if (err)
            return console.error(err);
    });
    updateFlights();
    return res.redirect("/adminpanel")
});
app.get('/addest/:destinationName/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("INSERT INTO destinations(destinationName) VALUES(?)", [req.params.destinationName], (err) => {
        if (err)
            return console.error(err);
    });
    updateDestinations();
    return res.redirect("/adminpanel")

});
app.get('/removeflight/:flightId/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("DELETE FROM flights WHERE flightId=?", [req.params.flightId], (err) => {
        if (err)
            return console.error(err);
    });
    updateFlights();
    return res.redirect("/adminpanel")
});
app.get('/removedestination/:destinationId/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("DELETE FROM destinations WHERE destinationId=?", [req.params.destinationId], (err) => {
        if (err)
            return console.error(err);
    });
    db.run("DELETE FROM flights WHERE destinationId=? OR originId=?", [req.params.destinationId, req.params.destinationId], (_err) => {
        if (_err)
            return console.error(_err);
    })
    updateDestinations();
    updateFlights();
    return res.redirect("/adminpanel")
});
app.get('/destinations/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    res.json(destinations);

});
app.get('/searchflight/:originid/:destentaionid/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.all(`SELECT * FROM flights WHERE originId like ${req.params.originid} and destinationId like ${req.params.destentaionid}`, function (err, rows) {
        if (err) {
            return console.error(err.message);
        }
        res.json(rows);
    });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})