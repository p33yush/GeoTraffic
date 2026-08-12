const { Kafka } = require('kafkajs');
const { Pool } = require('pg');
const { createClient } = require('redis');

// 1. Setup Connections
const pool = new Pool({
    user: 'admin',
    host: 'localhost',
    database: 'geotraffic',
    password: 'password',
    port: 5432,
});

const redisClient = createClient({
    url: 'redis://localhost:6379'
});
redisClient.on('error', err => console.log('Redis Client Error', err));

const kafka = new Kafka({
    clientId: 'db-worker',
    brokers: ['localhost:9092']
});
const consumer = kafka.consumer({ groupId: 'db-processor-group' });

async function startWorker() {
    await pool.connect();
    console.log(" Connected to PostGIS");

    await redisClient.connect();
    console.log(" Connected to Redis");

    await consumer.connect();
    console.log(" Connected to Kafka");

    await consumer.subscribe({ topic: 'traffic-events', fromBeginning: false });

    // 2. Process Messages
    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const event = JSON.parse(message.value.toString());
            console.log(`Received ${event.type} at ${event.latitude}, ${event.longitude}`);

            // A. Save permanently to PostGIS
            const query = `
                INSERT INTO traffic_events (event_id, type, location, timestamp)
                VALUES ($1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326), $5)
                ON CONFLICT (event_id) DO NOTHING;
            `;
            const values = [event.eventId, event.type, event.longitude, event.latitude, event.timestamp];
            
            try {
                await pool.query(query, values);
                
                // B. Save temporarily to Redis (TTL: 3600 seconds = 1 hour)
                // We store the data as a stringified JSON string
                await redisClient.setEx(
                    `active:incident:${event.eventId}`, 
                    3600, 
                    JSON.stringify(event)
                );
                
                console.log(` Saved ${event.eventId} to PostGIS and Redis.`);
            } catch (err) {
                console.error(" Error processing event:", err.message);
            }
        },
    });
}

startWorker().catch(console.error);
