function publishFlight() {
    var adminkey = document.getElementById('adminKey');
    var originId = document.getElementById('flightOrigin');
    var destinationId = document.getElementById('flightDestination');
    var departure = document.getElementById('departureTime');
    var arrival = document.getElementById('arrivalTime');
    var price = document.getElementById('flightPrice');
    window.location = `http://eurojet.ddns.net:3500/flight/add/${originId.value}/${destinationId.value}/${departure.value}/${arrival.value}/${price.value}/${adminkey.value}`;
}
function removeFlight() {
    var adminkey = document.getElementById('adminKey');
    var flightId = document.getElementById('flightToRemove');
    window.location = `http://eurojet.ddns.net:3500/flight/remove/${flightId.value}/${adminkey.value}`;
}
function editFlight() {
    var adminkey = document.getElementById('adminKey');
    var originId = document.getElementById('flightEditOrigin');
    var destinationId = document.getElementById('flightEditDestination');
    var departure = document.getElementById('departureEditTime');
    var arrival = document.getElementById('arrivalEditTime');
    var fId = document.getElementById('flightToUpdate');
    var price = document.getElementById('flightEditPrice');
    window.location = `http://eurojet.ddns.net:3500/flight/edit/${originId.value}/${destinationId.value}/${departure.value}/${arrival.value}/${price.value}/${fId.value}/${adminkey.value}`;
}

function addDestination() {
    var adminkey = document.getElementById('adminKey');
    var destinationName = document.getElementById('destinationName');
    window.location = `http://eurojet.ddns.net:3500/destination/add/${destinationName.value}/${adminkey.value}`;
    console.log("h");
}

function removeDestination() {
    var adminkey = document.getElementById('adminKey');
    var destinationId = document.getElementById('destinationToRemove');
    window.location = `http://eurojet.ddns.net:3500/destination/remove/${destinationId.value}/${adminkey.value}`;
}

function saveKey() {
    var adminkey = document.getElementById('adminKey');
    document.cookie = `adminkey=${adminkey.value}`;
}

function setAdminKey() {
    if (document.cookie.includes('adminkey'))
        document.getElementById('adminKey').value = document.cookie.split('=')[1];

}

function openTickets() {
    var adminkey = document.getElementById('adminKey');
    window.location = `http://eurojet.ddns.net:3500/gototickets/${adminkey.value}`;
}

function openBookings() {
    var adminkey = document.getElementById('adminkey');
    window.location = `http://eurojet.ddns.net:3500/bookings/${adminkey.value}`;
}

function addCar() {
    var adminkey = document.getElementById('adminKey');
    var carbrand = document.getElementById('carBrand');
    var carmodel = document.getElementById('carModel');
    var carmake = document.getElementById('carMake');
    var carseats = document.getElementById('carSeats');
    var carprice = document.getElementById('carPrice');
    window.location=`http://eurojet.ddns.net:3500/cars/add/${carbrand.value}/${carmodel.value}/${carmake.value}/${carseats.value}/${carprice.value}/${adminkey.value}`;
}
function removeCar() {
    var adminkey = document.getElementById('adminKey');
    var carid = document.getElementById('carToRemove');
    window.location=`http://eurojet.ddns.net:3500/cars/remove/${carid.value}/${adminkey.value}`;
}