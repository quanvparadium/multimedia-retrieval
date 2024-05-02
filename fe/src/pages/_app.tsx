import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import Providers from "../Providers/Provider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  );
}
