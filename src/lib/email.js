// a veces el autocompletado deja espacios raros en el correo y el input type=email
// truena con un error confuso, mejor los quitamos
export function sanitizeEmail(value) {
  return value.replace(/\s/g, '');
}
