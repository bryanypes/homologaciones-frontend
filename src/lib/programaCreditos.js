import client from '../api/client';

export async function obtenerCreditosPrograma(programaId) {
  if (!programaId) return null;
  try {
    const { data } = await client.get('/asignaturas', { params: { programa_id: programaId } });
    const lista = Array.isArray(data) ? data : (data.items ?? []);
    if (!lista.length) return null;
    return lista.reduce((sum, a) => sum + (a.creditos ?? 0), 0);
  } catch {
    return null;
  }
}
