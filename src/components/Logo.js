import logo from "@/assets/images/dukaan.png";

// Standalone wordmark logo. Never render text alongside it — the mark already
// carries the brand name. Control size via the `height` prop.
export default function Logo({ height = 30, style }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={logo.src}
      alt="Dukaan"
      style={{ height, width: "auto", display: "block", ...style }}
    />
  );
}
