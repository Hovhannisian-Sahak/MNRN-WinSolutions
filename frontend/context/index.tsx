import { useReducer, createContext, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import axios from "axios";
interface Props {
  children: React.ReactNode;
}
const initialState = {
  user: null,
};

interface Context {
  state: Record<string, any>;
  dispatch: (action: { type: string; payload: any }) => void;
}
const initialContext: Context = {
  state: initialState,
  dispatch: () => null,
};
const Context = createContext<Context>(initialContext);

const userReducer = (
  state: Record<string, any>,
  action: { type: string; payload: any }
) => {
  switch (action.type) {
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, user: null };
    case "UPDATE_USER":
      return { ...state, user: action.payload };
    default:
      return state;
  }
};
const Provider = ({ children }: Props) => {
  const dispatch = useDispatch();
  const [state, reducer] = useReducer(userReducer, initialState);
  const router = useRouter();
  useEffect(() => {
    dispatch({
      type: "LOGIN",
      payload: localStorage.getItem("_user")
        ? JSON.parse(localStorage.getItem("_user") || "{}")
        : null,
    });
  }, []);
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (error.response.status === 401) {
        return new Promise((resolve, reject) => {
          axios
            .put("/api/v1/users/logout")
            .then((res) => {
              dispatch({
                type: "LOGOUT",
                payload: null,
              });
              localStorage.removeItem("_user");
            })
            .catch((err) => {
              reject(err);
            });
        });
      }
    }
  );

  useEffect(() => {
    const getCSRF_token = async () => {
      const { data } = await axios.get("/api/v1/csrf-token");
      axios.defaults.headers["X-CSRF-TOKEN"] = data.csrfToken;
    };
    getCSRF_token();
  }, []);
  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
};
export { Context, Provider };
