const express = require('express')
const dotenv = require('dotenv')
const swaggerUi = require('swagger-ui-express') // <-- Add this
const swaggerDocument = require('../swagger.json') // <-- Add this

dotenv.config()

const pool = require('./db')
const app = express()
app.use(express.json())
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)) 

const cleanText = (v) => typeof v === 'string' ? v.trim() : ''
const asNumber = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

const isLat = (n) => typeof n === 'number' && n >= -90 && n <= 90
const isLng = (n) => typeof n === 'number' && n >= -180 && n <= 180

const toRad = (v) => v * Math.PI / 180
const distanceKm = (lat1, lon1, lat2, lon2) => {
  const r = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return r * c
}

app.post('/addSchool', async (req, res) => {
  try {
    const name = cleanText(req.body.name)
    const address = cleanText(req.body.address)
    const latitude = asNumber(req.body.latitude)
    const longitude = asNumber(req.body.longitude)

    if (!name || !address || !isLat(latitude) || !isLng(longitude)) {
      return res.status(400).json({ error: "Invalid input" })
    }

    const [result] = await pool.query(
      'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)',
      [name, address, latitude, longitude]
    )

    return res.status(201).json({
      id: result.insertId,
      name,
      address,
      latitude,
      longitude
    })
  } catch (err) {
    console.error('Error in /addSchool:', err)
    return res.status(500).json({ error: "Server error", details: err.message })
  }
})

app.get('/listSchools', async (req, res) => {
  try {
    const latitude = asNumber(req.query.latitude)
    const longitude = asNumber(req.query.longitude)
    const limitRaw = req.query.limit

    if (!isLat(latitude) || !isLng(longitude)) {
      return res.status(400).json({ error: "Invalid coordinates" })
    }

    let limit = null
    if (limitRaw !== undefined) {
      const parsed = parseInt(limitRaw, 10)
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return res.status(400).json({ error: "Invalid limit" })
      }
      limit = parsed
    }

    const [rows] = await pool.query('SELECT id, name, address, latitude, longitude FROM schools')

    const sorted = rows.map((s) => {
      const dist = distanceKm(latitude, longitude, s.latitude, s.longitude)
      return {
        id: s.id,
        name: s.name,
        address: s.address,
        latitude: s.latitude,
        longitude: s.longitude,
        distance_km: Number(dist.toFixed(2))
      }
    }).sort((a, b) => a.distance_km - b.distance_km)

    const finalList = limit ? sorted.slice(0, limit) : sorted

    return res.json({
      count: finalList.length,
      schools: finalList
    })
  } catch (err) {
    console.error('Error in /listSchools:', err)
    return res.status(500).json({ error: "Server error", details: err.message })
  }
})

const port = process.env.PORT ? Number(process.env.PORT) : 3000
app.listen(port, () => {
  console.log(`Server running on ${port}`)
})
