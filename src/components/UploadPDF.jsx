import { useRef, useState } from 'react';

export default function UploadPDF({ onFile, label = 'Seleccionar PDF' }) {
  const inputRef = useRef(null);
  const [nombre, setNombre] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF.');
      setNombre(null);
      onFile(null);
      return;
    }
    setError(null);
    setNombre(file.name);
    onFile(file);
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => inputRef.current.click()}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleChange}
      />
      {nombre && <p className="text-xs text-gray-500">📄 {nombre}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}