"use client";

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from "react";
import { User, Notification, LcrRecord } from "@/lib/types";

interface AppState {
  isLoggedIn: boolean;
  user: User | null;
  notification: Notification | null;
  uploadedFiles: { cert: File[]; marriage: File[] };
  records: LcrRecord[];
}

type Action =
  | { type: "LOGIN"; user: User }
  | { type: "LOGOUT" }
  | { type: "NOTIFY"; notification: Notification | null }
  | { type: "SET_FILES"; key: "cert" | "marriage"; files: File[] }
  | { type: "SET_RECORDS"; records: LcrRecord[] };

const initial: AppState = {
  isLoggedIn: false,
  user: null,
  notification: null,
  uploadedFiles: { cert: [], marriage: [] },
  records: [],
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "LOGIN":
      return { ...state, isLoggedIn: true, user: action.user };
    case "LOGOUT":
      return { ...initial };
    case "NOTIFY":
      return { ...state, notification: action.notification };
    case "SET_FILES":
      return {
        ...state,
        uploadedFiles: { ...state.uploadedFiles, [action.key]: action.files },
      };
    case "SET_RECORDS":
      return { ...state, records: action.records };
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
