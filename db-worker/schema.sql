CREATE EXTENSION IF NOT EXISTS postgis;

create table traffic_events(
    id serial primary key,
    event_id vachar(50) unique not null,
    type varchar(50) not null,
    location geometry(Point, 4326) not null,
    timestamp timestamp not null,
    created_at timestamp default current_timestamp
);

CREATE INDEX traffic_events_location_idx ON traffic_events USING GIST (location);


SELECT 
    a.event_id as Event_1, 
    b.event_id as Event_2, 
    ST_Distance(a.location::geography, b.location::geography) as distance_in_meters
FROM traffic_events a, traffic_events b
WHERE a.id != b.id 
LIMIT 5;

SELECT event_id, type 
FROM traffic_events 
WHERE ST_DWithin(
    location::geography, 
    ST_SetSRID(ST_MakePoint(75.85, 22.71), 4326)::geography, 
    2000
);
