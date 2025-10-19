import { supabase } from "../supabase/supabaseClient";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user, role } = useContext(AuthContext);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="bg-gradient-to-r from-pink-400 via-yellow-300 to-teal-400 shadow-lg p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* LOGO / NOMBRE */}
        <div className="text-2xl font-extrabold text-white drop-shadow-lg tracking-wide flex items-center gap-2">
          🍧 <span className="font-poppins">Heladería Copo Andino</span>
        </div>

        {/* LINKS */}
        <div className="space-x-4 flex items-center">
          <Link
            to="/"
            className="text-white font-semibold hover:text-pink-100 transition duration-200"
          >
            Inicio
          </Link>

          {/* ADMIN */}
          {role === "admin" && (
            <>
              <Link
                to="/admin"
                className="text-white font-semibold hover:text-yellow-100 transition duration-200"
              >
                Administrar
              </Link>
              <Link
                to="/productos"
                className="text-white font-semibold hover:text-yellow-100 transition duration-200"
              >
                Productos
              </Link>
              <Link
                to="/rentabilidad"
                className="text-white font-semibold hover:text-yellow-100 transition duration-200"
              >
                Rentabilidad
              </Link>
              <Link
                to="/ventas"
                className="text-white font-semibold hover:text-yellow-100 transition duration-200"
              >
                Ventas
              </Link>
            </>
          )}

          {/* EMPLEADO */}
          {role === "empleado" && (
            <>
              <Link
                to="/ventas"
                className="text-white font-semibold hover:text-teal-100 transition duration-200"
              >
                Ventas
              </Link>
            </>
          )}

          {/* CLIENTE */}
          {role === "cliente" && (
            <>
              <Link
                to="/ventas"
                className="text-white font-semibold hover:text-pink-100 transition duration-200"
              >
                Ventas
              </Link>
            </>
          )}

          {/* SESIÓN */}
          {user ? (
            <>
              <Link
                to="/profile"
                className="text-white font-semibold hover:text-indigo-100 transition duration-200"
              >
                Perfil
              </Link>
              <button
                onClick={handleLogout}
                className="bg-white text-pink-500 font-bold px-3 py-1 rounded-full shadow-md hover:bg-pink-100 transition duration-200"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-white text-teal-600 font-bold px-3 py-1 rounded-full shadow-md hover:bg-teal-100 transition duration-200"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
