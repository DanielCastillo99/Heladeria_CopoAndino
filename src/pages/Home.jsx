import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const Home = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        // 1️⃣ Traemos todos los productos
        const { data: productosData, error: productosError } = await supabase
          .from("productos")
          .select("id, nombre, precio_publico, tipo, vaso, volumen_onzas");
        if (productosError) throw productosError;

        // 2️⃣ Traemos todas las calorías por producto
        const { data: caloriasData, error: caloriasError } = await supabase
          .from("v_calorias_producto")
          .select("producto_id, nombre, total_calorias");

        if (caloriasError) throw caloriasError;

        // 3️⃣ Unimos ambos resultados manualmente
        const productosCompletos = productosData.map((producto) => {
          const calorias = caloriasData.find(
            (c) => c.producto_id === producto.id
          );
          return { ...producto, calorias: calorias || null };
        });

        setProductos(productosCompletos);
      } catch (error) {
        console.error("Error al cargar productos:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-yellow-50">
        <p className="text-lg text-pink-500 font-semibold animate-pulse">
          🍨 Cargando los productos más dulces...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-rose-50 to-yellow-50 py-10 px-6">
      {/* Encabezado */}
      {/* Logo o ícono */}
      <div className="mb-6 animate-bounce">
        <span className="text-6xl">🍦</span>
      </div>

      {/* Título principal */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-pink-600 drop-shadow-sm mb-4">
        ¡Bienvenido a la Heladería Copo Andino!
      </h1>

      {/* Subtítulo */}
      <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-8">
        Una experiencia refrescante, moderna y deliciosa 🍨
      </p>
      <h1 className="text-4xl font-extrabold text-center text-pink-600 mb-8 drop-shadow-sm">
        🍧 Catálogo de Productos
      </h1>

      {/* Grid de productos */}
      {productos.length === 0 ? (
        <p className="text-center text-gray-600 text-lg">
          No hay productos disponibles.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {productos.map((producto) => (
            <div
              key={producto.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-pink-100 p-6 transition-transform hover:-translate-y-1 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {producto.nombre}
                </h2>
                <p className="text-gray-500 mb-2">
                  <span className="font-semibold text-pink-600">Tipo:</span>{" "}
                  {producto.tipo}
                </p>
                <p className="text-gray-500 mb-2">
                  <span className="font-semibold text-pink-600">Vaso:</span>{" "}
                  {producto.vaso}
                </p>
                <p className="text-gray-500 mb-2">
                  <span className="font-semibold text-pink-600">Volumen:</span>{" "}
                  {producto.volumen_onzas} oz
                </p>
              </div>

              {/* Precio y calorías */}
              <div className="mt-4">
                <p className="text-lg font-bold text-teal-600">
                  💰 ${producto.precio_publico?.toLocaleString()}
                </p>

                {producto.calorias ? (
                  <div className="mt-2 text-sm text-gray-600 bg-pink-50 p-2 rounded-lg">
                    <p>
                      <span className="font-semibold text-pink-700">
                        🍦 Calorías:
                      </span>{" "}
                      {producto.calorias.total_calorias} kcal
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic mt-2">
                    Sin información calórica
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pie de página */}
      <footer className="mt-12 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Heladería Dulce Frío 🍨 — Hecho con{" "}
        <span className="text-pink-500">❤️</span> en Colombia
      </footer>
    </div>
  );
};

export default Home;
