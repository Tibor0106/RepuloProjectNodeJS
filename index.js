const express = require('express');
const app = express();
const sqlite = require("sqlite3").verbose();
const cors = require('cors');
const nodemailer = require('nodemailer');
const emailAccount = nodemailer.createTransport({
    service: 'Hotmail',
    auth: {
        user: 'EuroJetPRJ@outlook.com',
        pass: 'EuroJet20231127'
    }
});
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

app.get('/flight/add/:originId/:destinationId/:departure/:arrival/:price/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("INSERT INTO flights(originId, destinationId, departureTime, arrivalTime, price) VALUES(?,?,?,?,?)", [req.params.originId, req.params.destinationId, req.params.departure, req.params.arrival, req.params.price], (err) => {
        if (err)
            return console.error(err);
    });
    updateFlights();
    return res.redirect("/adminpanel")
});
app.get('/flight/edit/:originId/:destinationId/:departure/:arrival/:price/:flightId/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("UPDATE flights SET originId = ?, destinationId = ?, departureTime = ?, arrivalTime = ?, price = ? WHERE flightId = ?", [req.params.originId, req.params.destinationId, req.params.departure, req.params.arrival, req.params.price, req.params.flightId], (err) => {
        if (err)
            return console.error(err);
    });
    updateFlights();
    return res.redirect("/adminpanel")
});
app.get('/destination/add/:destinationName/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("INSERT INTO destinations(destinationName) VALUES(?)", [req.params.destinationName], (err) => {
        if (err)
            return console.error(err);
    });
    updateDestinations();
    return res.redirect("/adminpanel")

});
app.get('/flight/remove/:flightId/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("DELETE FROM flights WHERE flightId=?", [req.params.flightId], (err) => {
        if (err)
            return console.error(err);
    });
    updateFlights();
    return res.redirect("/adminpanel")
});
app.get('/destination/remove/:destinationId/:adminkey', (req, res) => {
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
app.get('/flights/search/:originid/:destinationid', (req, res) => {
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

app.get('/ticket/create/:userId/:ticketSubject/:ticketBody/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    if (activeTicket(req.params.userid))
        return res.end("You already have an open ticket!");
    db.run("INSERT INTO tickets(userId, ticketBody, ticketSubject, resolved) VALUES (?,?,?, ?)", [req.params.userId, req.params.ticketSubject, req.params.ticketBody, false], (err) => {
        if (err)
            console.error(err.message);
    })
});
app.get('/ticket/messages/add/:userId/:replyBody/:adminkey', (req, res) => {
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
app.get('/ticket/messages/get/:ticketid/:adminkey', (req, res) => {
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
const userExists = (email, username, password) => {
    db.all("SELECT * FROM users WHERE email LIKE ? AND username LIKE ?", [email, username], (err, rows) => {
        if (err)
            console.error(err.message);
        if (rows.length == 0){
            var verNums = generateVerificationNumber()
        db.run("INSERT INTO users(userName, email, userPassword, verified, verificationNumbers) VALUES(?,?,?,?,?)", [username, email, password, false, verNums], (err) => {
            if (err)
                return console.error(err.message);
            getUserId(email, verNums);
            return {'registered': true};
        });
        }
        else {
            return {'registered': false, 'error': 'exists'};
        }
    })
    return {'registered': false, 'error': 'noval'};
}
var id = 0;
function sendEmail(v_id, verNums, email) {
    var mailSettings = {
        from: 'EuroJetPRJ@outlook.com',
        to: email,
        subject: "EuroJET Registration",
        text: `Thank you for registering to EuroJET! To verify your account, follow this link to verify your account: http://eurojet.ddns.net:3500/verify/${v_id}/${verNums}`
    }
    emailAccount.sendMail(mailSettings, function (err, info) {
        if (err)
            return console.error(err.message);
    })
    return true;
}
function getUserId(email, verNums) {
    db.all("SELECT * FROM users WHERE email LIKE ?", [email], (err, rows) => {
        sendEmail(rows[0].userId, verNums, email);
        console.log(id);
    })
    return id;
}
app.get('/register/:email/:username/:password/:adminkey', (req, res) => {

    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    
    //if (userExists(req.params.email, req.params.username) == true)
    //return res.json({"registered": false, "error": "exists"})         TODO: FIX <--- 
    //else{
    
    return res.json(userExists(req.params.email, req.params.username, req.params.password))
    //}
})



app.get('/login/:email/:password/', (req, res) => {
    db.all("SELECT * FROM users WHERE email LIKE ? AND userPassword LIKE ?", [req.params.email, req.params.password], (err, rows) => {
        if (err)
            console.error(err.message);
        if (rows.length > 0)
            return res.json({'success':true, 'logindata':`email=${rows[0].email}&username=${rows[0].userName}`});
        else
            return res.json({'success':false});
    })
})



app.get('/verify/:userid/:verificationnumbers', (req, res) => {
    db.all("SELECT verificationNumbers FROM users WHERE userId LIKE ? AND verificationNumbers LIKE ?", [req.params.userid, req.params.verificationnumbers], (err, rows) => {
        if (err)
            return console.error(err.message);
        if (rows.length > 0)
            db.run("UPDATE users SET verified=? WHERE userid LIKE ?", [true, req.params.userid], (err) => {
                if (err)
                    return console.error(err.message);
            })
    })
    return res.json({ "success": true });
})

app.get('/gototickets/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    return res.redirect("/tickets");
})
app.get('/about/add/:title/:message/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    console.log(req.params.message);
    db.run("INSERT INTO about(title, message) VALUES (?, ?)", [req.params.title, req.params.message], (err) => {
        if (err)
            console.error(err.message);
    })
    res.end("Sikeresen hozzadva");
});
app.get('/about/get/all/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.all("SELECT * FROM about ", (err, rows) => {
        if (err)
            console.error(err.message);
        return res.json(rows);
    })
})

app.get('/category/get/:categoryname/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("SELECT * FROM ticketCategories", (err, rows) => {
        if (err)
            return console.error(err.message);
        return res.json(rows);
    })
})
app.get('/category/add/:categoryname/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("INSERT INTO ticketCategories(categoryName) VALUES (?)", [req.params.categoryname], (err) => {
        if (err)
            return console.error(err.message);
        return res.json({"success": true});
    })
})

app.get('/category/remove/:categoryid/:adminkey', (req, res) => {
    if (req.params.adminkey != adminkey)
        return res.end("wrong admin key!");
    db.run("DELETE FROM ticketCategories WHERE categoryId = ?", [req.params.categoryid], (err) => {
        if (err)
            return console.error(err.message);
        return res.json({"success": true});
    })
})


app.listen(port, () => {
    console.log(`EuroJET running on port ${port}! | http://eurojet.ddns.net:${port}`)
})
