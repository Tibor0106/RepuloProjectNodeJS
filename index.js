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

app.get('/addflight/:originId/:destinationId/:departure/:arrival/:price/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("INSERT INTO flights(originId, destinationId, departureTime, arrivalTime, price) VALUES(?,?,?,?,?)", [req.params.originId, req.params.destinationId, req.params.departure, req.params.arrival, req.params.price], (err) => {
        if (err)
            return console.error(err);
    });
    updateFlights();
    return res.redirect("/adminpanel")
});
app.get('/efl/:originId/:destinationId/:departure/:arrival/:price/:flightId/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("UPDATE flights SET originId = ?, destinationId = ?, departureTime = ?, arrivalTime = ?, price = ? WHERE flightId = ?", [req.params.originId, req.params.destinationId, req.params.departure, req.params.arrival, req.params.price, req.params.flightId], (err) => {
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
app.get('/destinations', (req, res) => {
    res.json(destinations);

});

app.get('/getrelevantdestinations/:fromid', (req, res) => {
    db.all(`SELECT * FROM destinations WHERE destinationId IN (SELECT destinationId FROM flights WHERE originId LIKE ?);`, [req.params.fromid], function (err, rows) {
        if (err) {
            return console.error(err.message);
        }
        res.json(rows);
    });
})
app.get('/searchflight/:originid/:destinationid', (req, res) => {
    req.params.destinationid = req.params.destinationid === "-1" ? "" : `and destinationId like ${req.params.destinationid}`;
    db.all(`SELECT * FROM flights WHERE originId like ${req.params.originid} ${req.params.destinationid}`, function (err, rows) {
        if (err) {
            return console.error(err.message);
        }
        res.json(rows);
    });
});

function activeMessage(email) {
    db.all("SELECT COUNT(*) FROM messages WHERE email LIKE ?", (email), function (err, rows) {
        if (rows[0].count != 0)
            return false;
    });
    return true;
}

app.get('/addmessage/:email/:name/:address/:telnum/:message/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    if (activeMessage(req.params.email))
        return res.end("already submitted a message with this email!");
    db.run("INSERT INTO messages(email, userName, address, phonenum, userMessage) VALUES (?,?,?,?,?)", [req.params.email, req.params.name, req.params.address, req.params.telnum, req.params.message], (err) => {
        if (err)
        return console.error(err.message);
    });
});
app.get('/removemessage/:messageid/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("DELETE FROM messages WHERE messageid = ?", [req.params.messageid], (err) => {
        if (err)
        return console.error(err.message);
    });
});
app.get('/replymessage/:replyemployee/:replymessage/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");

    //TODO: HANDLE EMAIL REPLY!
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
