# School Management API

## Overview
This is a small Node.js API for the school management task. It lets you add schools and list them sorted by distance from a user location.

## Tech stack
- Node.js + Express because it is simple and fast to build APIs
- MySQL for the database as asked
- mysql2 to connect with MySQL
- dotenv for env config

## How to run
1. Create a MySQL database (example name: school_db)
2. Run the SQL in schema.sql to create the table
3. Copy .env.example to .env and update DB values
4. Install packages: npm install
5. Start: npm run dev (or npm start)

## API endpoints
POST /addSchool
Body: name, address, latitude, longitude

GET /listSchools
Query: latitude, longitude
Optional: limit

## Features implemented
- Add school with validation
- List schools by proximity
- Distance is calculated using Haversine logic and list is sorted

## USP / small extra improvement
I return distance_km for every school in listSchools so it is easy to see how far it is from the user spot.

## unique feature
listSchools supports a small limit param, so reviewer can quickly check top N results without scrolling.

## Challenges I faced
- Getting the distance math right without over-complicating it
- Handling validation for both body and query in a clean way

## Future improvements
- Better error messages
- Add pagination if the data gets big
- Deploy to a hosting service (not done here)

## Postman
Postman collection is included as postman_collection.json
