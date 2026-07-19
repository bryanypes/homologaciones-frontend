// Autofill/password managers sometimes inject invisible whitespace (NBSP, zero-width
// space) into email fields. That passes visual inspection but fails native <input
// type="email"> validation with a confusing "unexpected symbol" tooltip. Strip it on input.
const INVISIBLE_CHARS = new RegExp(
  '[\\s\\u200B\\u200C\\u200D\\u200E\\u200F\\uFEFF\\u00A0]',
  'g',
);

export function sanitizeEmail(value) {
  return value.replace(INVISIBLE_CHARS, '');
}
