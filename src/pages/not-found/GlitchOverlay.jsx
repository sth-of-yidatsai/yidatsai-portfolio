// Pure CSS overlay layers: scanlines, vignette, flicker.
// Opacity/state is driven by GSAP targets in GlitchDOM.
export default function GlitchOverlay() {
  return (
    <>
      <div className="nf-scanlines" aria-hidden="true" />
      <div className="nf-vignette"  aria-hidden="true" />
    </>
  );
}
