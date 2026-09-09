import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getCurrentUser,
  login as loginApi,
} from "./authApi";

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../../lib/auth";

import type { AuthUser } from "../../types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [token, setToken] = useState<string | null>(
    getAccessToken(),
  );

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const existingToken = getAccessToken();

    if (!existingToken) {
      setIsLoading(false);
      return;
    }

    getCurrentUser()
      .then((currentUser) => {
        setUser(currentUser);
        setToken(existingToken);
      })
      .catch(() => {
        clearAccessToken();
        setUser(null);
        setToken(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function login(
    email: string,
    password: string,
  ): Promise<AuthUser> {
    const response = await loginApi({
      email,
      password,
    });

    setAccessToken(response.access_token);
    setToken(response.access_token);

    const currentUser = await getCurrentUser();

    setUser(currentUser);

    return currentUser;
  }

  function logout() {
    clearAccessToken();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [user, token, isLoading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}