import { useState } from 'react';
import { Plus } from 'lucide-react';
import Button from './ui/Button';
import { Input, Select } from './ui/Field';

const FORM_VACIO = {
  asignatura_origen: '',
  asignatura_destino: '',
  creditos_destino: '',
  estado: 'homologada',
  justificacion: '',
};

export default function AgregarAsignaturaForm({ onAgregar, agregando = false }) {
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState(FORM_VACIO);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAgregar({
      asignatura_origen: form.asignatura_origen,
      asignatura_destino: form.asignatura_destino || null,
      creditos_destino: form.creditos_destino ? Number(form.creditos_destino) : null,
      estado: form.estado,
      justificacion: form.justificacion || null,
    });
    setForm(FORM_VACIO);
    setAbierto(false);
  };

  if (!abierto) {
    return (
      <Button variant="secondary" size="sm" onClick={() => setAbierto(true)} className="self-start">
        <Plus className="w-3.5 h-3.5" aria-hidden="true" />
        Agregar asignatura manualmente
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-ink-200 bg-ink-50/60 p-4 flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Asignatura origen"
          name="asignatura_origen"
          value={form.asignatura_origen}
          onChange={handleChange}
          required
        />
        <Input
          label="Asignatura destino"
          name="asignatura_destino"
          value={form.asignatura_destino}
          onChange={handleChange}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Créditos destino"
          name="creditos_destino"
          type="number"
          min="0"
          step="1"
          value={form.creditos_destino}
          onChange={handleChange}
        />
        <Select label="Estado" name="estado" value={form.estado} onChange={handleChange}>
          <option value="homologada">Homologada</option>
          <option value="homologada_parcial">Homologada parcial</option>
          <option value="pendiente">Pendiente</option>
          <option value="no_homologada">No homologada</option>
        </Select>
      </div>
      <Input
        label="Justificación (opcional)"
        name="justificacion"
        value={form.justificacion}
        onChange={handleChange}
      />
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={() => setAbierto(false)}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={agregando}>
          {agregando ? 'Agregando...' : 'Agregar asignatura'}
        </Button>
      </div>
    </form>
  );
}
