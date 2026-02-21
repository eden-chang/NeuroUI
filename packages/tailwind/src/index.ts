import plugin from 'tailwindcss/plugin';

/**
 * NeuroUI Tailwind CSS plugin.
 *
 * Adds variant selectors that respond to NeuroUI sensory profile
 * data attributes on the document root.
 *
 * Usage in Tailwind classes:
 *   `neuro-motion-none:hidden`
 *   `neuro-touch:p-6`
 *   `neuro-high-contrast:border-2`
 */
const neuroPlugin = plugin(({ addVariant }) => {
  // Motion variants
  addVariant('neuro-motion-none', '[data-neuro-motion="none"] &');
  addVariant('neuro-motion-reduced', '[data-neuro-motion="reduced"] &');
  addVariant('neuro-motion-full', '[data-neuro-motion="full"] &');

  // Density variants
  addVariant('neuro-minimal', '[data-neuro-density="minimal"] &');
  addVariant('neuro-detailed', '[data-neuro-density="detailed"] &');

  // Spacing variants
  addVariant('neuro-relaxed', '[data-neuro-spacing="relaxed"] &');
  addVariant('neuro-compact', '[data-neuro-spacing="compact"] &');

  // Focus variant
  addVariant('neuro-focus-enhanced', '[data-neuro-focus="enhanced"] &');

  // Timing variant
  addVariant('neuro-patient', '[data-neuro-timing="patient"] &');

  // Contrast variant
  addVariant('neuro-high-contrast', '[data-neuro-contrast="high"] &');

  // Flash safety variant
  addVariant('neuro-flash-safe', '[data-neuro-flashSafety="true"] &');

  // Input method variants
  addVariant('neuro-touch', '[data-neuro-inputMethod="touch"] &');
  addVariant('neuro-keyboard', '[data-neuro-inputMethod="keyboard"] &');
  addVariant('neuro-switch', '[data-neuro-inputMethod="switch"] &');
  addVariant('neuro-voice', '[data-neuro-inputMethod="voice"] &');

  // Color vision variants
  addVariant('neuro-cvd', ':is([data-neuro-colorVision="protanopia"], [data-neuro-colorVision="deuteranopia"], [data-neuro-colorVision="tritanopia"], [data-neuro-colorVision="achromatopsia"]) &');
  addVariant('neuro-protanopia', '[data-neuro-colorVision="protanopia"] &');
  addVariant('neuro-deuteranopia', '[data-neuro-colorVision="deuteranopia"] &');
  addVariant('neuro-tritanopia', '[data-neuro-colorVision="tritanopia"] &');
  addVariant('neuro-achromatopsia', '[data-neuro-colorVision="achromatopsia"] &');
});

export default neuroPlugin;
export { neuroPlugin };
