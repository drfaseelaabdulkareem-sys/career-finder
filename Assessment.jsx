import { useState } from 'react';

function OptionCard({ opt, selected, onToggle, multi }) {
  return (
    <div
      role={multi ? 'checkbox' : 'radio'}
      aria-checked={selected}
      tabIndex={0}
      onClick={() => onToggle(opt)}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(opt); } }}
      style={{
        padding: '14px 18px',
        border: `1.5px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
        background: selected ? 'var(--accent-light)' : '#fff',
        display: 'flex', alignItems: 'flex-start', gap: 12,
        textAlign: 'left',
        boxShadow: selected ? '0 0 0 1px var(--accent)' : 'none',
        transition: 'all 0.15s ease',
        outline: 'none',
      }}
      onFocus={e => e.currentTarget.style.boxShadow = selected ? '0 0 0 1px var(--accent)' : '0 0 0 3px rgba(46,92,78,0.2)'}
      onBlur={e => e.currentTarget.style.boxShadow = selected ? '0 0 0 1px var(--accent)' : 'none'}
    >
      <div style={{
        width: 20, height: 20, flexShrink: 0, marginTop: 2,
        borderRadius: multi ? 5 : '50%',
        border: `2px solid ${selected ? 'var(--accent)' : 'var(--border-strong)'}`,
        background: selected ? 'var(--accent)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.15s ease',
      }}>
        {selected && (
          multi
            ? <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
        )}
      </div>
      <div>
        <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--ink)', lineHeight: 1.4 }}>
          {opt.label}
        </div>
        {opt.description && (
          <div style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginTop: 2, lineHeight: 1.4 }}>
            {opt.description}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Assessment({ questions, currentQ, setCurrentQ, answers, onAnswer, onFinish, error }) {
  const QUESTIONS   = Array.isArray(questions) ? questions : [];
  const question    = QUESTIONS[currentQ];

  // Defensive: the question bank arrives over the network, so never
  // assume an index exists.
  if (!question) return null;

  const total       = QUESTIONS.length;
  const pct         = Math.round((currentQ / total) * 100);
  const selected    = answers[question.id] || [];
  const isMulti     = question.type === 'multi-select';
  const canContinue = selected.length > 0;

  function toggle(opt) {
    if (isMulti) {
      const already = selected.find(s => s.id === opt.id);
      if (already) {
        onAnswer(question.id, selected.filter(s => s.id !== opt.id));
      } else {
        if (selected.length >= (question.maxSelections || 10)) return;
        onAnswer(question.id, [...selected, opt]);
      }
    } else {
      onAnswer(question.id, [opt]);
    }
  }

  function handleContinue() {
    if (!canContinue) return;
    if (currentQ < total - 1) {
      setCurrentQ(currentQ + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onFinish(answers);
    }
  }

  function handleBack() {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div>
      {/* Progress */}
      <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', padding: '1.5rem 1.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', fontWeight: 600, color: 'var(--accent)' }}>
            {question.section}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink-light)', fontWeight: 500 }}>
            {currentQ + 1} / {total}
          </div>
        </div>
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${pct}%`,
            background: 'var(--accent)', borderRadius: 99,
            transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
          }} />
        </div>
      </div>

      {/* Question */}
      <div className="animate-in" style={{ maxWidth: 600, margin: '0 auto', padding: '1.75rem 1.5rem 7rem' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(1.3rem, 3.5vw, 1.65rem)',
          lineHeight: 1.3, color: 'var(--ink)', marginBottom: '0.5rem',
        }}>
          {question.question}
        </h2>

        {isMulti && question.maxSelections && (
          <div style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginBottom: '1.25rem' }}>
            Pick up to {question.maxSelections}
            {selected.length > 0 && <span style={{ color: 'var(--accent)', marginLeft: 6 }}>· {selected.length} selected</span>}
          </div>
        )}

        {!isMulti && <div style={{ marginBottom: '1.25rem' }} />}

        <div role="group" aria-label={question.question} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {question.options.map(opt => (
            <OptionCard
              key={opt.id}
              opt={opt}
              selected={selected.some(s => s.id === opt.id)}
              onToggle={toggle}
              multi={isMulti}
            />
          ))}
        </div>
      </div>

      {/* Sticky footer */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(248,245,240,0.96)', backdropFilter: 'blur(8px)',
        borderTop: '1px solid var(--border)', padding: '1rem 1.5rem', zIndex: 100,
      }}>
        {error && (
          <div role="alert" style={{
            width: '100%', maxWidth: 600, margin: '0 auto 0.75rem',
            fontSize: '0.82rem', color: 'var(--danger)', lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}
        <div style={{
          width: '100%', maxWidth: 600, margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <button
            onClick={handleBack}
            disabled={currentQ === 0}
            style={{
              background: 'transparent', border: 'none',
              color: 'var(--ink-light)', padding: '10px 4px', borderRadius: '50px',
              fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '0.88rem',
              cursor: currentQ === 0 ? 'not-allowed' : 'pointer',
              opacity: currentQ === 0 ? 0.25 : 1,
              transition: 'opacity 0.15s ease',
            }}
            aria-label="Go back"
          >
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!canContinue}
            style={{
              background: 'var(--accent)', color: '#fff',
              border: 'none', padding: '13px 32px', borderRadius: '50px',
              fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '0.95rem',
              cursor: canContinue ? 'pointer' : 'not-allowed',
              opacity: canContinue ? 1 : 0.35,
              boxShadow: canContinue ? '0 4px 16px rgba(46,92,78,0.22)' : 'none',
              transition: 'all 0.15s ease',
            }}
            aria-label="Continue"
          >
            {currentQ === total - 1 ? 'See results' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}
