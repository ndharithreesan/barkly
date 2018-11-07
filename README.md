# Reservations Service

## Local Development

1. Install Node and Mongo
2. Grab and import a dump from the hosted DB

```
mongodump -h <HOST> -d <DB> -u <USER> -p <PASSWORD> -o ./data_dump

mongorestore -h localhost:27017 ./data_dump
```

3. Install npm dependencies
   ```npm install```

4. Start dev server
   `npm run dev`

## cURL commands to access API

- Get all reservations
  ```
  curl -X GET http://localhost:8000/
  ```

- Create a valid reservation
  ```
  curl -X POST http://localhost:8000/ -d "@examples/single_reservation_valid.json" -H "Content-Type: application/json"
  ```

- Create multiple valid reservations
  ```
  curl -X POST http://localhost:8000/createMany -d "@examples/multi_reservations_valid.json" -H "Content-Type: application/json"
  ```

- Delete a reservation
  ```
  curl -X DELETE "http://localhost:8000/<ID>"
  ```

- Delete multiple reservations
  ```
  curl -X DELETE "http://localhost:8000/deleteMany/[<ID_1>...<ID_N>]"
  ```
