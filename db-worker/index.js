const { Kafka } = require('kafkajs');
const { Pool } = require('pg');

// postgres Connection
const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'geotraffic',
    password: 'password',
    port: 5432,
});

// Kafka Connection
const kafka = new Kafka({
    clientId: 'db-worker',
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ groupId: 'db-processor-group' });

async function startWorker() {
    // Connect to both services
    await pool.connect();
    console.log(" Connected to PostGIS");

    await consumer.connect();
    console.log(" Connected to Kafka");

    // Subscribe to our topic
    await consumer.subscribe({ topic: 'traffic-events', fromBeginning: false });

    // Start listening for messages
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const event = JSON.parse(message.value.toString());
            
            console.log(`Received ${event.type} at ${event.latitude}, ${event.longitude}`);

            // Insert into PostGIS
            const query = `
                INSERT INTO traffic_events (event_id, type, location, timestamp)
                VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5)
                ON CONFLICT (event_id) DO NOTHING;
            `;
            
            // Notice: ST_MakePoint takes (Longitude, Latitude) -> X, Y
            const values = [event.eventId, event.type, event.longitude, event.latitude, event.timestamp];

            try {
                await pool.query(query, values);
                console.log(` Saved ${event.eventId} to database.`);
            } catch (err) {
                console.error(" Error saving to DB:", err.message);
            }
        },
    });
}

startWorker().catch(console.error);
