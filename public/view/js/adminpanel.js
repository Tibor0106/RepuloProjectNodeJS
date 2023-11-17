function publishFlight() {
    var adminkey = document.getElementById('adminKey');
    var originId = document.getElementById('flightOrigin'); 
    var destinationId = document.getElementById('flightDestination');
    var departure = document.getElementById('departureTime');
    var arrival = document.getElementById('arrivalTime');
    console.log(`adminkey:${adminkey.value}\noriginId:${originId.value}\ndestinationId:${destinationId.value}\ndeparture:${departure.value}\narrival:${arrival.value}`)
    window.location = `http://eurojet.ddns.net:3500/addflight/${originId.value}/${destinationId.value}/${departure.value}/${arrival.value}/${adminkey.value}`;
}
function editFlight() {
    var adminkey = document.getElementById('adminKey');
    var originId = document.getElementById('flightEditOrigin'); 
    var destinationId = document.getElementById('flightEditDestination');
    var departure = document.getElementById('departureEditTime');
    var arrival = document.getElementById('arrivalEditTime');
    var fId = document.getElementById('flightToUpdate');
    console.log(`adminkey:${adminkey.value}\noriginId:${originId.value}\ndestinationId:${destinationId.value}\ndeparture:${departure.value}\narrival:${arrival.value}`)
    window.location = `http://eurojet.ddns.net:3500/efl/${originId.value}/${destinationId.value}/${departure.value}/${arrival.value}/${fId.value}/${adminkey.value}`;
}

function addDestination() {
    var adminkey = document.getElementById('adminKey');
    var destinationName = document.getElementById('destinationName');
    window.location = `http://eurojet.ddns.net:3500/addest/${destinationName.value}/${adminkey.value}`;
    console.log("h");
}

function removeDestination() {
    var adminkey = document.getElementById('adminKey');
    var destinationId = document.getElementById('destinationToRemove');
    window.location = `http://eurojet.ddns.net:3500/removedestination/${destinationId.value}/${adminkey.value}`;
}

function saveKey() {
    var adminkey = document.getElementById('adminKey');
    document.cookie=`adminkey=${adminkey.value}`;
}

function setAdminKey() {
    if (document.cookie.includes('adminkey'))
        document.getElementById('adminKey').value=document.cookie.split('=')[1];

}