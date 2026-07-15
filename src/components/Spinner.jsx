export default function Spinner({ texto = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-700 rounded-full animate-spin" />
      <p className="mt-3 text-sm text-gray-500">{texto}</p>
    </div>
  );
}