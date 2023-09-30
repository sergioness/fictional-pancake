import logo from './logo.svg';
import './App.css';
import { Marker, Popup, MapContainer, TileLayer, useMap } from 'react-leaflet';

async function readDocument(rawFile, type = "application/xml") {
  const reader = new FileReader();
  const file = new Promise((resolve, reject) => {
    reader.addEventListener('loadend', (event) => {
      resolve(reader.result);
    })
  });
  reader.readAsText(rawFile);
  const doc = new DOMParser().parseFromString(await file, type)
  return doc;
}

async function onFileUpload(event) {
  if (!event.target?.files.length ) return;
  const [ file ] = event.target.files;
  const document = await readDocument(file);
  console.debug('document:%o', document);
}
function App() {
  return (
    <main style={{ width: '100%', height: '100%', gap: '10px', display: 'flex', flexDirection  : 'column', justifyContent: 'center', alignItems: 'center'}}>
      <label>
        Your file please
        <input onChange={onFileUpload} type='file' />
      </label>
      <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={false}>
  <TileLayer
    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
  <Marker position={[51.505, -0.09]}>
    <Popup>
      A pretty CSS3 popup. <br /> Easily customizable.
    </Popup>
  </Marker>
</MapContainer>
    </main>
  );
}

export default App;
