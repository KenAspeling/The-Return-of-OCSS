// Stable color per string (project/client name) using a small hash.
export function colorFor(input: string): { hue: number; bg: string; fg: string; ring: string } {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) | 0;
  const hue = Math.abs(h) % 360;
  return {
    hue,
    bg: `oklch(0.28 0.08 ${hue})`,
    fg: `oklch(0.85 0.16 ${hue})`,
    ring: `oklch(0.55 0.18 ${hue})`,
  };
}
