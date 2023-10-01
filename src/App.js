import "./App.css";
import "leaflet/dist/leaflet.css";
import {
  Popup,
  MapContainer,
  TileLayer,
  useMapEvents,
  useMap,
  Polyline,
} from "react-leaflet";
import { useMemo, useRef, useState } from "react";

async function readDocument(rawFile, type = "application/xml") {
  const reader = new FileReader();
  const file = new Promise((resolve, reject) => {
    const onLoadEnd = (event) => {
      resolve(reader.result);
      reader.removeEventListener("loadend", onLoadEnd);
    };
    const onError = (event) => {
      reject(reader.result);
      reader.removeEventListener("error", onLoadEnd);
    };
    reader.addEventListener("loadend", onLoadEnd);
    reader.addEventListener("error", onError);
  });
  reader.readAsText(rawFile);
  const doc = new DOMParser().parseFromString(await file, type);
  return doc;
}

function DistanceMeasurer({ positions }) {
  const map = useMap();
  if (!positions.length) {
    return <></>;
  }
  const pointA = positions[0];
  const [distance] = positions.reduce(
    ([sum, prevPoint], position) => [
      sum + map.distance(prevPoint, position),
      position,
    ],
    [0, pointA]
  );
  return (
    <>
      <Popup>Distance: {Number(distance).toFixed(2)} meters</Popup>
    </>
  );
}

function DisplayPointInfo({ point }) {
  // if (!point) {
  //   return <></>;
  // }
  const distance = 42;
  if (!point) return <></>;
  if (!point.latlng) return <></>;
  const lat = point.latlng.lat;
  const lng = point.latlng.lng;
  console.log(lat, lng)

  return (
    <>
      <Popup>
        lat: {lat} lng: {lng}
        {/* Elevuation: {Number(distance).toFixed(2)} meters
        Time: {Number(distance).toFixed(2)}
        Course: {Number(distance).toFixed(2)} azimute
        Velocity: {Number(distance).toFixed(2)} m/s */}
      </Popup>
    </>
  );
}

const mapGeoObjToTuple = ({ lat, lon }) => [lat, lon];

function App() {
  const mapDefaultZoom = 4;
  const defaultPosition = [50, 0];
  let mapPosition, mapZoom;

  const [selectedPoint, setSelectedPoint] = useState(null);
  
  const { current: pathOptions } = useRef({ color: "red", weight: 4 });
  const { current: pathOptionsSelected } = useRef({
    color: "purple",
    weight: 4,
  });
  const { current: pathOptionsSelectedHover } = useRef({ weight: 5 });
  const { current: DATE } = useRef({
    START: new Date("2023-09-24T15:09:12Z"),
    END: new Date("2023-09-24T15:30:12Z"),
  });
  const [doc, setDoc] = useState(null);
  async function onFileUpload(event) {
    if (!event.target?.files.length) return;
    const [file] = event.target.files;
    const doc = await readDocument(file);
    setDoc(doc);
  }
  const points = useMemo(() => {
    if (!doc) return [];
    const xpath = "//*[local-name()='trkpt']";
    /** @type {XPathResult} */
    const nodes = doc.evaluate(xpath, doc, null, XPathResult.ANY_TYPE, null);
    const pts = [];
    for (let node = nodes.iterateNext(); node; node = nodes.iterateNext()) {
      const lat = node.getAttribute("lat");
      const lon = node.getAttribute("lon");
      const time = node.querySelector("time")?.textContent;
      pts.push({ lat, lon, time });
    }
    return pts;
  }, [doc]);
  const positions = useMemo(() => points.map(mapGeoObjToTuple), [points]);
  mapPosition = positions[positions.length - 1] ?? defaultPosition;
  mapZoom = positions.length > 0 ? positions.length * 0.01 ?? mapDefaultZoom : mapDefaultZoom;
  const positionsSelected = useMemo(
    () =>
      points
        .filter(
          ({ time }) =>
            time && DATE.START <= new Date(time) && new Date(time) <= DATE.END
        )
        .map(mapGeoObjToTuple),
    [points]
  );
  return (
    <main>
      <div>
        <label>
          Your file please
          <input onChange={onFileUpload} type="file" accept=".gpx" />
        </label>
      </div>
      <div style={{ width: "1000px", height: "800px" }}>
        <MapContainer 
          style={{ width: "100%", height: "100%" }}
          center={mapPosition}
          zoom={mapZoom}
          dragging={true}
          doubleClickZoom={false}
          scrollWheelZoom={true}
          attributionControl={false}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline pathOptions={pathOptions} positions={positions}
          eventHandlers={{
            click: (e) => {console.log(e); e.target.openPopup(); setSelectedPoint(e); console.log(selectedPoint);},
          }} 
          >
            <DisplayPointInfo point={selectedPoint} />
          </Polyline>
          <Polyline
            pathOptions={pathOptionsSelected}
            positions={positionsSelected}
            eventHandlers={{
              mouseover: (e) => {
                e.target.setStyle(pathOptionsSelectedHover);
                e.target.openPopup();
              },
              mouseout: (e) => {
                e.target.setStyle(pathOptionsSelected);
                e.target.closePopup();
              },
              click: (e) => {console.log(e); e.target.openPopup(); setSelectedPoint(e); console.log(selectedPoint);},
            }}
          >
            <DistanceMeasurer positions={positionsSelected} />
          </Polyline>
        </MapContainer>
      </div>
    </main>
  );
}

export default App;
