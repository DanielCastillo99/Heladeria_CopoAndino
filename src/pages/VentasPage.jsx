import { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

export default function VentasPage() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [venta, setVenta] = useState({
    producto_id: "",
    user_id: "",
    cantidad: 1,
    total: 0,
  });
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [productosConIngredientes, setProductosConIngredientes] = useState([]);

  useEffect(() => {
    obtenerUsuarioActual();
    obtenerProductos();
    obtenerUsuarios();
  }, []);

  async function obtenerUsuarioActual() {
    const { data, error } = await supabase.auth.getUser();
    if (error) return console.error(error);

    const user = data.user;
    if (user) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, correo, rol")
        .eq("auth_id", user.id)
        .single();
      if (userError) console.error(userError);
      else {
        setUsuarioActual(userData);
        obtenerVentas(userData);
      }
    }
  }

  async function obtenerProductos() {
    const { data, error } = await supabase
      .from("productos")
      .select(
        "id, nombre, precio_publico, producto_ingrediente:producto_ingrediente(ingrediente:ingrediente_id(nombre, inventario))"
      );
    if (error) return console.error(error);

    setProductos(data || []);
    setProductosConIngredientes(data || []);
  }

  async function obtenerUsuarios() {
    const { data, error } = await supabase
      .from("users")
      .select("id, correo, rol");
    if (error) console.error(error);
    else setUsuarios(data || []);
  }

  async function obtenerVentas(usuario) {
    // Query básica
    const { data, error } = await supabase
      .from("ventas")
      .select(
        `
        id,
        fecha,
        cantidad,
        total,
        producto:producto_id (
          id,
          nombre,
          producto_ingrediente:producto_ingrediente (
            ingrediente:ingrediente_id (
              nombre,
              inventario
            )
          )
        ),
        usuario:user_id (id, correo, rol)
      `
      )
      .order("fecha", { ascending: false });

    if (error) return console.error(error);

    if (usuario.rol === "empleado") {
      // Filtrar solo ventas de usuarios con rol cliente
      setVentas(data.filter((v) => v.usuario?.rol === "cliente"));
    } else if (usuario.rol === "admin") {
      setVentas(data);
    } else {
      // Cliente no ve tabla
      setVentas([]);
    }
  }

  useEffect(() => {
    const productoSeleccionado = productos.find(
      (p) => p.id === parseInt(venta.producto_id)
    );
    if (productoSeleccionado) {
      setVenta((v) => ({
        ...v,
        total: productoSeleccionado.precio_publico * v.cantidad,
      }));
    }
  }, [venta.producto_id, venta.cantidad, productos]);

  async function registrarVenta(e) {
    e.preventDefault();
    const { producto_id, user_id, cantidad, total } = venta;

    if (!producto_id || cantidad < 1)
      return alert("Selecciona un producto y cantidad válida.");

    const { data: ingredientesRelacionados, error: errorIngredientes } =
      await supabase
        .from("producto_ingrediente")
        .select("ingrediente_id, ingrediente:ingrediente_id (inventario)")
        .eq("producto_id", producto_id);

    if (errorIngredientes) return console.error(errorIngredientes);

    const inventarioInsuficiente = ingredientesRelacionados.some(
      (rel) => rel.ingrediente.inventario < cantidad
    );
    if (inventarioInsuficiente)
      return alert("❌ No hay inventario suficiente.");

    let ventaUserId = null;
    if (usuarioActual.rol === "cliente") ventaUserId = usuarioActual.id;
    else ventaUserId = user_id;

    const { error } = await supabase
      .from("ventas")
      .insert([{ producto_id, user_id: ventaUserId, cantidad, total }]);
    if (error) return console.error(error);

    for (const rel of ingredientesRelacionados) {
      const nuevoInventario = rel.ingrediente.inventario - cantidad;
      await supabase
        .from("ingredientes")
        .update({ inventario: nuevoInventario })
        .eq("id", rel.ingrediente_id);
    }

    setVenta({ producto_id: "", user_id: "", cantidad: 1, total: 0 });
    obtenerVentas(usuarioActual);
    obtenerProductos();
    alert("✅ Venta registrada y stock actualizado.");
  }

  async function eliminarVenta(ventaId) {
    if (usuarioActual?.rol !== "admin")
      return alert("❌ Solo administradores pueden eliminar ventas.");

    const { data: ventaInfo, error } = await supabase
      .from("ventas")
      .select("*")
      .eq("id", ventaId)
      .single();
    if (error) return console.error(error);

    const { data: ingredientesRelacionados } = await supabase
      .from("producto_ingrediente")
      .select("ingrediente_id, ingrediente:ingrediente_id (inventario)")
      .eq("producto_id", ventaInfo.producto_id);

    for (const rel of ingredientesRelacionados) {
      const nuevoInventario = rel.ingrediente.inventario + ventaInfo.cantidad;
      await supabase
        .from("ingredientes")
        .update({ inventario: nuevoInventario })
        .eq("id", rel.ingrediente_id);
    }

    await supabase.from("ventas").delete().eq("id", ventaId);
    obtenerVentas(usuarioActual);
    obtenerProductos();
    alert("🗑️ Venta eliminada y stock revertido.");
  }

  function ingredientesRestantes(producto) {
    if (!producto?.producto_ingrediente) return "—";
    return producto.producto_ingrediente
      .map((pi) => `${pi.ingrediente.nombre} (${pi.ingrediente.inventario})`)
      .join(", ");
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gestión de Ventas</h1>

      {/* Formulario de venta */}
      <form
        onSubmit={registrarVenta}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <select
          value={venta.producto_id}
          onChange={(e) =>
            setVenta({ ...venta, producto_id: parseInt(e.target.value) })
          }
          className="border p-2 rounded"
          required
        >
          <option value="">Selecciona producto</option>
          {productosConIngredientes.map((p) => (
            <option
              key={p.id}
              value={p.id}
              title={
                p.producto_ingrediente
                  ? p.producto_ingrediente
                      .map(
                        (pi) =>
                          `${pi.ingrediente.nombre}: ${pi.ingrediente.inventario}`
                      )
                      .join(", ")
                  : ""
              }
            >
              {p.nombre} - ${p.precio_publico}
            </option>
          ))}
        </select>

        {/* Select de usuario solo para empleado y admin */}
        {(usuarioActual?.rol === "empleado" ||
          usuarioActual?.rol === "admin") && (
          <select
            value={venta.user_id}
            onChange={(e) =>
              setVenta({ ...venta, user_id: parseInt(e.target.value) })
            }
            className="border p-2 rounded"
          >
            <option value="">Usuario (opcional)</option>
            {usuarios
              .filter((u) => {
                if (usuarioActual.rol === "empleado")
                  return u.rol === "cliente";
                return true;
              })
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.correo}
                </option>
              ))}
          </select>
        )}

        <input
          type="number"
          min="1"
          value={venta.cantidad}
          onChange={(e) =>
            setVenta({ ...venta, cantidad: parseInt(e.target.value) })
          }
          className="border p-2 rounded"
          placeholder="Cantidad"
        />

        <input
          type="text"
          value={`$${venta.total.toFixed(2)}`}
          readOnly
          className="border p-2 rounded bg-gray-100"
        />

        <button className="col-span-1 md:col-span-4 bg-green-600 text-white px-4 py-2 rounded mt-2 hover:bg-green-700 transition">
          Registrar Venta
        </button>
      </form>

      {/* Tabla de ventas solo para empleado y admin */}
      {(usuarioActual?.rol === "admin" ||
        usuarioActual?.rol === "empleado") && (
        <div className="overflow-x-auto border rounded">
          <table className="w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="border px-4 py-2">ID</th>
                <th className="border px-4 py-2">Producto</th>
                <th className="border px-4 py-2">Usuario</th>
                <th className="border px-4 py-2">Cantidad</th>
                <th className="border px-4 py-2">Total</th>
                <th className="border px-4 py-2">Ingredientes restantes</th>
                <th className="border px-4 py-2">Fecha</th>
                <th className="border px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{v.id}</td>
                  <td className="border px-4 py-2">{v.producto?.nombre}</td>
                  <td className="border px-4 py-2">
                    {v.usuario?.correo || "—"}
                  </td>
                  <td className="border px-4 py-2">{v.cantidad}</td>
                  <td className="border px-4 py-2">${v.total}</td>
                  <td className="border px-4 py-2">
                    {ingredientesRestantes(v.producto)}
                  </td>
                  <td className="border px-4 py-2">
                    {new Date(v.fecha).toLocaleString()}
                  </td>
                  <td className="border px-4 py-2">
                    {usuarioActual?.rol === "admin" && (
                      <button
                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                        onClick={() => eliminarVenta(v.id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
