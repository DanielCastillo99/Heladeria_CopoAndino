import React, { useEffect, useState } from "react";
import { supabase } from "../supabase/supabaseClient";

const Profile = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    obtenerUsuarioActual();
  }, []);

  async function obtenerUsuarioActual() {
    setLoading(true);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error(authError);
      setLoading(false);
      return;
    }

    if (!user) {
      setLoading(false);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, correo, rol")
      .eq("auth_id", user.id)
      .single();

    if (userError) console.error(userError);
    else setUsuario(userData);

    setLoading(false);
  }

  async function actualizarContraseña(e) {
    e.preventDefault();
    if (!nuevaContraseña) return;

    const { error } = await supabase.auth.updateUser({
      password: nuevaContraseña,
    });

    if (error) {
      alert("Error al actualizar la contraseña: " + error.message);
    } else {
      alert("Contraseña actualizada correctamente");
      setEditando(false);
      setNuevaContraseña("");
    }
  }

  function letraRol(rol) {
    switch (rol) {
      case "cliente":
        return "C";
      case "empleado":
        return "E";
      case "admin":
        return "A";
      default:
        return "?";
    }
  }

  if (loading) return <p>Cargando perfil...</p>;
  if (!usuario) return <p>No se encontró el usuario.</p>;

  return (
    <div className="p-6 max-w-md mx-auto border rounded shadow">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-bold mr-4">
          {letraRol(usuario.rol)}
        </div>
        <div>
          <h2 className="text-xl font-semibold">{usuario.correo}</h2>
          <p className="text-gray-500">Rol: {usuario.rol}</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-medium mb-1">Contraseña</label>
        <input
          type={editando ? "text" : "password"}
          value={editando ? nuevaContraseña : "********"}
          readOnly={!editando}
          onChange={(e) => setNuevaContraseña(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {editando ? (
        <div className="flex gap-2">
          <button
            onClick={actualizarContraseña}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Guardar
          </button>
          <button
            onClick={() => {
              setEditando(false);
              setNuevaContraseña("");
            }}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setEditando(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Cambiar Contraseña
        </button>
      )}
    </div>
  );
};

export default Profile;
