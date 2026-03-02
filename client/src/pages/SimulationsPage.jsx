import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import { HiOutlinePlay, HiOutlineExclamation, HiOutlineLocationMarker, HiOutlineLightningBolt, HiOutlineCheckCircle, HiOutlinePlus, HiOutlineX } from 'react-icons/hi';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createCustomIcon = (color) => L.divIcon({
    className: 'custom-marker',
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
    <div style="width:8px;height:8px;background:white;border-radius:50%;"></div>
  </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
});

const zoneColors = { danger: '#ef4444', warning: '#f59e0b', safe: '#10b981' };
const zoneLabels = { danger: 'High Risk', warning: 'Medium Risk', safe: 'Safe Zone' };

const simTypeIcons = { 'Fire Drill': '🔥', 'Earthquake Drill': '🌍', 'Flood Scenario': '🌊', 'Health Emergency': '🏥', 'Chemical Spill': '☢️', 'Active Threat': '🚨' };

export default function SimulationsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const isAdmin = ['admin', 'staff', 'officer'].includes(user?.role);
    const [zones, setZones] = useState([]);
    const [simulations, setSimulations] = useState([]);
    const [warnings, setWarnings] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedZone, setSelectedZone] = useState(null);
    const [activeTab, setActiveTab] = useState('map');

    const [completingSim, setCompletingSim] = useState(null);
    const [checkedSteps, setCheckedSteps] = useState({});
    const [feedback, setFeedback] = useState('');

    const [isDrawing, setIsDrawing] = useState(false);
    const [newZonePoints, setNewZonePoints] = useState([]);
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [zoneForm, setZoneForm] = useState({ name: '', type: 'safe', description: '' });

    const [showCreateDrillModal, setShowCreateDrillModal] = useState(false);
    const [drillForm, setDrillForm] = useState({
        title: '',
        type: 'Fire Drill',
        difficulty: 'Medium',
        description: '',
        scenario: '',
        duration: 30,
        instructions: [{ step: 1, action: '', timeLimit: 60 }]
    });

    // Map Click Handler Component
    const MapClickHandler = () => {
        useMapEvents({
            click: (e) => {
                if (isDrawing) {
                    setNewZonePoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
                }
            }
        });
        return null;
    };

    // Auto-focus utility for map
    const MapController = ({ centerZone }) => {
        const map = useMap();
        useEffect(() => {
            if (centerZone && centerZone.coordinates && centerZone.coordinates.length > 0) {
                // Calculate center from polygon
                const lats = centerZone.coordinates.map(p => p[0]);
                const lngs = centerZone.coordinates.map(p => p[1]);
                const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
                const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
                map.flyTo([centerLat, centerLng], 18, { duration: 1.5 });
            }
        }, [centerZone, map]);
        return null;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [zonesRes, simRes, warnRes, incidentsRes] = await Promise.all([
                    api.get('/emergency-zones'),
                    api.get('/simulations'),
                    api.get('/emergency-zones/ai/warnings'),
                    api.get('/incidents?status=In Progress')
                ]);
                setZones(zonesRes.data.zones);
                setSimulations(simRes.data.simulations);
                setWarnings(warnRes.data.warnings);
                setIncidents(incidentsRes.data.incidents || []);
            } catch (err) {
                console.error('Failed to fetch simulation data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleJoin = async (simId) => {
        try {
            await api.post(`/simulations/${simId}/join`);
            toast.success('Joined simulation successfully!');
            const res = await api.get('/simulations');
            setSimulations(res.data.simulations);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to join');
        }
    };

    const handleSubmitResults = async (e) => {
        e.preventDefault();

        // Calculate dynamic score based on checked steps
        const totalSteps = completingSim.instructions?.length || 0;
        const completedSteps = Object.values(checkedSteps).filter(Boolean).length;
        const calculatedScore = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 100;

        try {
            await api.post(`/simulations/${completingSim._id}/results`, { score: calculatedScore, feedback });
            toast.success(`Drill completed with score: ${calculatedScore}%`);
            setCompletingSim(null);
            setCheckedSteps({});
            setFeedback('');
            const res = await api.get('/simulations');
            setSimulations(res.data.simulations);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit results');
        }
    };

    const handleAcknowledgeIncident = async (id) => {
        try {
            await api.put(`/incidents/${id}`, { status: 'In Progress' });
            toast.success('Incident acknowledged');
            setIncidents(prev => prev.map(inc => inc._id === id ? { ...inc, status: 'In Progress' } : inc));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to acknowledge incident');
        }
    };

    const handleCloseIncident = async (id) => {
        try {
            await api.put(`/incidents/${id}`, { status: 'Closed' });
            toast.success('Incident closed successfully');
            setIncidents(prev => prev.filter(inc => inc._id !== id));

            // Refresh AI warnings after closing an incident
            const warnRes = await api.get('/emergency-zones/ai/warnings');
            setWarnings(warnRes.data.warnings);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to close incident');
        }
    };

    const handleCreateZone = async (e) => {
        e.preventDefault();
        if (newZonePoints.length < 3) {
            toast.error('A zone must have at least 3 points');
            return;
        }
        try {
            const payload = {
                ...zoneForm,
                coordinates: newZonePoints,
                riskLevel: zoneForm.type === 'danger' ? 'High' : zoneForm.type === 'warning' ? 'Medium' : 'Low',
                riskScore: zoneForm.type === 'danger' ? 80 : zoneForm.type === 'warning' ? 50 : 10
            };
            const res = await api.post('/emergency-zones', payload);
            setZones(prev => [...prev, res.data.zone]);
            toast.success('Zone created successfully!');
            setShowZoneModal(false);
            setNewZonePoints([]);
            setIsDrawing(false);
            setZoneForm({ name: '', type: 'safe', description: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create zone');
        }
    };

    const handleAddInstruction = () => {
        setDrillForm(prev => ({
            ...prev,
            instructions: [...prev.instructions, { step: prev.instructions.length + 1, action: '', timeLimit: 60 }]
        }));
    };

    const handleInstructionChange = (index, field, value) => {
        const newInstructions = [...drillForm.instructions];
        newInstructions[index][field] = value;
        setDrillForm({ ...drillForm, instructions: newInstructions });
    };

    const handleRemoveInstruction = (index) => {
        const newInstructions = drillForm.instructions.filter((_, i) => i !== index).map((inst, i) => ({ ...inst, step: i + 1 }));
        setDrillForm({ ...drillForm, instructions: newInstructions });
    };

    const handleCreateDrillSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/simulations', drillForm);
            setSimulations(prev => [res.data.simulation, ...prev]);
            toast.success('Simulation drill created successfully!');
            setShowCreateDrillModal(false);
            setDrillForm({ title: '', type: 'Fire Drill', difficulty: 'Medium', description: '', scenario: '', duration: 30, instructions: [{ step: 1, action: '', timeLimit: 60 }] });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create drill');
        }
    };

    const handleViewOnMap = (zoneId) => {
        const zone = zones.find(z => z._id === zoneId);
        if (zone) {
            setSelectedZone(zone);
            setActiveTab('map');
        }
    };

    const handleIssueBroadcast = (warning) => {
        navigate('/notifications', {
            state: {
                prefill: {
                    title: `CRITICAL ALERT: ${warning.zoneName}`,
                    message: warning.message,
                    type: 'Alert'
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Simulations & Emergency Map</h1>
                    <p className="text-slate-400 mt-1">View emergency zones and participate in safety drills</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {['map', 'drills', 'warnings'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === tab ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        {tab === 'map' ? '🗺️ Emergency Map' : tab === 'drills' ? '🧪 Drill Simulations' : '⚠️ AI Warnings'}
                    </button>
                ))}
            </div>

            {/* Map Tab */}
            {activeTab === 'map' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 glass-card overflow-hidden" style={{ height: '500px' }}>
                        <MapContainer center={[28.6140, 77.2090]} zoom={16} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                            <MapClickHandler />
                            <MapController centerZone={selectedZone} />
                            <TileLayer
                                attribution='&copy; <a href="https://openstreetmap.org">OSM</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {isDrawing && newZonePoints.length > 0 && (
                                <Polygon
                                    positions={newZonePoints}
                                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.4, weight: 2, dashArray: '5, 5' }}
                                />
                            )}
                            {isDrawing && newZonePoints.map((pt, i) => (
                                <Marker key={`pt-${i}`} position={pt} icon={createCustomIcon('#3b82f6')} />
                            ))}
                            {zones.map(zone => (
                                <div key={zone._id}>
                                    <Polygon
                                        positions={zone.coordinates}
                                        pathOptions={{ color: zoneColors[zone.type], fillColor: zoneColors[zone.type], fillOpacity: 0.25, weight: 2 }}
                                        eventHandlers={{ click: () => setSelectedZone(zone) }}
                                    >
                                        <Popup>
                                            <div style={{ color: '#f8fafc', minWidth: 180 }}>
                                                <h4 style={{ fontWeight: 700, marginBottom: 4 }}>{zone.name}</h4>
                                                <p style={{ fontSize: 12 }}>Risk: <strong>{zone.riskLevel}</strong> {zone.riskScore ? `(Score: ${zone.riskScore})` : ''}</p>
                                                <p style={{ fontSize: 12, marginTop: 4 }}>{zone.description}</p>
                                            </div>
                                        </Popup>
                                    </Polygon>
                                    {zone.evacuationPoints?.map((ep, i) => (
                                        <Marker key={`ep-${i}`} position={ep.coordinates} icon={createCustomIcon('#3b82f6')}>
                                            <Popup>
                                                <div style={{ color: '#f8fafc' }}>
                                                    <strong>🚪 {ep.name}</strong><br />
                                                    <span style={{ fontSize: 12 }}>Capacity: {ep.capacity}</span>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                    {zone.shelters?.map((sh, i) => (
                                        <Marker key={`sh-${i}`} position={sh.coordinates} icon={createCustomIcon('#10b981')}>
                                            <Popup>
                                                <div style={{ color: '#f8fafc' }}>
                                                    <strong>🏥 {sh.name}</strong><br />
                                                    <span style={{ fontSize: 12 }}>{sh.type} • Capacity: {sh.capacity}</span><br />
                                                    <span style={{ fontSize: 12 }}>📞 {sh.contact}</span>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                </div>
                            ))}
                            {incidents.map(incident => (
                                incident.location?.coordinates && (incident.location.coordinates[0] !== 0 || incident.location.coordinates[1] !== 0) && (
                                    <Marker
                                        key={`inc-${incident._id}`}
                                        position={[incident.location.coordinates[1], incident.location.coordinates[0]]}
                                        icon={createCustomIcon('#f97316')}
                                    >
                                        <Popup>
                                            <div style={{ color: '#f8fafc', minWidth: '200px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <strong>🚨 {incident.title}</strong>
                                                    <span style={{ fontSize: 10, backgroundColor: '#334155', color: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>{incident.status}</span>
                                                </div>
                                                <span style={{ fontSize: 12 }}>Type: {incident.type} • Severity: {incident.severity}</span><br />
                                                <span style={{ fontSize: 11, color: '#94a3b8', display: 'block', marginTop: '2px' }}>
                                                    Reported by: {incident.reportedBy?.name || 'Unknown User'}
                                                </span>
                                                <span style={{ fontSize: 12, marginTop: '8px', display: 'block' }}>{incident.description}</span>

                                                {isAdmin && incident.status === 'Reported' && (
                                                    <button
                                                        onClick={() => handleAcknowledgeIncident(incident._id)}
                                                        style={{
                                                            marginTop: '10px', width: '100%', padding: '6px',
                                                            backgroundColor: '#3b82f6', color: 'white',
                                                            border: 'none', borderRadius: '4px', cursor: 'pointer',
                                                            fontSize: '12px', fontWeight: 'bold'
                                                        }}
                                                    >
                                                        Acknowledge
                                                    </button>
                                                )}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => handleCloseIncident(incident._id)}
                                                        style={{
                                                            marginTop: '10px', width: '100%', padding: '6px',
                                                            backgroundColor: '#ef4444', color: 'white',
                                                            border: 'none', borderRadius: '4px', cursor: 'pointer',
                                                            fontSize: '12px', fontWeight: 'bold'
                                                        }}
                                                    >
                                                        Mark as Closed
                                                    </button>
                                                )}
                                            </div>
                                        </Popup>
                                    </Marker>
                                )
                            ))}
                        </MapContainer>
                    </div>

                    {/* Zone Legend + Info */}
                    <div className="space-y-4">
                        <div className="glass-card p-4">
                            <h3 className="text-sm font-semibold text-white mb-3">Zone Legend</h3>
                            {Object.entries(zoneColors).map(([type, color]) => (
                                <div key={type} className="flex items-center gap-2 py-1.5">
                                    <div className="w-4 h-4 rounded" style={{ backgroundColor: color, opacity: 0.7 }} />
                                    <span className="text-sm text-slate-300">{zoneLabels[type]}</span>
                                </div>
                            ))}
                            <hr className="my-3 border-slate-700" />
                            <div className="flex items-center gap-2 py-1.5">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#3b82f6' }} />
                                <span className="text-sm text-slate-300">Evacuation Point</span>
                            </div>
                            <div className="flex items-center gap-2 py-1.5">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#10b981' }} />
                                <span className="text-sm text-slate-300">Shelter/Hospital</span>
                            </div>
                            <div className="flex items-center gap-2 py-1.5 border-t border-slate-700/50 mt-1 pt-2">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#f97316', border: '2px solid white' }} />
                                <span className="text-sm font-medium text-orange-400">Active Incident</span>
                            </div>
                        </div>

                        {selectedZone && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-4"
                            >
                                <h3 className="text-sm font-semibold text-white mb-2">{selectedZone.name}</h3>
                                <div className="space-y-2 text-xs text-slate-400">
                                    <p><span className="text-slate-300">Type:</span> <span className={`badge ${selectedZone.type === 'danger' ? 'badge-danger' : selectedZone.type === 'warning' ? 'badge-warning' : 'badge-success'}`}>{zoneLabels[selectedZone.type]}</span></p>
                                    <p><span className="text-slate-300">Risk Score:</span> {selectedZone.riskScore}/100</p>
                                    <div className="w-full bg-slate-700 rounded-full h-2 mt-1">
                                        <div className="h-2 rounded-full" style={{ width: `${selectedZone.riskScore}%`, backgroundColor: zoneColors[selectedZone.type] }} />
                                    </div>
                                    <p className="mt-2">{selectedZone.description}</p>
                                    <p><span className="text-slate-300">Evacuation Points:</span> {selectedZone.evacuationPoints?.length || 0}</p>
                                    <p><span className="text-slate-300">Shelters:</span> {selectedZone.shelters?.length || 0}</p>
                                </div>
                            </motion.div>
                        )}

                        <div className="glass-card p-4">
                            <h3 className="text-sm font-semibold text-white mb-2">Total Zones</h3>
                            <p className="text-3xl font-bold gradient-text">{zones.length}</p>
                            <p className="text-xs text-slate-400 mt-1">{zones.filter(z => z.type === 'danger').length} high risk</p>

                            {isAdmin && (
                                <div className="mt-6 pt-4 border-t border-slate-700/50">
                                    <h3 className="text-sm font-semibold text-white mb-3">Admin Controls</h3>
                                    {!isDrawing ? (
                                        <button onClick={() => { setIsDrawing(true); setNewZonePoints([]); }} className="w-full btn-primary text-sm py-2 flex items-center justify-center gap-2">
                                            <HiOutlinePlus className="w-4 h-4" /> Draw New Zone
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                                <p className="text-xs text-indigo-300">Click on the map to draw points. ({newZonePoints.length} points added)</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => { setIsDrawing(false); setNewZonePoints([]); }} className="flex-1 btn-secondary text-xs py-2">
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (newZonePoints.length < 3) toast.error('Need at least 3 points');
                                                        else setShowZoneModal(true);
                                                    }}
                                                    className="flex-1 btn-primary text-xs py-2"
                                                >
                                                    Finish Zone
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Drills Tab */}
            {activeTab === 'drills' && (
                <div className="space-y-4">
                    {isAdmin && (
                        <div className="flex justify-end">
                            <button onClick={() => setShowCreateDrillModal(true)} className="btn-primary flex items-center gap-2 text-sm py-2 px-4 w-auto">
                                <HiOutlinePlus className="w-5 h-5" /> Create New Drill
                            </button>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {simulations.length === 0 ? (
                            <div className="col-span-full glass-card p-8 text-center text-slate-400">
                                No drills created yet. Start by creating a new drill.
                            </div>
                        ) : simulations.map((sim, i) => (
                            <motion.div
                                key={sim._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-5"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{simTypeIcons[sim.type] || '🧪'}</span>
                                        <div>
                                            <h3 className="text-base font-semibold text-white">{sim.title}</h3>
                                            <p className="text-xs text-slate-400">{sim.type} • {sim.difficulty}</p>
                                        </div>
                                    </div>
                                    <span className={`badge ${sim.status === 'Completed' ? 'badge-success' : sim.status === 'Active' ? 'badge-warning' : 'badge-info'}`}>
                                        {sim.status}
                                    </span>
                                </div>

                                <p className="text-sm text-slate-400 mb-3 line-clamp-2">{sim.description}</p>

                                {sim.scenario && (
                                    <div className="bg-slate-800/50 rounded-lg p-3 mb-3 border border-slate-700">
                                        <p className="text-xs text-slate-400 font-medium mb-1">📋 Scenario</p>
                                        <p className="text-xs text-slate-300 line-clamp-3">{sim.scenario}</p>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                                    <span>⏱️ {sim.duration} min</span>
                                    <span>👥 {sim.participants?.length || 0} participants</span>
                                    {sim.results?.avgScore > 0 && <span>📊 Avg: {sim.results.avgScore}%</span>}
                                    {sim.scheduledDate && <span>📅 {new Date(sim.scheduledDate).toLocaleDateString()}</span>}
                                </div>

                                {sim.results?.aiDifficultySuggestion && (
                                    <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-2 mb-3">
                                        <p className="text-xs text-indigo-300">🤖 AI: {sim.results.aiDifficultySuggestion}</p>
                                    </div>
                                )}

                                {(() => {
                                    const joinedParticipant = sim.participants?.find(p => p.user === user?._id || p.user?._id === user?._id);
                                    return (
                                        <div className="flex gap-2 pt-3 border-t border-slate-700">
                                            {sim.status === 'Scheduled' || sim.status === 'Active' ? (
                                                joinedParticipant ? (
                                                    joinedParticipant.completed ? (
                                                        <button disabled className="btn-secondary opacity-70 cursor-not-allowed text-xs py-2 flex-1 justify-center border-emerald-500/30 text-emerald-400">
                                                            <HiOutlineCheckCircle className="w-4 h-4" /> Results Submitted ({joinedParticipant.score}%)
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => { setCompletingSim(sim); setCheckedSteps({}); }} className="btn-secondary text-xs py-2 flex-1 justify-center border-indigo-500/30 text-indigo-300 hover:bg-slate-800">
                                                            <HiOutlineCheckCircle className="w-4 h-4" /> Complete Drill
                                                        </button>
                                                    )
                                                ) : (
                                                    <button onClick={() => handleJoin(sim._id)} className="btn-primary text-xs py-2 flex-1 justify-center">
                                                        <HiOutlinePlay className="w-4 h-4" /> Join Drill
                                                    </button>
                                                )
                                            ) : (
                                                <button className="btn-secondary text-xs py-2 flex-1 justify-center">View Results</button>
                                            )}
                                        </div>
                                    );
                                })()}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Warnings Tab */}
            {activeTab === 'warnings' && (
                <div className="space-y-4">
                    {warnings.length === 0 ? (
                        <div className="glass-card p-8 text-center">
                            <span className="text-4xl">✅</span>
                            <p className="text-white font-semibold mt-3">No Active Warnings</p>
                            <p className="text-slate-400 text-sm mt-1">All zones are within safe parameters</p>
                        </div>
                    ) : (
                        warnings.map((warning, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`glass-card p-5 border-l-4 ${warning.level === 'CRITICAL' ? 'border-l-red-500' :
                                    warning.level === 'WARNING' ? 'border-l-amber-500' : 'border-l-blue-500'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${warning.level === 'CRITICAL' ? 'bg-red-500/20' :
                                        warning.level === 'WARNING' ? 'bg-amber-500/20' : 'bg-blue-500/20'
                                        }`}>
                                        <HiOutlineExclamation className={`w-5 h-5 ${warning.level === 'CRITICAL' ? 'text-red-400' :
                                            warning.level === 'WARNING' ? 'text-amber-400' : 'text-blue-400'
                                            }`} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`badge ${warning.level === 'CRITICAL' ? 'badge-danger' :
                                                warning.level === 'WARNING' ? 'badge-warning' : 'badge-info'
                                                }`}>{warning.level}</span>
                                            <span className="text-sm font-semibold text-white">{warning.zoneName}</span>
                                        </div>
                                        <p className="text-sm text-slate-400">{warning.message}</p>
                                        <p className="text-xs text-slate-500 mt-1 mb-3">Risk Score: {warning.riskScore}/100</p>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewOnMap(warning.zoneId)}
                                                className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 hover:bg-slate-700 w-auto"
                                            >
                                                <HiOutlineLocationMarker className="w-4 h-4" /> View on Map
                                            </button>

                                            {isAdmin && (warning.level === 'CRITICAL' || warning.level === 'WARNING') && (
                                                <button
                                                    onClick={() => handleIssueBroadcast(warning)}
                                                    className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5 w-auto"
                                                >
                                                    <HiOutlineLightningBolt className="w-4 h-4" /> Issue Broadcast
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            )}
            {/* Complete Drill Modal */}
            {completingSim && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                    >
                        <div className="p-6">
                            <h2 className="text-xl font-bold text-white mb-2">Complete Drill</h2>
                            <p className="text-sm text-slate-400 mb-6">{completingSim.title}</p>

                            <form onSubmit={handleSubmitResults} className="space-y-4">
                                {completingSim.instructions && completingSim.instructions.length > 0 ? (
                                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        <p className="text-xs font-semibold text-indigo-400 mb-2 uppercase tracking-wider">Action Checklist</p>
                                        {completingSim.instructions.map((inst, index) => (
                                            <div key={index} className="flex items-start gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                                <input
                                                    type="checkbox"
                                                    id={`step-${index}`}
                                                    checked={checkedSteps[index] || false}
                                                    onChange={(e) => setCheckedSteps({ ...checkedSteps, [index]: e.target.checked })}
                                                    className="mt-1 w-4 h-4 rounded text-indigo-500 bg-slate-900 border-slate-600 focus:ring-indigo-500"
                                                />
                                                <label htmlFor={`step-${index}`} className={`text-sm ${checkedSteps[index] ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                                                    {inst.action}
                                                    {inst.timeLimit && <span className="block text-xs text-slate-500 mt-0.5">⏱ Target: {inst.timeLimit}s</span>}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-sm">
                                        No checklist available. Standard completion applies.
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Feedback / Notes</label>
                                    <textarea
                                        required
                                        rows="2"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Did you encounter any issues during the drill?"
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                    ></textarea>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-slate-700">
                                    <button type="button" onClick={() => { setCompletingSim(null); setCheckedSteps({}); }} className="btn-secondary flex-1 py-2 text-sm">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary flex-1 py-2 text-sm">
                                        Submit Checklist
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* Create Zone Modal */}
            {showZoneModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                    >
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Save New Zone</h2>
                                <button onClick={() => setShowZoneModal(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                                    <HiOutlineX className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateZone} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Zone Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={zoneForm.name}
                                        onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="e.g. North Wing Evacuation Route"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Zone Type</label>
                                    <select
                                        value={zoneForm.type}
                                        onChange={(e) => setZoneForm({ ...zoneForm, type: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="safe">Safe Zone (Green)</option>
                                        <option value="warning">Medium Risk (Yellow)</option>
                                        <option value="danger">High Risk (Red)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                                    <textarea
                                        required
                                        rows="2"
                                        value={zoneForm.description}
                                        onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        placeholder="Describe the purpose of this zone..."
                                    ></textarea>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={() => setShowZoneModal(false)} className="btn-secondary flex-1 py-2">
                                        Back to Map
                                    </button>
                                    <button type="submit" className="btn-primary flex-1 py-2">
                                        Save Zone
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Create Drill Modal */}
            {showCreateDrillModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Create New Drill Simulation</h2>
                                <button onClick={() => setShowCreateDrillModal(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors">
                                    <HiOutlineX className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateDrillSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Drill Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={drillForm.title}
                                            onChange={(e) => setDrillForm({ ...drillForm, title: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                            placeholder="e.g. Science Lab Fire Drill"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Drill Type</label>
                                        <select
                                            value={drillForm.type}
                                            onChange={(e) => setDrillForm({ ...drillForm, type: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value="Fire Drill">Fire Drill</option>
                                            <option value="Earthquake Drill">Earthquake Drill</option>
                                            <option value="Flood Scenario">Flood Scenario</option>
                                            <option value="Health Emergency">Health Emergency</option>
                                            <option value="Active Threat">Active Threat</option>
                                            <option value="Chemical Spill">Chemical Spill</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Difficulty</label>
                                        <select
                                            value={drillForm.difficulty}
                                            onChange={(e) => setDrillForm({ ...drillForm, difficulty: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        >
                                            <option value="Easy">Easy</option>
                                            <option value="Medium">Medium</option>
                                            <option value="Hard">Hard</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-1">Duration (minutes)</label>
                                        <input
                                            type="number"
                                            min="5"
                                            required
                                            value={drillForm.duration}
                                            onChange={(e) => setDrillForm({ ...drillForm, duration: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                                    <textarea
                                        required
                                        rows="2"
                                        value={drillForm.description}
                                        onChange={(e) => setDrillForm({ ...drillForm, description: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        placeholder="General description of the drill..."
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Scenario Background</label>
                                    <textarea
                                        required
                                        rows="2"
                                        value={drillForm.scenario}
                                        onChange={(e) => setDrillForm({ ...drillForm, scenario: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                        placeholder="What is the setup or emergency context?..."
                                    ></textarea>
                                </div>

                                <hr className="border-slate-700 my-4" />

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-semibold text-white">Dynamic Instructions Checklist</h3>
                                        <button type="button" onClick={handleAddInstruction} className="text-indigo-400 hover:text-indigo-300 text-xs flex items-center gap-1 font-medium bg-indigo-500/10 px-2 py-1 rounded">
                                            <HiOutlinePlus className="w-3 h-3" /> Add Step
                                        </button>
                                    </div>

                                    {drillForm.instructions.map((inst, index) => (
                                        <div key={index} className="flex gap-2 items-start bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
                                            <div className="pt-2 text-slate-500 text-xs font-bold w-4">{inst.step}.</div>
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="text"
                                                    required
                                                    value={inst.action}
                                                    onChange={(e) => handleInstructionChange(index, 'action', e.target.value)}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded pl-2 pr-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                                    placeholder="Action required (e.g. Drop to the floor)"
                                                />
                                            </div>
                                            <div className="w-24">
                                                <input
                                                    type="number"
                                                    required
                                                    min="5"
                                                    value={inst.timeLimit}
                                                    onChange={(e) => handleInstructionChange(index, 'timeLimit', e.target.value)}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-sm text-white focus:ring-1 focus:ring-indigo-500 outline-none"
                                                    placeholder="Time (sec)"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveInstruction(index)}
                                                disabled={drillForm.instructions.length === 1}
                                                className={`p-1.5 rounded-lg mt-0.5 ${drillForm.instructions.length === 1 ? 'text-slate-600' : 'text-red-400 hover:bg-red-500/10'}`}
                                            >
                                                <HiOutlineX className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-slate-700 mt-6">
                                    <button type="button" onClick={() => setShowCreateDrillModal(false)} className="btn-secondary flex-1 py-2">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-primary flex-1 py-2">
                                        Publish Drill
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );

}
