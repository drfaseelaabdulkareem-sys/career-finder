import { useState, useEffect, useCallback } from 'react';
import Gate, { useGate } from './components/Gate.jsx';
import Welcome from './components/Welcome.jsx';
import Assessment from './components/Assessment.jsx';
import Transition from './components/Transition.jsx';
import Results from './components/Results.jsx';
import { fetchContent, submitAnswers, clearSession } from './lib/api.js';

// Screens: gate → welcome → assessment → transition → results
export default function App() {
  const { unlocked, session, unlock, lock } = useGate();

  const [questions, setQuestions] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [screen, setScreen]       = useState('welcome');
  const [currentQ, setCurrentQ]   = useState(0);
  const [answers, setAnswers]     = useState({});   // { questionId: [option] }
  const [result, setResult]       = useState(null);
  const [scoreError, setScoreError] = useState('');

  // Questions live behind the paywall, so they load only after unlock.
  useEffect(() => {
    if (!unlocked) return;

    let cancelled = false;
    setLoadError('');

    fetchContent()
      .then(data => { if (!cancelled) setQuestions(data.questions); })
      .catch(err => {
        if (cancelled) return;
        // Session died (expired, revoked, device removed) — back to the gate.
        clearSession();
        lock();
        setLoadError(err.code || 'load_failed');
      });

    return () => { cancelled = true; };
  }, [unlocked, lock]);

  const handleAnswer = useCallback((questionId, selectedOptions) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOptions }));
  }, []);

  async function handleFinish(finalAnswers) {
    setScreen('transition');
    setScoreError('');

    // Only option ids leave the browser. The engine runs on the server.
    const idMap = Object.fromEntries(
      Object.entries(finalAnswers).map(([qid, opts]) => [qid, opts.map(o => o.id)])
    );

    try {
      const data = await submitAnswers(idMap);
      setResult(data);
    } catch (err) {
      if (['no_session', 'expired', 'revoked', 'device_revoked', 'bad_session'].includes(err.code)) {
        clearSession();
        lock();
        setLoadError(err.code);
        return;
      }
      setScoreError("We couldn't generate your results just then. Check your connection and try again.");
      setScreen('assessment');
    }
  }

  function handleRestart() {
    setCurrentQ(0);
    setAnswers({});
    setResult(null);
    setScoreError('');
    setScreen('welcome');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleUnlock(newSession) {
    unlock(newSession);
    setLoadError('');
  }

  if (!unlocked) {
    return <Gate onUnlock={handleUnlock} />;
  }

  if (loadError) {
    return <Gate onUnlock={handleUnlock} />;
  }

  if (!questions) {
    return <FullPageLoader label="Loading your worksheet…" />;
  }

  return (
    <>
      {screen === 'welcome' && <Welcome onStart={() => setScreen('assessment')} />}

      {screen === 'assessment' && (
        <Assessment
          questions={questions}
          currentQ={currentQ}
          setCurrentQ={setCurrentQ}
          answers={answers}
          onAnswer={handleAnswer}
          onFinish={handleFinish}
          error={scoreError}
        />
      )}

      {screen === 'transition' && (
        <Transition onDone={() => { if (result) setScreen('results'); }} ready={!!result} />
      )}

      {screen === 'results' && result && (
        <Results result={result} onRestart={handleRestart} email={session?.email} />
      )}
    </>
  );
}

function FullPageLoader({ label }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1rem',
    }}>
      <div className="ncf-spinner" />
      <div style={{ fontSize: '0.9rem', color: 'var(--ink-light)' }}>{label}</div>
      <style>{`
        @keyframes ncf-spin { to { transform: rotate(360deg); } }
        .ncf-spinner {
          width: 30px; height: 30px;
          border: 2.5px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: ncf-spin 0.7s linear infinite;
        }
      `}</style>
    </div>
  );
}
