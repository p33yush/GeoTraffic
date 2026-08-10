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
