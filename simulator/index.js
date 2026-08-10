const MIN_LAT = 22.65;
const MAX_LAT = 22.80;
const MIN_LNG = 75.80;
const MAX_LNG = 75.95;

const EVENT_TYPES = ['ACCIDENT', 'TRAFFIC_JAM', 'ROAD_CLOSURE', 'CONSTRUCTION'];

function getRandomInRange(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
}

function generateEvent() {
    // Pick a random event type
    const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
    
    // Pick a random coordinate within our bounding box
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

// Generate an event every 3 seconds
console.log("Starting Traffic Event Simulator...");
setInterval(() => {
    const newEvent = generateEvent();
    console.log(JSON.stringify(newEvent));
}, 3000);
