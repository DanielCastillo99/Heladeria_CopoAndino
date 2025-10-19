import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const AdminPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioForm, setUsuarioForm] = useState({
    id: null,
    nombre: "",
    correo: "",
    password: "",
    rol: "cliente",
  });
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  async function obtenerUsuarios() {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error al obtener usuarios:", error);
    } else {
      setUsuarios(data);
    }
  }

  async function guardarUsuario(e) {
    e.preventDefault();

    const { id, nombre, correo, password, rol } = usuarioForm;

    if (!nombre || !correo || !password || !rol) {
      alert("Todos los campos son obligatorios");
      return;
    }

    if (editando) {
      // Actualizar usuario
      const { error } = await supabase
        .from("users")
        .update({ nombre, correo, password, rol })
        .eq("id", id);

      if (error) {
        alert("Error al actualizar usuario");
        console.error(error);
      } else {
        alert("Usuario actualizado correctamente");
      }
    } else {
      // Crear usuario
      const { error } = await supabase
        .from("users")
        .insert([{ nombre, correo, password, rol }]);

      if (error) {
        alert("Error al crear usuario");
        console.error(error);
      } else {
        alert("Usuario creado correctamente");
      }
    }

    setUsuarioForm({
      id: null,
      nombre: "",
      correo: "",
      password: "",
      rol: "cliente",
    });
    setEditando(false);
    obtenerUsuarios();
  }

  function editarUsuario(usuario) {
    setUsuarioForm(usuario);
    setEditando(true);
  }

  async function eliminarUsuario(id) {
    if (window.confirm("¿Seguro que quieres eliminar este usuario?")) {
      const { error } = await supabase.from("users").delete().eq("id", id);
      if (error) {
        alert("Error al eliminar usuario");
        console.error(error);
      } else {
        alert("Usuario eliminado");
        obtenerUsuarios();
      }
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Panel de Administración</h1>

      {/* Formulario de usuario */}
      <form
        onSubmit={guardarUsuario}
        className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6"
      >
        <input
          type="text"
          placeholder="Nombre"
          value={usuarioForm.nombre}
          onChange={(e) =>
            setUsuarioForm({ ...usuarioForm, nombre: e.target.value })
          }
          className="border p-2 rounded col-span-1"
        />
        <input
          type="email"
          placeholder="Correo"
          value={usuarioForm.correo}
          onChange={(e) =>
            setUsuarioForm({ ...usuarioForm, correo: e.target.value })
          }
          className="border p-2 rounded col-span-1"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={usuarioForm.password}
          onChange={(e) =>
            setUsuarioForm({ ...usuarioForm, password: e.target.value })
          }
          className="border p-2 rounded col-span-1"
        />
        <select
          value={usuarioForm.rol}
          onChange={(e) =>
            setUsuarioForm({ ...usuarioForm, rol: e.target.value })
          }
          className="border p-2 rounded col-span-1"
        >
          <option value="admin">Admin</option>
          <option value="empleado">Empleado</option>
          <option value="cliente">Cliente</option>
        </select>
        <button
          type="submit"
          className={`col-span-1 ${
            editando ? "bg-yellow-500" : "bg-green-600"
          } text-white rounded`}
        >
          {editando ? "Actualizar" : "Crear"}
        </button>
      </form>

      {/* Tabla de usuarios */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">ID</th>
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Correo</th>
            <th className="border p-2">Rol</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="hover:bg-gray-100">
              <td className="border p-2">{u.id}</td>
              <td className="border p-2">{u.nombre}</td>
              <td className="border p-2">{u.correo}</td>
              <td className="border p-2">{u.rol}</td>
              <td className="border p-2 space-x-2">
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                  onClick={() => editarUsuario(u)}
                >
                  Editar
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded"
                  onClick={() => eliminarUsuario(u.id)}
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
};

export default AdminPage;
