import {MapContainer,TileLayer} from 'react-leaflet';

function App(){
  const position=[22.083333, 79.533333] //indore's centre

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
      </MapContainer>
    </div>
  );
}

export default App;