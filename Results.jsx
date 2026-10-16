import { useState } from 'react';

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '0.65rem', letterSpacing: '0.12em', fontWeight: 700,
      color: 'var(--ink-muted)', marginBottom: '0.5rem', marginTop: '1.25rem',
    }}>
      {children}
    </div>
  );
}

// ── Dimension bars ────────────────────────────────────────
function DimBars({ dimensions }) {
  const display = [
    { key: 'problemSolving', label: 'Problem Solver' },
    { key: 'people',         label: 'People Person' },
    { key: 'research',       label: 'Researcher' },
    { key: 'technology',     label: 'Tech Curious' },
    { key: 'creativity',     label: 'Creative' },
    { key: 'writing',        label: 'Writer' },
    { key: 'data',           label: 'Analyst' },
    { key: 'organisation',   label: 'Organiser' },
  ];
  return (
    <div style={{ margin: '1rem 0 0' }}>
      {display.map(d => (
        <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--ink)', width: 110, flexShrink: 0 }}>{d.label}</div>
          <div style={{ flex: 1, height: 4, background: 'var(--cream-dark)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${dimensions[d.key] || 0}%`,
              background: 'var(--accent)', borderRadius: 99,
              transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Role Card ─────────────────────────────────────────────
function RoleCard({ result, rank }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="animate-in" style={{
      background: '#fff',
      border: `1.5px solid ${rank === 1 ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 'var(--radius)',
      padding: '1.5rem',
      marginBottom: '1rem',
    }}>
      {/* Rank + cluster */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
        <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', fontWeight: 700, color: rank === 1 ? 'var(--accent)' : 'var(--ink-muted)' }}>
          {rank === 1 ? 'TOP MATCH' : `NO. ${rank}`}
        </div>
        <span style={{
          fontSize: '0.65rem', letterSpacing: '0.1em', fontWeight: 600,
          background: 'var(--cream-dark)', color: 'var(--ink-light)',
          padding: '3px 10px', borderRadius: 20,
        }}>
          {result.cluster}
        </span>
      </div>

      {/* Name + score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.3rem,3vw,1.55rem)', color: 'var(--ink)', lineHeight: 1.2 }}>
          {result.roleName}
        </h3>
        <div style={{ flexShrink: 0, marginLeft: 12, textAlign: 'right' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--accent)' }}>
            {result.score}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>/100</span>
        </div>
      </div>

      {/* Why it fits */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {result.whyItFits.map((s, i) => (
          <li key={i} style={{
            fontSize: '0.88rem', color: 'var(--ink)', lineHeight: 1.5,
            paddingLeft: '1.1rem', position: 'relative',
          }}>
            <span style={{ position: 'absolute', left: 0, color: 'var(--accent)', fontWeight: 700, fontSize: '0.8rem', top: 2 }}>+</span>
            {s}
          </li>
        ))}
      </ul>

      {/* Watch outs */}
      {result.watchOuts?.length > 0 && (
        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {result.watchOuts.map((s, i) => (
            <div key={i} style={{
              fontSize: '0.84rem', color: 'var(--ink-light)', lineHeight: 1.5,
              paddingLeft: '1.1rem', position: 'relative',
            }}>
              <span style={{ position: 'absolute', left: 0, color: 'var(--ink-muted)' }}>—</span>
              {s}
            </div>
          ))}
        </div>
      )}

      {/* Advantage + Gap — single line each */}
      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: '0.84rem', color: 'var(--ink)', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600 }}>Advantage: </span>{result.transferableAdvantages[0]}
        </div>
        <div style={{ fontSize: '0.84rem', color: 'var(--ink)', lineHeight: 1.5 }}>
          <span style={{ fontWeight: 600 }}>Gap: </span>{result.biggestSkillGaps[0]}
        </div>
      </div>

      {/* Entry titles */}
      <SectionLabel>START HERE</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {result.jobTitles.map((t, i) => (
          <span key={i} style={{
            fontSize: '0.8rem', padding: '5px 12px', borderRadius: 20,
            background: 'var(--accent-light)', color: 'var(--accent)',
            border: '1px solid rgba(46,92,78,0.15)', fontWeight: 500,
          }}>{t}</span>
        ))}
      </div>

      {/* Roadmap toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        style={{
          width: '100%', marginTop: '1.25rem', padding: '10px 18px',
          background: 'transparent', border: '1.5px solid var(--border)',
          borderRadius: '50px', fontFamily: 'var(--font-body)', fontWeight: 500,
          fontSize: '0.84rem', color: 'var(--ink-light)', cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--cream-dark)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      >
        {expanded ? 'Hide 90-day plan' : '90-day game plan'}
      </button>

      {expanded && (
        <div className="animate-in" style={{ marginTop: '1rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 10,
          }}>
            {[
              { num: '01', name: 'Explore', days: 'Days 0–30',  steps: result.roadmap.days0to30 },
              { num: '02', name: 'Build',   days: 'Days 31–60', steps: result.roadmap.days31to60 },
              { num: '03', name: 'Apply',   days: 'Days 61–90', steps: result.roadmap.days61to90 },
            ].map(phase => (
              <div key={phase.num} style={{
                background: 'var(--cream)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)', padding: '1rem',
              }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--ink)', marginBottom: '0.15rem' }}>{phase.name}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--ink-muted)', marginBottom: '0.6rem' }}>{phase.days}</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {phase.steps.map((s, i) => (
                    <li key={i} style={{
                      fontSize: '0.78rem', color: 'var(--ink-light)', lineHeight: 1.45,
                      paddingLeft: '0.85rem', position: 'relative',
                    }}>
                      <span style={{ position: 'absolute', left: 0, color: 'var(--accent-mid)' }}>·</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{
            background: 'var(--cream-dark)', borderRadius: 'var(--radius-sm)',
            padding: '1rem', marginTop: '0.75rem',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '0.65rem', letterSpacing: '0.1em', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.4rem' }}>
              TRY THIS FIRST
            </div>
            <p style={{ fontSize: '0.84rem', color: 'var(--ink-light)', lineHeight: 1.6 }}>
              {result.experiment}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Results screen ───────────────────────────────────
export default function Results({ result, onRestart, email }) {
  const { top3, archetype, dimensions } = result;
  const [restartConfirm, setRestartConfirm] = useState(false);

  const archetypeLabel = archetype.secondary
    ? `${archetype.primary.name} + ${archetype.secondary.name}`
    : archetype.primary.name;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>

      {/* Header */}
      <div className="animate-in" style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.12em', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.6rem' }}>
          YOUR RESULTS
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.9rem, 5vw, 2.8rem)',
          lineHeight: 1.15, color: 'var(--ink)',
        }}>
          {top3[0]?.roleName} is your strongest fit.
        </h1>
      </div>

      {/* Work style */}
      <div className="animate-in" style={{
        background: '#fff', border: '1.5px solid var(--border)',
        borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1.75rem',
      }}>
        <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', fontWeight: 700, color: 'var(--ink-muted)', marginBottom: '0.4rem' }}>
          YOUR WORK STYLE
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--accent)', marginBottom: '0.3rem' }}>
          The {archetypeLabel}
        </div>
        <p style={{ fontSize: '0.88rem', color: 'var(--ink-light)', lineHeight: 1.6 }}>
          {archetype.primary.copy}
        </p>
        <DimBars dimensions={dimensions} />
      </div>

      {/* Role cards — immediately after work style */}
      {top3.map((r, i) => <RoleCard key={r.roleId} result={r} rank={i + 1} />)}

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />

      {/* Restart */}
      <div style={{ textAlign: 'center' }}>
        {!restartConfirm ? (
          <button
            onClick={() => setRestartConfirm(true)}
            style={{
              background: 'transparent', border: '1.5px solid var(--border-strong)',
              color: 'var(--ink-light)', padding: '11px 28px', borderRadius: '50px',
              fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.88rem',
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--cream-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Start over
          </button>
        ) : (
          <div>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-light)', marginBottom: 12 }}>
              Your results will be cleared.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={onRestart}
                style={{
                  background: 'var(--accent)', color: '#fff', border: 'none',
                  padding: '9px 22px', borderRadius: '50px',
                  fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                }}
              >
                Yes, restart
              </button>
              <button
                onClick={() => setRestartConfirm(false)}
                style={{
                  background: 'transparent', border: '1.5px solid var(--border-strong)',
                  color: 'var(--ink-light)', padding: '9px 22px', borderRadius: '50px',
                  fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer',
                }}
              >
                Keep results
              </button>
            </div>
          </div>
        )}
        <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginTop: '1.5rem' }}>
          Results are based on your answers, not a scientific test.
        </p>

        {/* Visible watermark — makes a forwarded screenshot traceable. */}
        {(email || result?.watermark?.email) && (
          <p style={{
            fontSize: '0.68rem', color: 'var(--ink-muted)',
            marginTop: '0.75rem', opacity: 0.75, wordBreak: 'break-all',
          }}>
            Licensed to {email || result.watermark.email} · Personal use only · Not for redistribution
          </p>
        )}
      </div>
    </div>
  );
}
