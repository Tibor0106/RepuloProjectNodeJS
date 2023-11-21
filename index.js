const express = require('express');
const app = express();
const sqlite = require("sqlite3").verbose();
const cors = require('cors');
app.use(cors());
const port = 3500;
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
            return console.error(err.message);
        destinations = rows;
    });
}
function updateFlights() {
    db.all("SELECT * FROM flights;", function (err, rows) {
        if (err)
            return console.error(err.message);
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

function getTicketOfType(resolved) {
    db.all("SELECT * FROM tickets WHERE resolved = ?", [resolved], (err, rows) => {
        if (err)
            return console.error(err.message);
        console.log(`clicked: ${rows}`);
        return rows;
    })
}

app.get('/tickets', (req, res) => {
    res.render("../public/tickets.ejs", {
        f_getTicketsOfType: getTicketOfType
    });
});

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
        return res.json(rows);
    });
})
app.get('/searchflight/:originid/:destinationid', (req, res) => {
    req.params.destinationid = req.params.destinationid === "-1" ? "" : `and destinationId like ${req.params.destinationid}`;
    db.all(`SELECT * FROM flights WHERE originId like ${req.params.originid} ${req.params.destinationid}`, function (err, rows) {
        if (err) {
            return console.error(err.message);
        }
        return res.json(rows);
    });
});

function activeTicket(userid) {
    db.all("SELECT COUNT(*) FROM tickets WHERE userid LIKE ?", [userid], function (err, rows) {
        if (rows[0].count != 0)
            return false;
    });
    return true;
}

app.get('/createticket/:userId/:ticketSubject/:ticketBody/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    if (activeTicket(req.params.userid))
        return res.end("You already have an open ticket!");
    db.run("INSERT INTO tickets(userId, ticketBody, ticketSubject, resolved) VALUES (?,?,?, ?)", [req.params.userId, req.params.ticketSubject, req.params.ticketBody, false], (err) => {
        if (err)
            console.error(err.message);
    })
});
app.get('/addticketmessage/:userId/:replyBody/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("INSERT INTO ticketComments(userId, replyBody) VALUES (?, ?)", [req.params.userId, req.params.replyBody], (err) => {
        if (err)
            console.error(err.message);
    })
});
app.get('/closeticket/:ticketid/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("UPDATE tickets SET resolved=? WHERE ticketId=?", [true, req.params.ticketid], (err) => {
        if (err)
            console.error(err.message);
    })
});
app.get('/getticketmessages/:ticketid/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.all("SELECT * FROM tickets WHERE ticketId = ?", [req.params.ticketid], (err, rows) => {
        if (err)
            console.error(err.message);
        return res.json(rows);
    })
});


const generateVerificationNumber = () => {
    var minimum = 100000;
    var maximum = 999999;
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

app.get('/register/:email/:username/:password/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("INSERT INTO users(userName, email, userPassword, verified, verificationNumbers) VALUES(?,?,?,?,?)", [req.params.username, req.params.email, req.params.password, false, generateVerificationNumber()], (err) => {
        if (err)
            return console.error(err.message);
    });
})

app.get('/login/:email/:password/', (req, res) => {
    db.all("SELECT * FROM users WHERE email LIKE ?", [req.params.email], (err, rows) => {
        if (err)
            console.error(err.message);
        return res.json(rows);
    })
})


/*
TODO: FIX 2 FUNCTIONS BELOW!

const getVerificationNumbers = (userid) => {
    db.all("SELECT verificationNumbers FROM users WHERE userid LIKE ?", [userid], (err, rows) => {
        if (err)
            return console.log(err.message);
        return rows[0]["verificationNumbers"];
    });
}

app.get('/verify/:userid/:verificationnumbers', (req, res) => {
    var verificationums = getVerificationNumbers(req.params.userid);
    console.log(`DB: ${verificationums} | INPUT: ${req.params.verificationnumbers}`);
    if (verificationums != parseInt(req.params.verificationnumbers))
        return console.error("Wrong verification code!");
    db.run("UPDATE users SET verified=? WHERE userid LIKE ?", [true, req.params.userid], (err) => {
        if (err)
            console.error(err.message);
    })
})
*/
app.get('/gototickets/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    return res.redirect("/tickets");
})

app.listen(port, () => {
    console.log(`EuroJET running on port ${port}! | http://eurojet.ddns.net:${port}`)
})
