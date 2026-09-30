import { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Truck, Circle } from 'lucide-react';
import { cn } from '../../utils/cn';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const VehicleIcon = ({ status, isActive }) => {
  const colors = {
    en_route: '#006948',
    collecting: '#d97706',
    idle: '#6d7a72',
    maintenance: '#ba1a1a',
    offline: '#bccac0',
  };
  const color = colors[status] || colors.idle;

  return (
    <div className={cn("flex items-center justify-center", isActive && "animate-ping")} style={{ filter: `drop-shadow(0 2px 4px ${color}80)` }}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
        style={{ backgroundColor: color }}
      >
        <Truck className="w-4 h-4 text-white" aria-hidden="true" />
      </div>
      {isActive && (
        <div className="absolute w-12 h-12 rounded-full border-2" style={{ borderColor: color, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }} />
      )}
    </div>
  );
};

const BinIcon = ({ status }) => {
  const colors = {
    CRITICAL: '#ba1a1a',
    HIGH: '#d97706',
    MEDIUM: '#2563eb',
    LOW: '#059669',
    EMPTY: '#6d7a72',
    OFFLINE: '#bccac0',
  };
  const color = colors[status] || colors.EMPTY;

  return (
    <div className="flex items-center justify-center">
      <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md" style={{ backgroundColor: color }}>
        <Circle className="w-3 h-3 text-white" aria-hidden="true" />
      </div>
    </div>
  );
};

function VehicleMarker({ vehicle, bins, isSelected, onClick }) {
  const [popupOpen, setPopupOpen] = useState(false);

  return (
    <Marker position={[vehicle.lat, vehicle.lng]} onClick={() => { onClick?.(vehicle); setPopupOpen(true); }}>
      <VehicleIcon status={vehicle.status} isActive={vehicle.status === 'en_route' || vehicle.status === 'collecting'} />
      <Popup
        offset={[0, -16]}
        onOpen={() => setPopupOpen(true)}
        onClose={() => setPopupOpen(false)}
      >
        <div className="w-64 p-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-headline-sm text-on-surface">{vehicle.vehicle_code}</h3>
            <span className={cn("badge badge-xs", vehicle.status === 'en_route' && 'badge-info', vehicle.status === 'collecting' && 'badge-warning', vehicle.status === 'maintenance' && 'badge-error', vehicle.status === 'offline' && 'badge-neutral', vehicle.status === 'idle' && 'badge-neutral')}>
              {vehicle.status.replace('_', ' ')}
            </span>
          </div>
          <div className="space-y-1 text-sm text-on-surface-variant">
            <p><strong>Driver:</strong> {vehicle.driver_name}</p>
            <p><strong>Type:</strong> {vehicle.vehicle_type}</p>
            <p><strong>Load:</strong> {(vehicle.current_load_kg / 1000).toFixed(2)}t / {(vehicle.capacity_kg / 1000).toFixed(1)}t</p>
            <p><strong>Battery:</strong> {vehicle.battery_pct}%</p>
          </div>
          {bins.length > 0 && (
            <div className="mt-2 pt-2 border-t border-outline-variant/30">
              <p className="font-label-sm text-on-surface mb-1">Assigned Bins:</p>
              <ul className="space-y-1 max-h-32 overflow-y-auto">
                {bins.slice(0, 5).map((bin) => (
                  <li key={bin.id} className="flex items-center gap-2 text-xs text-on-surface-variant">
                    <BinIcon status={bin.status} />
                    <span>{bin.bin_code} ({bin.fill_pct}%)</span>
                  </li>
                ))}
                {bins.length > 5 && <li className="text-xs text-on-surface-variant">+{bins.length - 5} more...</li>}
              </ul>
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

function BinMarker({ bin, onClick }) {
  return (
    <Marker position={[bin.lat, bin.lng]} onClick={() => onClick?.(bin)}>
      <BinIcon status={bin.status} />
      <Popup offset={[0, -12]}>
        <div className="w-56 p-2">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-headline-sm text-on-surface">{bin.bin_code}</h3>
            <span className="badge badge-neutral">{bin.waste_type}</span>
          </div>
          <div className="space-y-1 text-sm text-on-surface-variant">
            <p><strong>Zone:</strong> {bin.zone?.name || '—'}</p>
            <p><strong>Fill:</strong> {bin.fill_pct}%</p>
            <p><strong>Status:</strong> <span className={cn("font-medium", bin.status === 'CRITICAL' && 'text-error', bin.status === 'HIGH' && 'text-warning')}>{bin.status}</span></p>
            <p><strong>Battery:</strong> {bin.battery_pct !== null ? `${bin.battery_pct}%` : '—'}</p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

function FitBounds({ vehicles, bins }) {
  const map = useMap();
  const bounds = [];

  vehicles.forEach(v => bounds.push([v.lat, v.lng]));
  bins.forEach(b => bounds.push([b.lat, b.lng]));

  if (bounds.length > 0) {
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  }

  return null;
}

export function FleetMap({ vehicles = [], bins = [], selectedVehicleId, onVehicleClick, height = "h-96" }) {
  const defaultCenter = [28.6139, 77.2090];
  const defaultZoom = 11;

  const activeVehicles = vehicles.filter(v => v.status !== 'maintenance' && v.status !== 'offline');
  const criticalBins = bins.filter(b => b.status === 'CRITICAL' || b.status === 'HIGH');

  const vehicleBinMap = {};
  activeVehicles.forEach(v => { vehicleBinMap[v.id] = []; });
  criticalBins.forEach(bin => {
    let closestVehicle = null;
    let minDist = Infinity;
    activeVehicles.forEach(v => {
      const d = Math.hypot(v.lat - bin.lat, v.lng - bin.lng);
      if (d < minDist) { minDist = d; closestVehicle = v; }
    });
    if (closestVehicle) vehicleBinMap[closestVehicle.id].push(bin);
  });

  return (
    <div className={cn("rounded-xl border border-outline-variant/50 overflow-hidden", height)}>
      <MapContainer
        center={activeVehicles.length > 0 ? [activeVehicles[0].lat, activeVehicles[0].lng] : defaultCenter}
        zoom={activeVehicles.length > 0 ? 12 : defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <FitBounds vehicles={activeVehicles} bins={criticalBins} />
        {activeVehicles.map((vehicle) => (
          <VehicleMarker
            key={vehicle.id}
            vehicle={vehicle}
            bins={vehicleBinMap[vehicle.id] || []}
            isSelected={selectedVehicleId === vehicle.id}
            onClick={onVehicleClick}
          />
        ))}
        {criticalBins.map((bin) => (
          <BinMarker key={bin.id} bin={bin} onClick={onVehicleClick} />
        ))}
      </MapContainer>
    </div>
  );
}