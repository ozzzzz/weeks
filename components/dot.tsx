import Head from "next/head";
import Link from "next/link";

import styles from "./dot.module.css";

export default function Dot({ children }) {
  return <span className={styles.dot}>{children}</span>;
}
