import { Provider } from "../../context";
import "../../src/app/globals.css";
import type { AppProps } from "next/app";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <Component {...pageProps} />
    </Provider>
  );
}
