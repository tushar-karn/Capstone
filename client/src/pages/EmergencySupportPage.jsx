import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import { HiOutlinePhone, HiOutlineLocationMarker, HiOutlinePaperAirplane } from 'react-icons/hi';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const emergencyContacts = [
    { name: 'Campus Security', phone: '+1-555-911-0001', type: 'security', available: '24/7' },
    { name: 'University Hospital', phone: '+1-555-911-0002', type: 'medical', available: '24/7' },
    { name: 'Fire Department', phone: '+1-555-911-0003', type: 'fire', available: '24/7' },
    { name: 'Counseling Center', phone: '+1-555-911-0004', type: 'mental', available: '8AM-8PM' },
    { name: 'Campus Safety Office', phone: '+1-555-911-0005', type: 'safety', available: '9AM-6PM' },
    { name: 'Poison Control', phone: '+1-555-911-0006', type: 'medical', available: '24/7' },
];

const typeIcons = { security: '🔒', medical: '🏥', fire: '🔥', mental: '💚', safety: '🛡️' };

export default function EmergencySupportPage() {
    const { user } = useAuth();
    const [zones, setZones] = useState([]);
    const [sosActive, setSosActive] = useState(false);
    const [incidentForm, setIncidentForm] = useState({
        title: '', description: '', type: 'Medical', severity: 'Medium',
        location: { address: '', building: '', coordinates: [0, 0] }
    });
    const [pinDropped, setPinDropped] = useState(false);
    function LocationMarker() {
        useMapEvents({
            async click(e) {
                const lat = e.latlng.lat;
                const lng = e.latlng.lng;

                // Set coordinates immediately
                setIncidentForm(prev => ({
                    ...prev,
                    location: { ...prev.location, coordinates: [lng, lat] }
                }));
                setPinDropped(true);

                // Reverse geocode to get address
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                    const data = await res.json();

                    if (data && data.address) {
                        // Construct a readable address
                        const buildName = data.address.building || data.address.amenity || data.address.road || data.display_name.split(',')[0];
                        setIncidentForm(prev => ({
                            ...prev,
                            location: { ...prev.location, address: data.display_name, building: buildName }
                        }));
                        toast.success(`Location set: ${buildName}`);
                    }
                } catch (error) {
                    console.error("Reverse geocoding failed", error);
                    toast.error("Could not fetch address for this location.");
                }
            },
        });

        return pinDropped ? (
            <Marker position={[incidentForm.location.coordinates[1], incidentForm.location.coordinates[0]]}>
                <Popup>{incidentForm.location.building || 'Report Location'}</Popup>
            </Marker>
        ) : null;
    }

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchZones = async () => {
            try {
                const res = await api.get('/emergency-zones');
                setZones(res.data.zones);
            } catch (err) {
                console.error('Failed to fetch zones');
            }
        };
        fetchZones();
    }, []);

    const handleSOS = () => {
        setSosActive(true);

        const sendSOSIncident = async (lat, lng, address) => {
            try {
                await api.post('/incidents', {
                    title: `🚨 SOS Alert: ${user?.name || 'User'}`,
                    description: 'Emergency SOS activated! Immediate assistance required.',
                    type: 'Security',
                    severity: 'Critical',
                    location: {
                        address: address || 'Location shared via GPS',
                        building: address ? 'Via GPS' : 'Unknown',
                        coordinates: [lng, lat]
                    }
                });
                toast.success('🆘 SOS Alert sent! Campus Security has your location.', { duration: 5000 });
            } catch (err) {
                toast.error('Failed to notify security. Please call immediately!');
            }
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;

                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                        const data = await res.json();
                        const address = data?.display_name || 'GPS Location';
                        await sendSOSIncident(lat, lng, address);
                    } catch (err) {
                        await sendSOSIncident(lat, lng, '');
                    }
                },
                (err) => {
                    sendSOSIncident(0, 0, 'Location Access Denied');
                }
            );
        } else {
            sendSOSIncident(0, 0, 'Geolocation not supported');
        }

        setTimeout(() => setSosActive(false), 3000);
    };

    const handleIncidentSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/incidents', incidentForm);
            toast.success('Incident reported successfully');
            setIncidentForm({ title: '', description: '', type: 'Medical', severity: 'Medium', location: { address: '', building: '', coordinates: [0, 0] } });
            setPinDropped(false);
        } catch (err) {
            toast.error('Failed to report incident');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Emergency Support</h1>
                <p className="text-slate-400 mt-1">Access emergency resources and report incidents</p>
            </div>

            {/* SOS Button + Contacts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SOS */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-6 flex flex-col items-center justify-center text-center"
                >
                    <h3 className="text-lg font-semibold text-white mb-4">Emergency SOS</h3>
                    <button
                        onClick={handleSOS}
                        className={`w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-2xl font-bold transition-all hover:scale-105 ${sosActive ? 'sos-pulse' : ''}`}
                    >
                        SOS
                    </button>
                    <p className="text-sm text-slate-400 mt-4">Press for immediate campus security response</p>
                    <p className="text-xs text-slate-500 mt-1">Your location will be shared with responders</p>
                </motion.div>

                {/* Emergency Contacts */}
                <div className="lg:col-span-2 glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <HiOutlinePhone className="w-5 h-5 text-emerald-400" />
                        Emergency Contacts
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {emergencyContacts.map((contact, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-indigo-500/30 transition-colors"
                            >
                                <span className="text-xl">{typeIcons[contact.type]}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white">{contact.name}</p>
                                    <p className="text-xs text-indigo-400">{contact.phone}</p>
                                </div>
                                <span className="text-xs text-slate-500">{contact.available}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Help Centers Map + Incident Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Map */}
                <div className="glass-card overflow-hidden" style={{ height: 400 }}>
                    <div className="p-4 pb-2">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <HiOutlineLocationMarker className="w-4 h-4 text-blue-400" />
                            Incident Location (Click map to drop pin)
                        </h3>
                    </div>
                    <div style={{ height: 340 }}>
                        <MapContainer center={[28.6140, 77.2090]} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {zones.flatMap(zone =>
                                (zone.shelters || []).map((sh, i) => (
                                    <Marker key={`${zone._id}-${i}`} position={sh.coordinates}>
                                        <Popup>
                                            <div style={{ color: '#1e293b' }}>
                                                <strong>{sh.name}</strong><br />
                                                <span style={{ fontSize: 12 }}>{sh.type} • 📞 {sh.contact}</span>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))
                            )}
                            <LocationMarker />
                        </MapContainer>
                    </div>
                </div>

                {/* Incident Report Form */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <HiOutlinePaperAirplane className="w-5 h-5 text-amber-400" />
                        Report Incident
                    </h3>
                    <form onSubmit={handleIncidentSubmit} className="space-y-4">
                        <div>
                            <label className="form-label">Incident Title *</label>
                            <input
                                value={incidentForm.title}
                                onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                                className="form-input"
                                placeholder="Brief description of the incident"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="form-label">Type</label>
                                <select value={incidentForm.type} onChange={(e) => setIncidentForm({ ...incidentForm, type: e.target.value })} className="form-select">
                                    {['Fire', 'Earthquake', 'Flood', 'Medical', 'Chemical', 'Security', 'Other'].map(t =>
                                        <option key={t} value={t}>{t}</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Severity</label>
                                <select value={incidentForm.severity} onChange={(e) => setIncidentForm({ ...incidentForm, severity: e.target.value })} className="form-select">
                                    {['Low', 'Medium', 'High', 'Critical'].map(s =>
                                        <option key={s} value={s}>{s}</option>
                                    )}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Location / Building</label>
                            <input
                                value={incidentForm.location.building}
                                onChange={(e) => setIncidentForm({ ...incidentForm, location: { ...incidentForm.location, building: e.target.value, address: e.target.value } })}
                                className="form-input"
                                placeholder="e.g., Science Building, Room 204"
                            />
                        </div>
                        <div>
                            <label className="form-label">Description *</label>
                            <textarea
                                value={incidentForm.description}
                                onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                                className="form-input min-h-[100px] resize-y"
                                placeholder="Provide detailed information about the incident..."
                                required
                            />
                        </div>
                        <button type="submit" disabled={submitting} className="btn-danger w-full justify-center">
                            {submitting ? 'Submitting...' : '🚨 Report Incident'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
