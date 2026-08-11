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
      setEvents((prevEvents) => [...prevEvents, newEvent]);
    });
    
    return() => socket.off('new-event');
  },[]);


  return(
    <div style={{height:'100vh', width:'100vw'}}>
      <MapContainer
        center={position}
        zoom={13}
        style={{height:"100%",width:'100%'}}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* render a marker on map for each event*/}
        {events.map((event)=>(
          <Marker key={event.eventId} position={[event.latitude, event.longitude]}>
            <Popup> {event.type}</Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
}

export default App;