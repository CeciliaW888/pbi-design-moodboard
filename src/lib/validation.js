const HEX_3 = /^#[0-9a-fA-F]{3}$/;
const HEX_6 = /^#[0-9a-fA-F]{6}$/;

export function isValidHexColor(value) {
  return HEX_3.test(value) || HEX_6.test(value);
}

// Expand #RGB to #RRGGBB
export function normalizeHexColor(value) {
  if (HEX_6.test(value)) return value;
  if (HEX_3.test(value)) {
    const [, r, g, b] = value.match(/^#(.)(.)(.)$/);
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return null;
}

const MAX_NAME_LENGTH = 100;

export function sanitizeName(value) {
  return value.slice(0, MAX_NAME_LENGTH);
}

export function isValidName(value) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= MAX_NAME_LENGTH;
}

export function clampFontSize(value, min, max) {
  const n = Number(value);
  if (isNaN(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}
