import React, { useState, useCallback } from 'react';
import { CircularProgress, Tooltip } from '@mui/material';
import { Sparkles, ChevronDown, ChevronUp, AlertCircle, Stethoscope, ClipboardList, Lightbulb } from 'lucide-react';
import { API_URL } from '../config';

// ─── Utility: derive Flask ML URL from the Node API URL ─────────────────────
// If API_URL is http://localhost:5000, Flask is typically on 5001.
// If it's a deployed URL we append the /predict-diagnosis path to a known Flask base.
const getFlaskUrl = () => {
  try {
    const url = new URL(API_URL);
    // Local dev: swap port
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      url.port = '5001';
      return url.origin + '/predict-diagnosis';
    }
    // Deployed: try a common pattern like replacing "api" subdomain or appending the flask port
    // Fall back to a sibling path convention — adjust if your deployment differs
    return API_URL.replace(/:\d+/, ':5001') + '/predict-diagnosis';
  } catch {
    return 'http://localhost:5001/predict-diagnosis';
  }
};

const FLASK_DIAGNOSIS_URL = getFlaskUrl();

// Severity colour palette
const SPECIALTY_COLORS = [
  { bg: '#eff6ff', border: '#93c5fd', text: '#1d4ed8' },
  { bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
  { bg: '#faf5ff', border: '#c4b5fd', text: '#7c3aed' },
  { bg: '#fff7ed', border: '#fdba74', text: '#c2410c' },
];

const AIDiagnosisAssistant = ({ symptoms, onDiagnosisSelect }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(true);

  const runAnalysis = useCallback(async () => {
    if (!symptoms?.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(FLASK_DIAGNOSIS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
      setExpanded(true);
    } catch (err) {
      console.error(err);
      setError('AI assistant unavailable. Please ensure the Flask server is running.');
    } finally {
      setLoading(false);
    }
  }, [symptoms]);

  return (
    <div style={{
      borderRadius: 14,
      border: '1.5px solid #818cf8',
      background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 100%)',
      overflow: 'hidden',
      marginBottom: 16,
      boxShadow: '0 2px 12px rgba(99,102,241,0.08)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        background: 'linear-gradient(90deg,#4f46e5,#7c3aed)',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} />
          <span style={{ fontWeight: 700, fontSize: 14 }}>AI Diagnosis Assistant</span>
          <span style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: 999,
            padding: '1px 8px',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: 1,
          }}>BETA</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Tooltip title="Analyse symptoms with AI" arrow>
            <button
              onClick={runAnalysis}
              disabled={loading || !symptoms?.trim()}
              style={{
                background: loading || !symptoms?.trim() ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.25)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: 8,
                padding: '5px 14px',
                fontSize: 12,
                fontWeight: 700,
                cursor: loading || !symptoms?.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all .2s',
              }}
            >
              {loading
                ? <><CircularProgress size={12} sx={{ color: '#fff' }} /> Analysing…</>
                : <><Sparkles size={13} /> Analyse</>
              }
            </button>
          </Tooltip>
          {result && (
            <button onClick={() => setExpanded(v => !v)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex' }}>
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Idle / hint */}
      {!result && !loading && !error && (
        <div style={{ padding: '10px 18px', fontSize: 12, color: '#6366f1', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Lightbulb size={14} />
          Enter patient symptoms above, then click <strong>Analyse</strong> to see AI-powered diagnosis suggestions.
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '10px 18px', fontSize: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Results */}
      {result && expanded && (
        <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Matched Specialties */}
          {result.matched_specialties?.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Stethoscope size={14} color="#4f46e5" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5' }}>Suggested Specialties</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.matched_specialties.map((s, i) => {
                  const c = SPECIALTY_COLORS[i % SPECIALTY_COLORS.length];
                  return (
                    <span key={s.name} style={{
                      background: c.bg,
                      border: `1px solid ${c.border}`,
                      color: c.text,
                      borderRadius: 999,
                      padding: '4px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 5,
                    }}>
                      {s.name}
                      <span style={{ background: c.border, color: c.text, borderRadius: 999, padding: '0 5px', fontSize: 10, fontWeight: 800 }}>
                        {s.score}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Possible Conditions */}
          {result.possible_conditions?.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <ClipboardList size={14} color="#7c3aed" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#7c3aed' }}>Possible Conditions</span>
                <span style={{ fontSize: 10, color: '#9ca3af', fontStyle: 'italic' }}>— click to use as diagnosis</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                {result.possible_conditions.map(cond => (
                  <button
                    key={cond}
                    onClick={() => onDiagnosisSelect && onDiagnosisSelect(cond)}
                    style={{
                      background: '#faf5ff',
                      border: '1px solid #c4b5fd',
                      color: '#7c3aed',
                      borderRadius: 8,
                      padding: '4px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all .15s',
                    }}
                    onMouseEnter={e => { e.target.style.background = '#7c3aed'; e.target.style.color = '#fff'; }}
                    onMouseLeave={e => { e.target.style.background = '#faf5ff'; e.target.style.color = '#7c3aed'; }}
                  >
                    + {cond}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clinical Recommendations */}
          {result.recommendations?.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Lightbulb size={14} color="#b45309" />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#b45309' }}>Clinical Guidance</span>
              </div>
              {result.recommendations.map((r, i) => (
                <div key={i} style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  borderRadius: 8,
                  padding: '8px 12px',
                  marginBottom: 6,
                  fontSize: 12,
                  color: '#92400e',
                }}>
                  <span style={{ fontWeight: 700 }}>{r.specialty}: </span>{r.note}
                </div>
              ))}
            </div>
          )}

          {result.message && (
            <div style={{ fontSize: 12, color: '#6b7280', fontStyle: 'italic', paddingTop: 4 }}>
              ⚠️ {result.message}
            </div>
          )}

          <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 4, borderTop: '1px solid #e5e7eb', paddingTop: 8 }}>
            ⚕️ AI suggestions are for reference only and should not replace clinical judgment.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIDiagnosisAssistant;
