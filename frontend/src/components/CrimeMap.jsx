import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const SEVERITY_COLOR = { High: "#dc143c", Medium: "#f5a524", Low: "#1a9e5c" };
const NEPAL_CENTER = [28.3949, 84.124];

export default function CrimeMap({ reports = [], height = 440, onSelect }) {
  const points = reports.filter((r) => r.location && r.location.lat && r.location.lng);

  return (
    <div>
      <div className="map-container" style={{ height }}>
        <MapContainer center={NEPAL_CENTER} zoom={7} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((r) => (
            <CircleMarker
              key={r.id}
              center={[r.location.lat, r.location.lng]}
              radius={9}
              pathOptions={{
                color: SEVERITY_COLOR[r.severity] || "#6b7688",
                fillColor: SEVERITY_COLOR[r.severity] || "#6b7688",
                fillOpacity: 0.75,
                weight: 2
              }}
              eventHandlers={onSelect ? { click: () => onSelect(r) } : undefined}
            >
              <Popup>
                <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                  <strong>{r.caseId}</strong>
                  <br />
                  {r.title}
                  <br />
                  <span style={{ color: SEVERITY_COLOR[r.severity] }}>{r.severity} severity</span> · {r.status}
                  <br />
                  <span style={{ color: "#6b7688" }}>{r.location.address}</span>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <div className="map-legend">
        <span><span className="dot" style={{ background: SEVERITY_COLOR.High }} />High</span>
        <span><span className="dot" style={{ background: SEVERITY_COLOR.Medium }} />Medium</span>
        <span><span className="dot" style={{ background: SEVERITY_COLOR.Low }} />Low</span>
        <span style={{ marginLeft: "auto" }}>{points.length} report{points.length !== 1 ? "s" : ""} on map</span>
      </div>
    </div>
  );
}
