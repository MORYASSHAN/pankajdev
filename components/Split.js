// Splits text into masked characters (or words) for rise-in animations.
export default function Split({ text, className = "", by = "char" }) {
  const parts = by === "word" ? text.split(" ") : [...text];
  return (
    <span className={`split ${className}`} aria-hidden="true">
      {parts.map((p, i) => (
        <span className="split-mask" key={i}>
          <span className={by}>{p === " " ? " " : p}</span>
          {by === "word" && i < parts.length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

// Renders "*word*" segments in the italic serif.
export function Rich({ text, wordClass = "" }) {
  const out = [];
  text.split(/(\*[^*]+\*)/).forEach((seg, i) => {
    if (!seg) return;
    const italic = seg.startsWith("*");
    const clean = italic ? seg.slice(1, -1) : seg;
    clean.split(/(\s+)/).forEach((w, j) => {
      if (!w) return;
      if (/^\s+$/.test(w)) out.push(" ");
      else
        out.push(
          <span key={`${i}-${j}`} className={`${wordClass} ${italic ? "serif-i" : ""}`}>
            {w}
          </span>
        );
    });
  });
  return out;
}
