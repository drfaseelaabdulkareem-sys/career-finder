import { useState } from 'react';
import Confetti from './Confetti.jsx';

const DIMS = [
  ['problemSolving','Problem Solver'], ['people','People Person'], ['research','Researcher'],
  ['technology','Tech Curious'],       ['creativity','Creative'],   ['writing','Writer'],
  ['data','Analyst'],                  ['organisation','Organiser'],
];

const CONFIDENCE_NOTE = {
  good:     'These figures are well supported — several independent Indian sources agree.',
  moderate: 'Reasonably supported, though sources differ. Treat the range as a guide.',
  thin:     'The data here is thin. Treat these as rough indications and check them yourself before deciding anything.',
};

function Pay({ market }) {
  if (!market) return null;
  return (
    <div className="paybox">
      <div className="pay-now">{market.salaryNow}</div>
      <div className="pay-for">{market.salaryBandLabel} · typical reported range in India</div>

      <div className="ladder">
        {market.ladder.map(rung => (
          <div className={`rung${rung.isCurrent ? ' now' : ''}`} key={rung.band}>
            <span>{rung.label}{rung.isCurrent ? ' — you' : ''}</span>
            <span>{rung.range}</span>
          </div>
        ))}
      </div>

      {market.salaryNote && <p className="pay-note">{market.salaryNote}</p>}
      <div className="conf">{CONFIDENCE_NOTE[market.confidence]}</div>
    </div>
  );
}

function Match({ match }) {
  const [open, setOpen] = useState(false);
  const m = match.market;
  const fit = m?.degreeFit;

  const phases = [
    ['Explore', 'First 30 days',  match.roadmap.days0to30],
    ['Build',   'Days 31 to 60',  match.roadmap.days31to60],
    ['Apply',   'Days 61 to 90',  match.roadmap.days61to90],
  ];

  return (
    <div className="match animate-in">
      <div className="match-top">
        <div style={{ minWidth: 0 }}>
          <h3>{match.roleName}</h3>
          {match.shortDesc && <div className="match-desc">{match.shortDesc}</div>}
        </div>
        <span className="cluster">{match.cluster}</span>
      </div>

      {fit && (
        <div style={{ margin: '.9rem 0 .2rem' }}>
          <span className={`tag tag-${fit.level}`}>{fit.label}</span>
          <p style={{ fontSize: '.84rem', color: 'var(--ink-light)', lineHeight: 1.55, marginTop: 8 }}>
            {fit.note}
          </p>
        </div>
      )}

      <Pay market={m} />

      <div className="slabel">WHY THIS CAME UP FOR YOU</div>
      <ul className="why">
        {match.whyItFits.map((s, i) => <li key={i}>{s}</li>)}
      </ul>

      {match.watchOuts?.length > 0 && (
        <div className="watch">
          {match.watchOuts.map((s, i) => <div key={i}>{s}</div>)}
        </div>
      )}

      <div className="kv">
        <div><strong>Your advantage: </strong>{match.transferableAdvantages[0]}</div>
        <div><strong>Your gap: </strong>{match.biggestSkillGaps[0]}</div>
        {m && <div><strong>Where the jobs are: </strong>{m.cities.join(', ')}</div>}
        {m && <div><strong>Getting in: </strong>{m.entryDifficulty} · hiring volume {m.hiringVolume}</div>}
      </div>

      {m?.realityCheck && (
        <div className="reality">
          <div className="panel-title">Worth knowing</div>
          <p>{m.realityCheck}</p>
        </div>
      )}

      <div className="slabel">JOB TITLES TO SEARCH FOR</div>
      <div className="pills">
        {match.jobTitles.map((t, i) => <span className="pill" key={i}>{t}</span>)}
      </div>

      <button className="toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? 'Hide the 90-day plan' : 'Show me the 90-day plan'}
      </button>

      {open && (
        <div className="animate-in">
          <div className="phases">
            {phases.map(([name, days, steps]) => (
              <div className="phase" key={name}>
                <div className="phase-n">{name}</div>
                <div className="phase-d">{days}</div>
                <ul>{steps.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            ))}
          </div>
          <div className="exp">
            <div className="panel-title">Try this first</div>
            <p style={{ fontSize: '.84rem', color: 'var(--ink-light)', lineHeight: 1.6 }}>
              {match.experiment}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Results({ result, onRestart, email }) {
  const { matches, archetype, dimensions, profile, excluded } = result;
  const [confirm, setConfirm] = useState(false);

  const label = archetype.secondary
    ? `${archetype.primary.name} + ${archetype.secondary.name}`
    : archetype.primary.name;

  return (
    <div className="shell narrow animate-in">
      <Confetti />

      <div className="res-head">
        <div className="slabel c">HOW YOU WORK</div>
        <h1 className="arch">{label}</h1>
        <p className="arch-copy">{archetype.primary.copy}</p>

        <div className="dims">
          {DIMS.map(([k, l]) => (
            <div className="dim" key={k}>
              <span className="dim-l">{l}</span>
              <div className="dim-bar"><div className="dim-fill" style={{ width: `${dimensions[k] || 0}%` }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel" style={{ marginBottom: '1.5rem' }}>
        <div className="panel-title">Your three careers</div>
        <p>
          These three fit how you answered. They are listed easiest to enter
          first, so you can see what is within reach now and what would take longer.
          {profile?.degree && <> Pay and degree notes below are for a <strong>{profile.degree}</strong> graduate
          {profile.experienceLabel ? <> with <strong>{profile.experienceLabel.toLowerCase()}</strong></> : null}.</>}
        </p>
      </div>

      {matches.map(m => <Match key={m.roleId} match={m} />)}

      {excluded?.length > 0 && (
        <div className="panel" style={{ marginTop: '.5rem' }}>
          <div className="panel-title">Left out on purpose</div>
          <p>
            We removed {excluded.join(' and ')} from your results, because you told us
            something about {excluded.length > 1 ? 'those roles' : 'that role'} is a
            deal-breaker for you.
          </p>
        </div>
      )}

      <div className="res-foot">
        {!confirm ? (
          <button className="btn btn-ghost" onClick={() => setConfirm(true)}>Start over</button>
        ) : (
          <div>
            <p style={{ fontSize: '.85rem', color: 'var(--ink-light)', marginBottom: 12 }}>
              Your answers will be cleared.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" style={{ padding: '9px 22px', fontSize: '.85rem' }} onClick={onRestart}>
                Yes, start over
              </button>
              <button className="btn btn-ghost" onClick={() => setConfirm(false)}>Keep these</button>
            </div>
          </div>
        )}

        <p className="disc">
          Salary figures are reported ranges from Indian sources, not offers or promises.
          Your results come from your own answers, not from a scientific test.
        </p>
      </div>
    </div>
  );
}
