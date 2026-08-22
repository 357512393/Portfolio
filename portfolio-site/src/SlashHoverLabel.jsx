export default function SlashHoverLabel({ label }) {
  return (
    <span className="slash-hover-label" aria-hidden="true">
      <span className="slash-hover-label__slash">
        <span className="slash-hover-label__glyph">/</span>
      </span>
      <span className="slash-hover-label__text"> {label}</span>
    </span>
  );
}
