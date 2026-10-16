export default function Welcome({ onStart }) {
  return (
    <div className="animate-in" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.5rem', textAlign: 'center', maxWidth: 520, margin: '0 auto',
    }}>
      <h1 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(2.4rem, 7vw, 3.6rem)',
        lineHeight: 1.08, color: 'var(--ink)', marginBottom: '1.25rem',
      }}>
        You're not lost.<br />
        You just have<br />
        <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>too many options.</em>
      </h1>

      <p style={{
        fontSize: '1rem', color: 'var(--ink-light)', lineHeight: 1.6,
        marginBottom: '2.5rem', maxWidth: 380,
      }}>
        Find the non-clinical roles that fit how you actually like to work.
      </p>

      <button
        onClick={onStart}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '16px 40px', borderRadius: '50px',
          background: 'var(--accent)', color: '#fff', border: 'none',
          fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(46,92,78,0.22)',
          transition: 'all 0.18s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#234A3E'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        Find my roles
      </button>

      <p style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: '1.5rem' }}>
        7 minutes · 14 questions
      </p>
    </div>
  );
}
