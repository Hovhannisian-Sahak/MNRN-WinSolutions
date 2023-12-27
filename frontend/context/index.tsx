import { useReducer, createContext, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { response } from "express";
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
  const [state, dispatch] = useReducer(userReducer, initialState);
  const router = useRouter();
  useEffect(() => {
    dispatch({
      type: "LOGIN",
      payload: JSON.parse(localStorage.getItem("_user") || "{}"),
    });
  }, []);
  // axios.interceptors.response.use(
  //   (response) => {
  //     console.log("success", response);
  //   },
  //   (error) => {
  //     console.log("fail", error);
  //   }
  // );
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      let res = error.response;
      if (
        res &&
        res.status === 401 &&
        res.config &&
        !res.config.__isRetryRequest
      ) {
        return new Promise((resolve, reject) => {
          axios
            .put("/api/v1/users/logout")
            .then((data) => {
              console.log("/401 error > logout");
              dispatch({
                type: "LOGOUT",
                payload: undefined,
              });
              localStorage.removeItem("_user");
              router.push("/auth");
            })
            .catch((err) => {
              console.error(err);
              console.log("AXIOS INTERCEPTORS ERR", err);
              reject(error);
            });
        });
      }

      // If 'error.response' is not defined, handle the error accordingly
      if (!error.response) {
        // Handle the scenario when 'error.response' is undefined
        console.error("Error response is undefined:", error);
        // You can choose to reject the promise or handle it in another way
      }

      return Promise.reject(error);
    }
  );

  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const res = await fetch("/api/v1/csrf-token");
        console.log("Response Data:", res);

        if (!res.ok) {
          // Check if the response is successful
          throw new Error(
            `Failed to fetch CSRF Token (${res.status}): ${res.statusText}`
          );
        }

        const data = await res.json(); // Wait for the JSON data
        const csrfToken = data?.csrfToken;

        if (!csrfToken) {
          throw new Error("CSRF Token not found");
        }

        axios.defaults.headers.common["X-CSRF-TOKEN"] = csrfToken;
        console.log("CSRF Token", csrfToken, axios.defaults.headers);
      } catch (error) {
        console.error("Error fetching CSRF Token:", error);
      }
    };

    getCsrfToken();
  }, []);

  return (
    <Context.Provider value={{ state, dispatch }}>{children}</Context.Provider>
  );
};
export { Context, Provider };
