import {MapContainer,Popup,TileLayer,Marker} from 'react-leaflet';
import io from 'socket.io-client';
import {useState, useEffect} from 'react';



const socket=io('http://localhost:4000');

function App(){
  const position=[22.7196, 75.8577] //indore's centre
  
  const [events,setEvents]=useState([]);

  useEffect(()=>{
    socket.on('new-event', (newEvent)=>{
      
      //add events in array of events
      setEvents((prevEvents) => [ newEvent,...prevEvents]);
    });
    
    return() => socket.off('new-event');
  },[]);


  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      
      {/* 1. THE SIDEBAR */}
      <div style={{ width: '300px', backgroundColor: '#1e1e2f', color: 'white', overflowY: 'auto', padding: '20px' }}>
        <h2>Live Traffic Log</h2>
        <hr />
        {/* Map through events and show them in a list! */}
        {events.map((event) => (
          <div key={event.eventId} style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#2a2a40', borderRadius: '8px' }}>
            <strong> {event.type}</strong>
            <p style={{ margin: '5px 0' }}>Severity: <span style={{color: 'orange'}}>{event.severity}/10</span></p>
            <small>{new Date(event.timestamp).toLocaleTimeString()}</small>
          </div>
        ))}
      </div>

      {/* 2. THE MAP */}
      <div style={{ flex: 1 }}>
        <MapContainer center={position} zoom={13} style={{ height: "100%", width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {events.map((event) => (
            <Marker key={event.eventId} position={[event.latitude, event.longitude]}>
              <Popup>
                <b>{event.type}</b><br/>
                Severity: {event.severity}/10
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

    </div>
  );

}

export default App;