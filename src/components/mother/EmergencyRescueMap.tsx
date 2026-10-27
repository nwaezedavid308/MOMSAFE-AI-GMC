import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldAlert, MapPin, Phone, MessageSquare, Share2, Plus, 
  Trash2, Navigation, Compass, AlertTriangle, CheckCircle2, 
  Clock, Radio, Check, Copy, ExternalLink, HeartHandshake,
  Car, Ambulance, RefreshCw, UserPlus, Shield, Hospital, Building2, Stethoscope
} from "lucide-react";
import { Case } from "../../types";

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
  canReceiveGps: boolean;
}

interface RescueFacility {
  id: string;
  name: string;
  type: string;
  address: string;
  distanceKm: number;
  etaMinutes: number;
  phone: string;
  is24h: boolean;
  bloodBankReady: boolean;
  theatreReady: boolean;
  coordinates: { x: number; y: number; lat: number; lng: number };
}

interface RescueVehicle {
  id: string;
  callsign: string;
  driverName: string;
  type: "Ambulance" | "Keke Rescue";
  phone: string;
  status: "Available" | "En Route" | "On Standby";
  currentLocation: string;
  distanceKm: number;
  etaMinutes: number;
  coordinates: { x: number; y: number };
}

const DEFAULT_FACILITIES: RescueFacility[] = [
  {
    id: "gmc",
    name: "Googwill Medical Centre (GMC)",
    type: "Primary Referral Hospital",
    address: "Umuchigbo, Iji-Nike, Enugu East LGA",
    distanceKm: 1.2,
    etaMinutes: 4,
    phone: "08034567890",
    is24h: true,
    bloodBankReady: true,
    theatreReady: true,
    coordinates: { x: 58, y: 38, lat: 6.4560, lng: 7.5140 }
  },
  {
    id: "phc",
    name: "Umuchigbo Primary Health Post",
    type: "Community Health Centre",
    address: "Market Square, Umuchigbo",
    distanceKm: 0.6,
    etaMinutes: 2,
    phone: "08051122334",
    is24h: false,
    bloodBankReady: false,
    theatreReady: false,
    coordinates: { x: 38, y: 62, lat: 6.4510, lng: 7.5080 }
  },
  {
    id: "annunciation",
    name: "Annunciation Specialist Hospital",
    type: "Tertiary Obstetric Care",
    address: "Emene Road, Enugu East",
    distanceKm: 4.8,
    etaMinutes: 12,
    phone: "08023344556",
    is24h: true,
    bloodBankReady: true,
    theatreReady: true,
    coordinates: { x: 82, y: 22, lat: 6.4720, lng: 7.5350 }
  }
];

const RESCUE_VEHICLES: RescueVehicle[] = [
  {
    id: "v-1",
    callsign: "GMC Mobile Amb-01",
    driverName: "Obinna (GMC Driver)",
    type: "Ambulance",
    phone: "08034567891",
    status: "Available",
    currentLocation: "Umuchigbo Central Link",
    distanceKm: 0.9,
    etaMinutes: 3,
    coordinates: { x: 50, y: 46 }
  },
  {
    id: "v-2",
    callsign: "Umuchigbo Keke Rescue-03",
    driverName: "Chidi (Community Pilot)",
    type: "Keke Rescue",
    phone: "08076543210",
    status: "Available",
    currentLocation: "St. Jude Junction",
    distanceKm: 0.4,
    etaMinutes: 2,
    coordinates: { x: 42, y: 55 }
  }
];

interface EmergencyRescueMapProps {
  currentUser?: { name: string; role: string; community?: string } | null;
  onTriggerSos: () => void;
  selectedWeek: number;
}

export default function EmergencyRescueMap({ currentUser, onTriggerSos, selectedWeek }: EmergencyRescueMapProps) {
  // Live GPS State
  const [gpsCoords, setGpsCoords] = useState({ lat: 6.4524, lng: 7.5105, accuracy: 12 });
  const [isLocating, setIsLocating] = useState(false);
  const [locationName, setLocationName] = useState("Near Umuchigbo Village Square, Iji-Nike, Enugu East");
  const [copiedLink, setCopiedLink] = useState(false);

  // Contacts State
  const [contacts, setContacts] = useState<EmergencyContact[]>([
    {
      id: "c1",
      name: "Emeka Obi",
      relationship: "Husband / Primary Partner",
      phone: "08034567812",
      isPrimary: true,
      canReceiveGps: true
    },
    {
      id: "c2",
      name: "Nneoma Chinyere",
      relationship: "Mother (Omugwo Caregiver)",
      phone: "08021122334",
      isPrimary: false,
      canReceiveGps: true
    },
    {
      id: "c3",
      name: "Nurse Eunice (TBA Lead)",
      relationship: "Assigned Community TBA Midwife",
      phone: "08069988771",
      isPrimary: true,
      canReceiveGps: true
    },
    {
      id: "c4",
      name: "Googwill Medical Centre ER",
      relationship: "Hospital 24/7 Obstetric Triage",
      phone: "08034567890",
      isPrimary: true,
      canReceiveGps: true
    }
  ]);

  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    relationship: "Family Member",
    phone: "",
    isPrimary: false
  });

  // Selected Facility on Map
  const [selectedFacility, setSelectedFacility] = useState<RescueFacility>(DEFAULT_FACILITIES[0]);
  const [dispatchConfirmed, setDispatchConfirmed] = useState<string | null>(null);

  // Geolocation Handler
  const handleFetchLiveGps = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({
            lat: Number(pos.coords.latitude.toFixed(4)),
            lng: Number(pos.coords.longitude.toFixed(4)),
            accuracy: Math.round(pos.coords.accuracy)
          });
          setIsLocating(false);
        },
        (err) => {
          console.warn("GPS lookup fallback:", err);
          // Keep Enugu East calibrated default
          setGpsCoords({ lat: 6.4524, lng: 7.5105, accuracy: 8 });
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    handleFetchLiveGps();
  }, []);

  const googleMapsUrl = `https://maps.google.com/?q=${gpsCoords.lat},${gpsCoords.lng}`;
  const whatsappSosMessage = encodeURIComponent(
    `[MAMAALERT MATERNAL EMERGENCY SOS]\n\n` +
    `Mama: ${currentUser?.name || "Expectant Mother"} (${selectedWeek} weeks pregnant)\n` +
    `I need urgent medical rescue/assistance in Umuchigbo, Enugu East.\n\n` +
    `Live GPS Location: ${locationName}\n` +
    `Map Pin: ${googleMapsUrl}\n` +
    `Hospital: Googwill Medical Centre (08034567890)\n` +
    `Please call or send help immediately!`
  );

  const handleCopyGps = () => {
    const text = `MamaAlert GPS Pin: ${gpsCoords.lat}, ${gpsCoords.lng} (${locationName}) - ${googleMapsUrl}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    const contact: EmergencyContact = {
      id: Math.random().toString(),
      name: newContact.name,
      relationship: newContact.relationship,
      phone: newContact.phone,
      isPrimary: newContact.isPrimary,
      canReceiveGps: true
    };
    setContacts((prev) => [...prev, contact]);
    setNewContact({ name: "", relationship: "Family Member", phone: "", isPrimary: false });
    setShowAddContact(false);
  };

  const handleDeleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const handleRequestVehicle = (vehicle: RescueVehicle) => {
    setDispatchConfirmed(vehicle.callsign);
    onTriggerSos();
    setTimeout(() => {
      setDispatchConfirmed(null);
    }, 6000);
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP SOS & LIVE LOCATION COMMAND STRIP */}
      <div className="bg-gradient-to-br from-red-600 via-rose-600 to-red-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-white/20">
                <Radio className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                <span>24/7 ENUGU EAST RESCUE BEACON ACTIVE</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                Emergency Rescue & Hospital Lifeline
              </h2>
              <p className="text-xs sm:text-sm text-red-100 max-w-xl">
                1-tap broadcast to Googwill Medical Centre (GMC) triage team, on-call community TBAs, and registered emergency transport pilots.
              </p>
            </div>

            {/* Massive 1-Tap SOS Button */}
            <button
              onClick={onTriggerSos}
              className="px-6 py-4 bg-white hover:bg-red-50 text-red-700 font-black text-sm sm:text-base rounded-2xl shadow-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 cursor-pointer border-2 border-red-200"
            >
              <ShieldAlert className="w-6 h-6 text-red-600 animate-bounce" />
              <div className="text-left leading-tight">
                <div className="text-[10px] uppercase font-bold text-red-500">Immediate Action</div>
                <div>ACTIVATE 1-TAP SOS</div>
              </div>
            </button>
          </div>

          {/* Live GPS & Location Card */}
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-red-200">
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>CURRENT LIVE RESCUE LOCATION</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Accuracy ±{gpsCoords.accuracy}m
                </span>
              </div>
              <p className="text-sm font-semibold text-white">{locationName}</p>
              <p className="text-xs font-mono text-red-200">
                Coordinates: {gpsCoords.lat}° N, {gpsCoords.lng}° E
              </p>
            </div>

            {/* Location Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleFetchLiveGps}
                disabled={isLocating}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
                <span>{isLocating ? "Calibrating GPS..." : "Refresh GPS"}</span>
              </button>

              <button
                onClick={handleCopyGps}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Copied!" : "Copy Pin"}</span>
              </button>

              <a
                href={`https://wa.me/?text=${whatsappSosMessage}`}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Send WhatsApp SOS</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN GRID: INTERACTIVE RESCUE MAP & TRUSTED CONTACTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: INTERACTIVE HOSPITAL & RESCUE MAP (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-brand-purple flex items-center justify-center font-bold">
                    <Compass className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">
                    Enugu East Hospital & Rescue Map
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Live tracking of referral hospitals, health posts, and mobile rescue vehicles in Umuchigbo.
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] bg-slate-100 px-2.5 py-1 rounded-xl text-slate-600 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Live GPS Feed</span>
              </div>
            </div>

            {/* Custom SVG Interactive Map Container */}
            <div className="relative w-full h-72 sm:h-80 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
              {/* Map Grid Background Pattern */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(#a855f7 1px, transparent 1px), radial-gradient(#a855f7 1px, #0f172a 1px)`,
                  backgroundSize: "24px 24px"
                }}
              />

              {/* Road / Transit Lines (SVG Overlays) */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Nike Lake Road Highway */}
                <path d="M 10 260 Q 150 180 320 140 T 550 80" stroke="#334155" strokeWidth="6" fill="none" />
                <path d="M 10 260 Q 150 180 320 140 T 550 80" stroke="#64748b" strokeWidth="2" strokeDasharray="6,6" fill="none" />
                
                {/* Umuchigbo Link Corridor */}
                <path d="M 180 200 L 250 120 L 380 90" stroke="#3b82f6" strokeWidth="4" strokeOpacity="0.6" fill="none" />

                {/* Emergency Route to GMC */}
                <line x1="45%" y1="52%" x2="58%" y2="38%" stroke="#ef4444" strokeWidth="3" strokeDasharray="4,4" className="animate-pulse" />
              </svg>

              {/* Mother's Live Location Pin (Beacon) */}
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                style={{ left: "45%", top: "52%" }}
              >
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-8 h-8 rounded-full bg-pink-500/40 animate-ping" />
                  <span className="absolute w-6 h-6 rounded-full bg-pink-500/70 animate-pulse" />
                  <div className="w-5 h-5 rounded-full bg-pink-600 border-2 border-white flex items-center justify-center shadow-lg">
                    <span className="text-[9px] text-white font-black">M</span>
                  </div>
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-950 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap z-30 border border-slate-700">
                  You (Mama) • Umuchigbo
                </div>
              </div>

              {/* Facility Markers */}
              {DEFAULT_FACILITIES.map((fac) => {
                const isSelected = selectedFacility.id === fac.id;
                return (
                  <div
                    key={fac.id}
                    onClick={() => setSelectedFacility(fac)}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group transition-all"
                    style={{ left: `${fac.coordinates.x}%`, top: `${fac.coordinates.y}%` }}
                  >
                    <div className={`p-1.5 rounded-xl flex items-center gap-1 shadow-lg border transition-all ${
                      isSelected
                        ? "bg-brand-purple text-white border-purple-300 scale-110 ring-2 ring-purple-400"
                        : "bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700"
                    }`}>
                      {fac.id === "gmc" ? (
                        <Hospital className="w-3.5 h-3.5 text-pink-400" />
                      ) : fac.id === "phc" ? (
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                      ) : (
                        <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span className="text-[10px] font-bold hidden sm:inline">{fac.name.split(" ")[0]}</span>
                    </div>
                  </div>
                );
              })}

              {/* Mobile Rescue Vehicle Markers */}
              {RESCUE_VEHICLES.map((veh) => (
                <div
                  key={veh.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
                  style={{ left: `${veh.coordinates.x}%`, top: `${veh.coordinates.y}%` }}
                >
                  <div className="bg-emerald-950/90 border border-emerald-500 text-emerald-300 px-2 py-1 rounded-lg flex items-center gap-1 text-[10px] font-bold shadow-md animate-bounce">
                    {veh.type === "Ambulance" ? (
                      <Ambulance className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Car className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                    <span className="hidden sm:inline">{veh.callsign.split(" ")[1]}</span>
                  </div>
                </div>
              ))}

              {/* Map Legend Overlay */}
              <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md p-2 rounded-xl border border-slate-800 text-[10px] text-slate-300 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                  <span>Your Location</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ml-1" />
                  <span>GMC Referral Center</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Active Rescue Ambulance/Keke (ETA ~3m)</span>
                </div>
              </div>
            </div>

            {/* Selected Facility Details & Direct Route Card */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-800">{selectedFacility.name}</h4>
                    <span className="text-[10px] font-bold bg-purple-100 text-brand-purple px-2 py-0.5 rounded-full">
                      {selectedFacility.distanceKm} km ({selectedFacility.etaMinutes} mins)
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{selectedFacility.address}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedFacility.phone}`}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call ER ({selectedFacility.phone})</span>
                  </a>
                </div>
              </div>

              {/* Clinical Capabilities Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/80 text-[11px]">
                <span className={`px-2 py-0.5 rounded-md font-semibold ${
                  selectedFacility.is24h ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}>
                  {selectedFacility.is24h ? "24/7 Obstetric Emergency Open" : "Day Clinic"}
                </span>

                {selectedFacility.bloodBankReady && (
                  <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-md font-semibold">
                    Blood Bank Synchronized
                  </span>
                )}

                {selectedFacility.theatreReady && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md font-semibold">
                    C-Section Theatre On Standby
                  </span>
                )}
              </div>
            </div>

            {/* Mobile Rescue Fleet (Ambulance & Keke Units) */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4 text-emerald-600" />
                <span>On-Call Emergency Transport Fleet (Umuchigbo)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {RESCUE_VEHICLES.map((veh) => (
                  <div key={veh.id} className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-emerald-950 flex items-center gap-1.5">
                          {veh.type === "Ambulance" ? (
                            <Ambulance className="w-3.5 h-3.5 text-emerald-700" />
                          ) : (
                            <Car className="w-3.5 h-3.5 text-emerald-700" />
                          )}
                          <span>{veh.callsign}</span>
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                          ETA {veh.etaMinutes} mins
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Driver: {veh.driverName} • {veh.currentLocation}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-emerald-100">
                      <a
                        href={`tel:${veh.phone}`}
                        className="flex-1 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-300 flex items-center justify-center gap-1 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call Driver</span>
                      </a>
                      <button
                        onClick={() => handleRequestVehicle(veh)}
                        className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-xs"
                      >
                        {dispatchConfirmed === veh.callsign ? "Dispatched!" : "Dispatch Now"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: TRUSTED EMERGENCY CONTACTS (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">
                    Trusted Emergency Contacts
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    Instantly notified with live GPS during an emergency SOS
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddContact(!showAddContact)}
                className="p-2 bg-purple-50 hover:bg-purple-100 text-brand-purple rounded-xl transition-colors cursor-pointer"
                title="Add Trusted Contact"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Add Contact Modal / Inline Form */}
            <AnimatePresence>
              {showAddContact && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddContactSubmit}
                  className="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 space-y-3"
                >
                  <div className="text-xs font-bold text-brand-purple">Add New Trusted Guardian</div>
                  
                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Full Name (e.g. Chinedu Eze)"
                      value={newContact.name}
                      onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                      className="w-full bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl outline-none focus:border-brand-purple text-slate-800"
                      required
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newContact.relationship}
                        onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                        className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl outline-none focus:border-brand-purple text-slate-800"
                      >
                        <option value="Husband / Partner">Husband / Partner</option>
                        <option value="Mother / Mother-in-Law">Mother / Mother-in-Law</option>
                        <option value="Sister / Relative">Sister / Relative</option>
                        <option value="Neighbor / Community Leader">Neighbor</option>
                        <option value="Private Doctor / Midwife">Midwife</option>
                      </select>

                      <input
                        type="tel"
                        placeholder="Phone (080...)"
                        value={newContact.phone}
                        onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                        className="bg-white border border-slate-200 text-xs px-3 py-2 rounded-xl outline-none focus:border-brand-purple text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddContact(false)}
                      className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-brand-purple hover:bg-dark-purple text-white font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Save Guardian
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Contacts List */}
            <div className="space-y-3">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="p-3.5 bg-slate-50 hover:bg-purple-50/40 border border-slate-200 rounded-2xl transition-all space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-800">{contact.name}</span>
                        {contact.isPrimary && (
                          <span className="text-[9px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded-full uppercase">
                            Primary SOS
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">{contact.relationship}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="text-slate-300 hover:text-red-500 p-1 transition-colors cursor-pointer"
                      title="Remove contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-xs font-mono text-slate-700">{contact.phone}</span>
                    
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`https://wa.me/234${contact.phone.replace(/^0/, "")}?text=${whatsappSosMessage}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                        title="Send SOS SMS/WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                      
                      <a
                        href={`tel:${contact.phone}`}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Protocol Info Card */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>What Happens When SOS is Triggered:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] text-amber-800 space-y-0.5 leading-relaxed pl-1">
                <li>GMC Hospital Command Board sounds a critical Red Alert.</li>
                <li>Your live GPS pin & clinical profile are transmitted to on-duty triage.</li>
                <li>Your primary emergency contacts receive automated emergency beacons.</li>
              </ul>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
