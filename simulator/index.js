const { Kafka } = require('kafkajs');

const MIN_LAT = 22.65;
const MAX_LAT = 22.80;
const MIN_LNG = 75.80;
const MAX_LNG = 75.95;
const EVENT_TYPES = ['ACCIDENT', 'TRAFFIC_JAM', 'ROAD_CLOSURE', 'CONSTRUCTION'];

const kafka = new Kafka({
    clientId: 'traffic-simulator',
    brokers: ['localhost:9092']
});

const producer = kafka.producer();

function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}

function generateEvent() {
    const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    const lat = getRandomInRange(MIN_LAT, MAX_LAT, 4);
    const lng = getRandomInRange(MIN_LNG, MAX_LNG, 4);

    return {
        eventId: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type: type,
        latitude: lat,
        longitude: lng,
        timestamp: new Date().toISOString()
    };
}

// 2. Main function to connectand send
async function startSimulator() {

    await producer.connect();
    console.log("Connected to Kafka successfully!");

    setInterval(async () => {
        const newEvent = generateEvent();

        // Send the event to the traffic events
        await producer.send({
            topic: 'traffic-events',
            messages: [
                { value: JSON.stringify(newEvent) },
            ],
        });

        console.log(`Sent event to Kafka: ${newEvent.type} at ${newEvent.latitude}, ${newEvent.longitude}`);
    }, 3000);
}

startSimulator().catch(console.error);
