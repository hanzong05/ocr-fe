"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,        // ✅ add this
  ReactNode,
} from "react";
import { User, Notification, LcrRecord } from "@/lib/types";

interface AppState {
  isLoggedIn: boolean;
  user: User | null;
  notification: Notification | null;
  uploadedFiles: { cert: File[]; marriage: File[] };
  records: LcrRecord[];
  hydrated: boolean;   // ✅ add this
}

type Action =
  | { type: "LOGIN"; user: User }
  | { type: "LOGOUT" }
  | { type: "NOTIFY"; notification: Notification | null }
  | { type: "SET_FILES"; key: "cert" | "marriage"; files: File[] }
  | { type: "SET_RECORDS"; records: LcrRecord[] }
  | { type: "SET_HYDRATED" };   // ✅ add this

const initial: AppState = {
  isLoggedIn: false,
  user: null,
  notification: null,
  uploadedFiles: { cert: [], marriage: [] },
  records: [],
  hydrated: false,   // ✅ add this
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, isLoggedIn: true, user: action.user, hydrated: true };
    case "LOGOUT":
      return { ...initial, hydrated: true };
    case "NOTIFY":
      return { ...state, notification: action.notification };
    case "SET_FILES":
      return {
        ...state,
        uploadedFiles: { ...state.uploadedFiles, [action.key]: action.files },
      };
    case "SET_RECORDS":
      return { ...state, records: action.records };
    case "SET_HYDRATED":                              // ✅ add this
      return { ...state, hydrated: true };
    default:
      return state;
  }
}

interface AppContextValue extends AppState {
  login: (user: User) => void;
  logout: () => void;
  notify: (message: string, type: Notification["type"]) => void;
  setFiles: (key: "cert" | "marriage", files: File[]) => void;
  setRecords: (records: LcrRecord[]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // ✅ Rehydrate user from cookie on every page load
  useEffect(() => {
    fetch('/api/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          dispatch({ type: 'LOGIN', user: data.user })
        } else {
          dispatch({ type: 'SET_HYDRATED' })
        }
      })
      .catch(() => dispatch({ type: 'SET_HYDRATED' }))
  }, [])

  const login = useCallback(
    (user: User) => dispatch({ type: "LOGIN", user }),
    [],
  );
  const logout = useCallback(() => dispatch({ type: "LOGOUT" }), []);
  const notify = useCallback((message: string, type: Notification["type"]) => {
    dispatch({ type: "NOTIFY", notification: { message, type } });
    setTimeout(() => dispatch({ type: "NOTIFY", notification: null }), 4000);
  }, []);
  const setFiles = useCallback(
    (key: "cert" | "marriage", files: File[]) =>
      dispatch({ type: "SET_FILES", key, files }),
    [],
  );
  const setRecords = useCallback(
    (records: LcrRecord[]) => dispatch({ type: "SET_RECORDS", records }),
    [],
  );

  // ✅ Don't render children until session is rehydrated
  if (!state.hydrated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f6f9'
      }}>
        <div style={{ textAlign: 'center', color: '#2e7d32' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="#2e7d32">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
          </svg>
          <p style={{ marginTop: 12, fontWeight: 600, fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <AppContext.Provider
      value={{ ...state, login, logout, notify, setFiles, setRecords }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}