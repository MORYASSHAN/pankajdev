// Link label whose letters roll up one after another on hover.
export default function Roll({ text }) {
  return (
    <span className="roll">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {[...text].map((c, i) => {
          const ch = c === " " ? " " : c;
          return (
            <span className="roll-c" key={i} style={{ "--i": i }}>
              <span>{ch}</span>
              <span>{ch}</span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
