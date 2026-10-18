// ============================================================
// OPENING ARTWORK
//
// A vortex of brush strokes turning around a point of light.
// Original work — no photograph, no licence needed.
//
// Served as a file rather than inlined, so the 220KB of path data
// stays out of the JavaScript bundle and gets cached by the browser
// after the first visit.
// ============================================================

export default function VortexArt() {
  return (
    <img
      className="vortex"
      src="/vortex.svg"
      alt=""
      aria-hidden="true"
      decoding="async"
      fetchPriority="high"
    />
  );
}
