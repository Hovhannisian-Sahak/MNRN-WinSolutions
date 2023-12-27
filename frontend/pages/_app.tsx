import { Container } from "react-bootstrap";
import Heading from "../components/shared/Heading";
import { Provider } from "../context";
import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import type { AppProps } from "next/app";
import { ToastProvider } from "react-toast-notifications";
import Header from "../components/shared/Header";
import Footer from "../components/shared/Footer";
export default function App({ Component, pageProps }: AppProps) {
  return (
    <Provider>
      <Heading />
      <Container>
        <ToastProvider>
          <Header />
          <Component {...pageProps} />
          <Footer />
        </ToastProvider>
      </Container>
    </Provider>
  );
}
