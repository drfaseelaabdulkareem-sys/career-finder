import { useEffect } from 'react';

export default function Transition({ onDone, ready = true }) {
  // Hold the screen until the server has returned results, but always
  // show it for a beat so it doesn't flash past.
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(onDone, 1400);
    return () => clearTimeout(t);
  }, [onDone, ready]);

  return (
    <div className="animate-in" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.5rem', textAlign: 'center',
    }}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
        color: 'var(--ink)', marginBottom: '1rem', lineHeight: 1.3, maxWidth: 420,
      }}>
        Alright. We have enough evidence.
      </h2>
      <p style={{ fontSize: '1rem', color: 'var(--ink-muted)', marginBottom: '2rem' }}>
        Time to see what your career options are saying.
      </p>
      <div style={{
        width: 36, height: 36,
        border: '3px solid var(--accent-light)',
        borderTop: '3px solid var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );
}
