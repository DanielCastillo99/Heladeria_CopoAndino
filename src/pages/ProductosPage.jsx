import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../supabase/supabaseClient";

const ProductosPage = () => {
  const [tab, setTab] = useState("productos");
  const [productos, setProductos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [relaciones, setRelaciones] = useState([]);
  const [form, setForm] = useState({});
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Cargar datos
  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    if (tab === "productos") {
      const { data, error } = await supabase.from("productos").select("*");
      if (error) console.error("Error productos:", error);
      else setProductos(data || []);
    } else if (tab === "ingredientes") {
      const { data, error } = await supabase.from("ingredientes").select("*");
      if (error) console.error("Error ingredientes:", error);
      else setIngredientes(data || []);
    } else if (tab === "relaciones") {
      const { data, error } = await supabase
        .from("producto_ingrediente")
        .select(
          `id, producto_id, ingrediente_id, productos(nombre), ingredientes(nombre)`
        );
      if (error) console.error("Error relaciones:", error);
      else setRelaciones(data || []);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let table = tab;
    let dataToSend = form;

    if (editing) {
      const { error } = await supabase
        .from(table)
        .update(dataToSend)
        .eq("id", editing);
      if (error) console.error("Error al actualizar:", error);
    } else {
      const { error } = await supabase.from(table).insert([dataToSend]);
      if (error) console.error("Error al crear:", error);
    }

    setShowModal(false);
    setForm({});
    setEditing(null);
    fetchData();
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditing(item.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from(tab).delete().eq("id", id);
    if (error) console.error("Error al eliminar:", error);
    fetchData();
  };

  const renderTable = () => {
    if (tab === "productos") {
      return (
        <div>
          <div className="flex justify-between mb-3">
            <h2 className="text-lg font-semibold">Productos</h2>
            <button
              onClick={() => {
                setForm({});
                setEditing(null);
                setShowModal(true);
              }}
              className="bg-blue-500 text-white px-3 py-2 rounded"
            >
              + Nuevo Producto
            </button>
          </div>
          <table className="min-w-full border rounded-xl overflow-hidden shadow-sm">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-2 border">Nombre</th>
                <th className="p-2 border">Precio</th>
                <th className="p-2 border">Tipo</th>
                <th className="p-2 border">Vaso</th>
                <th className="p-2 border">Volumen (oz)</th>
                <th className="p-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id} className="border hover:bg-gray-50">
                  <td className="p-2 border">{p.nombre}</td>
                  <td className="p-2 border">{p.precio_publico}</td>
                  <td className="p-2 border">{p.tipo}</td>
                  <td className="p-2 border">{p.vaso}</td>
                  <td className="p-2 border">{p.volumen_onza}</td>
                  <td className="p-2 border text-center">
                    <button
                      className="px-2 py-1 bg-yellow-400 text-white rounded mx-1"
                      onClick={() => handleEdit(p)}
                    >
                      Editar
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => handleDelete(p.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (tab === "ingredientes") {
      return (
        <div>
          <div className="flex justify-between mb-3">
            <h2 className="text-lg font-semibold">Ingredientes</h2>
            <button
              onClick={() => {
                setForm({});
                setEditing(null);
                setShowModal(true);
              }}
              className="bg-blue-500 text-white px-3 py-2 rounded"
            >
              + Nuevo Ingrediente
            </button>
          </div>
          <table className="min-w-full border rounded-xl overflow-hidden shadow-sm">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-2 border">Nombre</th>
                <th className="p-2 border">Precio</th>
                <th className="p-2 border">Calorías</th>
                <th className="p-2 border">Inventario</th>
                <th className="p-2 border">Tipo</th>
                <th className="p-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ingredientes.map((i) => (
                <tr key={i.id} className="border hover:bg-gray-50">
                  <td className="p-2 border">{i.nombre}</td>
                  <td className="p-2 border">{i.precio}</td>
                  <td className="p-2 border">{i.calorias}</td>
                  <td className="p-2 border">{i.inventario}</td>
                  <td className="p-2 border">{i.tipo}</td>
                  <td className="p-2 border text-center">
                    <button
                      className="px-2 py-1 bg-yellow-400 text-white rounded mx-1"
                      onClick={() => handleEdit(i)}
                    >
                      Editar
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => handleDelete(i.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (tab === "relaciones") {
      return (
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Relaciones Producto - Ingrediente
          </h2>
          <table className="min-w-full border rounded-xl overflow-hidden shadow-sm">
            <thead className="bg-blue-100">
              <tr>
                <th className="p-2 border">Producto</th>
                <th className="p-2 border">Ingrediente</th>
              </tr>
            </thead>
            <tbody>
              {relaciones.map((r) => (
                <tr key={r.id} className="border hover:bg-gray-50">
                  <td className="p-2 border">{r.productos?.nombre}</td>
                  <td className="p-2 border">{r.ingredientes?.nombre}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
  };

  // 🔹 Modal (creación/edición)
  const Modal = () => (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <h3 className="text-lg font-semibold mb-4">
              {editing ? "Editar registro" : "Nuevo registro"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                className="border p-2 w-full rounded"
                placeholder="Nombre"
                name="nombre"
                value={form.nombre || ""}
                onChange={handleChange}
                required
              />
              {tab === "productos" ? (
                <>
                  <input
                    className="border p-2 w-full rounded"
                    placeholder="Precio público"
                    name="precio_publico"
                    value={form.precio_publico || ""}
                    onChange={handleChange}
                  />
                  <input
                    className="border p-2 w-full rounded"
                    placeholder="Tipo"
                    name="tipo"
                    value={form.tipo || ""}
                    onChange={handleChange}
                  />
                  <input
                    className="border p-2 w-full rounded"
                    placeholder="Vaso"
                    name="vaso"
                    value={form.vaso || ""}
                    onChange={handleChange}
                  />
                  <input
                    className="border p-2 w-full rounded"
                    placeholder="Volumen en onzas"
                    name="volumen_onza"
                    value={form.volumen_onza || ""}
                    onChange={handleChange}
                  />
                </>
              ) : (
                <>
                  <input
                    className="border p-2 w-full rounded"
                    placeholder="Precio"
                    name="precio"
                    value={form.precio || ""}
                    onChange={handleChange}
                  />
                  <input
                    className="border p-2 w-full rounded"
                    placeholder="Calorías"
                    name="calorias"
                    value={form.calorias || ""}
                    onChange={handleChange}
                  />
                  <input
                    className="border p-2 w-full rounded"
                    placeholder="Inventario"
                    name="inventario"
                    value={form.inventario || ""}
                    onChange={handleChange}
                  />
                  <input
                    className="border p-2 w-full rounded"
                    placeholder="Tipo"
                    name="tipo"
                    value={form.tipo || ""}
                    onChange={handleChange}
                  />
                  <input
                    className="border p-2 w-full rounded"
                    placeholder="Sabor"
                    name="sabor"
                    value={form.sabor || ""}
                    onChange={handleChange}
                  />
                </>
              )}
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  className="bg-gray-400 text-white px-3 py-2 rounded"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-3 py-2 rounded"
                >
                  {editing ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="p-6">
      <div className="flex gap-2 mb-4">
        {["productos", "ingredientes", "relaciones"].map((t) => (
          <button
            key={t}
            className={`px-3 py-2 rounded ${
              tab === t ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            onClick={() => {
              setTab(t);
              setForm({});
              setEditing(null);
              setShowModal(false);
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {renderTable()}
      <Modal />
    </div>
  );
};

export default ProductosPage;
