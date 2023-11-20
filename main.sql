CREATE TABLE flights(flightId INTEGER PRIMARY KEY AUTOINCREMENT, originId INTEGER NOT NULL, destinationId INTEGER NOT NULL, departureTime TIME NOT NULL, arrivalTime TIME NOT NULL, price INTEGER NOT NULL);
CREATE TABLE destinations(destinationId INTEGER PRIMARY KEY AUTOINCREMENT, destinationName TEXT NOT NULL);
CREATE TABLE messages(messageId INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL, userName TEXT NOT NULL, address TEXT NOT NULL, phonenum TEXT NOT NULL, userMessage TEXT NOT NULL);
-- Add a flight:
INSERT INTO flights(destinationId, departureTime, arrivalTime) VALUES(x, y, z);

-- Add a destination:
INSERT INTO destinations(destinationName) VALUES(x);

-- Delete a flight
-- by Id:
DELETE FROM flights WHERE flightId = x;
-- by destinationId:
DELETE FROM flights WHERE destinationId = x;

-- Delete a destination
-- by Id:
DELETE FROM destinations WHERE destinationId = x;
DELETE FROM flights WHERE destinationId = x;
-- by Name:
DELETE FROM flights WHERE destinationId = (SELECT destinationId FROM destinations WHERE destinationName = x);
DELETE FROM destinations WHERE destinationName = x;
