import React, { createContext, useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("public");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      setUser(currentUser);

      if (currentUser?.email) {
        const { data, error } = await supabase
          .from("users")
          .select("rol, correo")
          .eq("correo", currentUser.email)
          .single();
        if (!error && data?.rol) setRole(data.rol);
        else setRole("cliente");
      } else {
        setRole("public");
      }

      setLoading(false);
    };

    init();

    // Escuchar cambios de sesión en tiempo real
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const u = session?.user || null;
        setUser(u);

        if (u?.email) {
          const { data, error } = await supabase
            .from("users")
            .select("rol, correo")
            .eq("correo", u.email)
            .single();
          if (!error && data?.rol) setRole(data.rol);
          else setRole("cliente");
        } else {
          setRole("public");
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
