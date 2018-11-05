module.exports = function(app, db) {
  app.get('/', (req, res) => {
    const col = db.collection('reservations');

    let result = [];
    col.find({}).toArray((err, items) => {
      if (err !== null) {
        console.error('There is an error with the query: ' + err);
      }
      console.log('done getting items');
      result = items.slice();
      res.send(result);
    });
  });

  app.post('/', async (req, res) => {
    const resCol = db.collection('reservations');
    const restCol = db.collection('restaurants');
    let content = req.body;

    let validateErr = await validateReservation(content, db);
    if (validateErr !== null) {
      return res.send('Unable to create reservation. ' + validateErr.message);
    }

    let result = await resCol.insertOne(content);
    if (result.insertedCount === 1) {
      res.send('Inserted');
    } else {
      res.send('there was an error');
    }
  });

  app.post('/createMany', async (req, res) => {
    const col = db.collection('reservations');
    let reservations = req.body;
    let validReservations = [];
    let invalidReservations = [];

    for (let i = 0; i < reservations.length; i++) {
      let currRes = reservations[i];
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

    if (validReservations.length === 0) {
      return res.send(
        'There are no valid reservations: ' +
          JSON.stringify(invalidReservations)
      );
    }

    let result = await col.insertMany(validReservations);
    res.send({ out: result, invalid: invalidReservations });
  });

  app.delete('/{id}', async (req, res) => {});
};

const validateReservation = async (content, db) => {
  const reservationCol = db.collection('reservations');
  const restaurantCol = db.collection('restaurants');

  let err;

  let restaurant = await restaurantCol
    .find({ name: content.restaurant })
    .toArray();
  if (restaurant.length === 0) {
    return new Error('Restaurant does not exist');
  }

  let custMatches = await reservationCol
    .find({ name: content.name, timeSlot: content.timeSlot })
    .toArray();
  if (custMatches.length > 0) {
    return new Error('Customer has a reservation already');
  }

  let currReservations = await reservationCol
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
