import "../styles/global.css";
import Layout from "../components/global/Layout";

export default function App({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps}></Component>
    </Layout>
  );
}
