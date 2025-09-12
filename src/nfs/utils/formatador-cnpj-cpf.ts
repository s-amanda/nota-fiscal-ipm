export function removeFormat(documento: string) {
  return documento.replace(/[^\d]/g, '');
}
