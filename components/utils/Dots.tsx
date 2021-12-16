import { makeStyles } from "@material-ui/core/styles";
import Head from "next/head";
import Link from "next/link";
import Userdata from "../../utils/userdata";

import styles from "./Dots.module.css";

// const useStyles = makeStyles((theme) => ({
//   root: {
//     height: theme.spacing(1),
//     width: theme.spacing(1),
//     display: "inline-block",
//     borderRadius: 50,
//   },
//   behind: {
//     backgroundColor: theme.palette.text.secondary,
//   },
//   left: {
//     backgroundColor: theme.palette.text.primary,
//   },
// }));

// root: {
//   flexGrow: 1,
//   margin: theme.spacing(2),
// },
// paper: {
//   padding: theme.spacing(2),
//   textAlign: "center",
//   color: theme.palette.text.secondary,
// },
// }));

interface DotsProp {
  userdata: Userdata;
}

export default function Dots(prop: DotsProp) {
  // const classes = useStyles();

  const dotBehind = (
    <span className={`${styles.dot} ${styles.isBehind}`}>&nbsp;</span>
  );
  const dotLeft = (
    <span className={`${styles.dot} ${styles.isLeft}`}>&nbsp;</span>
  );

  const dotsBehind = Array.from(
    { length: prop.userdata.getWeeksBehind() },
    (x, i) => dotBehind
  );

  const dotsLeft = Array.from(
    { length: prop.userdata.getWeeksLeft() },
    (x, i) => dotLeft
  );

  return (
    <>
      {dotsBehind}
      {dotsLeft}
    </>
  );
}
