import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { loginRequest, logoutRequest, meRequest, registerRequest } from "../api/auth";
import { setAccessToken } from "../api/client";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [bootstrapDone, setBootstrapDone] = useState(false);
  const [user, setUser] = useState(null);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: meRequest,
    enabled: !!localStorage.getItem("accessToken"),
    retry: false
  });

  useEffect(() => {
    if (meQuery.isSuccess) {
      setUser(meQuery.data?.user ?? null);
      setBootstrapDone(true);
    }
  }, [meQuery.isSuccess, meQuery.data]);

  useEffect(() => {
    if (meQuery.isError) {
      setAccessToken("");
      setUser(null);
      setBootstrapDone(true);
    }
  }, [meQuery.isError]);

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) {
      setBootstrapDone(true);
    }
  }, []);

  const login = async (payload) => {
    const data = await loginRequest(payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await registerRequest(payload);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await logoutRequest();
    setAccessToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isBootstrapping: !bootstrapDone,
      login,
      register,
      logout
    }),
    [user, bootstrapDone]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};
