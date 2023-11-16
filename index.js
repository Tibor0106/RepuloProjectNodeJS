const express = require('express')
const app = express()
const sqlite = require("sqlite3").verbose();
const port = 3500
let db = new sqlite.Database("db/main.db", (err) => {
    if (err)
        return console.log(err.message);
    console.log("Connected to webserver database!");
});
app.use(express.static('public'));
app.get('/', (req, res) => {
    res.render("../public/index.html", {
    });
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})