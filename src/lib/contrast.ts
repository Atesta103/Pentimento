/** Formules WCAG 2.x (luminance relative et rapport de contraste). */

function channelToLinear(channel8bit: number): number {
  const c = channel8bit / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match?.[1]) {
    throw new Error(
      `Couleur hexadécimale à 6 chiffres attendue, reçu « ${hex} »`,
    );
  }
  const value = parseInt(match[1], 16);
  const r = channelToLinear((value >> 16) & 255);
  const g = channelToLinear((value >> 8) & 255);
  const b = channelToLinear(value & 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Rapport de contraste entre deux couleurs, de 1 (identiques) à 21 (noir sur blanc). */
export function contrastRatio(colorA: string, colorB: string): number {
  const a = relativeLuminance(colorA);
  const b = relativeLuminance(colorB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}
