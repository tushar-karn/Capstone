/**
 * AI Engine - Rule-based intelligence for Campus Safety Hub
 * ML-ready architecture: each function can be swapped with ML model calls
 */

// Calculate risk score for a zone based on incident history & zone properties
function calculateRiskScore(zone, incidents = []) {
  let score = 0;
  
  // Factor 0: Base risk from zone type
  if (zone.type === 'danger') score += 40;
  else if (zone.type === 'warning') score += 20;

  const zoneIncidents = incidents.filter(inc => {
    if (!inc.location || !inc.location.coordinates) return false;
    const [lng, lat] = inc.location.coordinates;
    return isPointInZone(lat, lng, zone.coordinates);
  });

  // Factor 1: Incident count (max 20)
  score += Math.min(zoneIncidents.length * 10, 20);

  // Factor 2: Severity of incidents (max 20)
  const severityMap = { 'Critical': 20, 'High': 15, 'Medium': 10, 'Low': 5 };
  const avgSeverity = zoneIncidents.length > 0
    ? zoneIncidents.reduce((sum, inc) => sum + (severityMap[inc.severity] || 10), 0) / zoneIncidents.length
    : 0;
  score += avgSeverity;

  // Factor 3: Recency (max 20) - more recent incidents increase risk
  const recentIncidents = zoneIncidents.filter(inc => {
    const daysSince = (Date.now() - new Date(inc.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSince <= 14;
  });
  score += Math.min(recentIncidents.length * 10, 20);

  return Math.min(Math.round(score), 100);
}

// Simple point-in-polygon test
function isPointInZone(lat, lng, polygon) {
  if (!polygon || polygon.length < 3) return false;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Generate early warning alerts based on risk thresholds
function generateEarlyWarnings(zones) {
  const warnings = [];
  for (const zone of zones) {
    if (zone.riskScore >= 80) {
      warnings.push({
        zoneId: zone._id,
        zoneName: zone.name,
        level: 'CRITICAL',
        message: `Critical risk level detected in ${zone.name}. Immediate action required.`,
        riskScore: zone.riskScore
      });
    } else if (zone.riskScore >= 60) {
      warnings.push({
        zoneId: zone._id,
        zoneName: zone.name,
        level: 'WARNING',
        message: `Elevated risk in ${zone.name}. Monitor closely.`,
        riskScore: zone.riskScore
      });
    } else if (zone.riskScore >= 40) {
      warnings.push({
        zoneId: zone._id,
        zoneName: zone.name,
        level: 'ADVISORY',
        message: `Moderate risk in ${zone.name}. Stay alert.`,
        riskScore: zone.riskScore
      });
    }
  }
  return warnings.sort((a, b) => b.riskScore - a.riskScore);
}

// Evaluate simulation performance and suggest difficulty adjustments
function evaluateSimulationPerformance(participants) {
  if (!participants || participants.length === 0) {
    return { avgScore: 0, completionRate: 0, suggestion: 'No data available' };
  }

  const completed = participants.filter(p => p.completed);
  const avgScore = participants.reduce((sum, p) => sum + (p.score || 0), 0) / participants.length;
  const completionRate = (completed.length / participants.length) * 100;

  let suggestion;
  if (avgScore >= 85 && completionRate >= 90) {
    suggestion = 'Increase difficulty - participants are excelling';
  } else if (avgScore >= 70 && completionRate >= 75) {
    suggestion = 'Current difficulty is appropriate';
  } else if (avgScore >= 50) {
    suggestion = 'Consider providing additional training before next drill';
  } else {
    suggestion = 'Decrease difficulty - participants are struggling';
  }

  return {
    avgScore: Math.round(avgScore),
    completionRate: Math.round(completionRate),
    totalParticipants: participants.length,
    suggestion
  };
}

// Predict incident trends using moving average
function predictIncidentTrends(monthlyData) {
  if (!monthlyData || monthlyData.length < 3) {
    return { trend: 'insufficient_data', prediction: null };
  }

  const values = monthlyData.map(d => d.count || 0);
  const windowSize = 3;
  const movingAvg = [];

  for (let i = windowSize - 1; i < values.length; i++) {
    const window = values.slice(i - windowSize + 1, i + 1);
    movingAvg.push(window.reduce((a, b) => a + b, 0) / windowSize);
  }

  // Calculate trend direction
  const recentTrend = movingAvg.length >= 2
    ? movingAvg[movingAvg.length - 1] - movingAvg[movingAvg.length - 2]
    : 0;

  // Predict next period
  const lastAvg = movingAvg[movingAvg.length - 1];
  const prediction = Math.max(0, Math.round(lastAvg + recentTrend));

  let trend;
  if (recentTrend > 1) trend = 'increasing';
  else if (recentTrend < -1) trend = 'decreasing';
  else trend = 'stable';

  return {
    trend,
    prediction,
    movingAverages: movingAvg.map(v => Math.round(v)),
    confidence: values.length >= 6 ? 'high' : 'moderate'
  };
}

module.exports = {
  calculateRiskScore,
  generateEarlyWarnings,
  evaluateSimulationPerformance,
  predictIncidentTrends
};
