import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const RentabilidadPage = () => {
  const [rentabilidad, setRentabilidad] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    obtenerRentabilidad();
  }, []);

  async function obtenerRentabilidad() {
    setLoading(true);
    const { data, error } = await supabase
      .from("v_rentabilidad_producto")
      .select("*")
      .order("rentabilidad", { ascending: false });

    if (error) {
      console.error("Error al obtener rentabilidad:", error);
    } else {
      setRentabilidad(data);
    }
    setLoading(false);
  }

  const totalRentabilidad = rentabilidad.reduce((acc, item) => acc + item.rentabilidad, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Informe de Rentabilidad</h1>
      <p className="mb-6">Visualiza la rentabilidad por producto.</p>

      {loading ? (
        <p>Cargando datos...</p>
      ) : (
        <>
          <div className="overflow-x-auto border rounded">
            <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border px-4 py-2">ID Producto</th>
                  <th className="border px-4 py-2">Nombre</th>
                  <th className="border px-4 py-2">Precio Público</th>
                  <th className="border px-4 py-2">Costo</th>
                  <th className="border px-4 py-2">Rentabilidad</th>
                </tr>
              </thead>
              <tbody>
                {rentabilidad.map((item) => (
                  <tr key={item.producto_id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{item.producto_id}</td>
                    <td className="border px-4 py-2">{item.nombre}</td>
                    <td className="border px-4 py-2">${item.precio_publico.toFixed(2)}</td>
                    <td className="border px-4 py-2">${item.costo.toFixed(2)}</td>
                    <td className="border px-4 py-2">${item.rentabilidad.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-gray-100 rounded">
            <strong>Total Rentabilidad:</strong> ${totalRentabilidad.toFixed(2)}
          </div>
        </>
      )}
    </div>
  );
};

export default RentabilidadPage;

