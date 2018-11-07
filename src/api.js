const ObjectID = require('mongodb').ObjectID;
module.exports = function(app, db) {
  const resCol = db.collection('reservations');
  const restCol = db.collection('restaurants');
  app.get('/', (req, res) => {
    let result = [];
    resCol.find({}).toArray((err, items) => {
      if (err !== null) {
        console.error('Unable to retrieve reservations: ' + err);
        res.status(500).send('There was an issue retrieving reservations');
      }

      result = items.slice();
      res.send(result);
    });
  });

  app.post('/', async (req, res) => {
    let content = req.body;
    let validateErr = await validateReservation(content, db);
    if (validateErr !== null) {
      console.log('Validation Error: ' + validateErr.message);
      return res
        .status(400)
        .send('Unable to create reservation. ' + validateErr.message);
    }

    let result = await resCol.insertOne(content);
    if (result.insertedCount === 1) {
      res.status(201).send(result.ops[0]);
    } else {
      console.log('Error writing to database');
      res.status(500).send('there was an error');
    }
  });

  app.post('/createMany', async (req, res) => {
    let reservations = req.body;
    let validReservations = [];
    let invalidReservations = [];

    for (let i = 0; i < reservations.length; i++) {
      let currRes = reservations[i];
      console.log(currRes);
      validateErr = await validateReservation(currRes, db);
      if (validateErr === null) {
        validReservations.push(currRes);
      } else {
        invalidReservations.push({
          reservation: currRes,
          error: validateErr.message
        });
      }
    }

    if (validReservations.length === 0 || invalidReservations.length > 0) {
      return res.status(400).send({
        message: 'Invalid Reservations',
        items: invalidReservations
      });
    }

    let result = await resCol.insertMany(validReservations);
    res.sendStatus(201);
  });

  app.delete('/:reservationID', async (req, res) => {
    const resCol = db.collection('reservations');
    let resID = req.params['reservationID'];

    let result = await resCol.findOneAndDelete({ _id: ObjectID(resID) });
    if (result.value === null) {
      return res.status(404).send('The reservation was not found');
    } else if (result.lastErrorObject.n === 0) {
      return res.status(500).send('Unknown server error');
    }
    res.sendStatus(204);
  });

  app.delete('/deleteMany/:ids', async (req, res) => {
    const resCol = db.collection('reservations');
    let ids;
    try {
      ids = JSON.parse(req.params.ids);
    } catch (err) {
      console.log('Error with JSON request: ' + err);
      return res.status(400).send('Incorrect JSON format');
    }

    let ops = ids.map(id => {
      return {
        _id: ObjectID(id)
      };
    });

    let result = await resCol.deleteMany({ $or: ops });
    if (result.deletedCount === 0) {
      return res.status(500).send('Unable to delete any reservations');
    }
    res.sendStatus(204);
  });
};

const validateReservation = async (content, db) => {
  const resCol = db.collection('reservations');
  const restCol = db.collection('restaurants');
  let restaurant = await restCol.find({ name: content.restaurant }).toArray();
  if (restaurant.length === 0) {
    return new Error('Restaurant does not exist');
  }

  let custMatches = await resCol
    .find({ name: content.name, timeSlot: content.timeSlot })
    .toArray();
  if (custMatches.length > 0) {
    return new Error('Customer has a reservation already');
  }

  let currReservations = await resCol
    .find({
      restaurant: content.restaurant,
      timeSlot: content.timeSlot
    })
    .toArray();

  if (currReservations.length === 5) {
    return new Error('Restaurant is fully booked');
  }

  return null;
};
