import Head from "next/head";
import Dots from "../utils/Dots";
import Datepicker from "../utils/Datepicker";

import React from "react";
import { Box, Grid, Paper } from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import dayjs, { Dayjs } from "dayjs";
import Userdata from "../../utils/userdata";
import InfoCard from "../utils/InfoCard";
import Timeline from "../utils/Timeline";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    margin: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
}));

// function generateDots(total: number, isBehind: boolean) {
//   return Array.from({ length: total }, (x, i) => <Dot key={i} isBehind={isBehind}/>);
// }

export default function Weeks(): JSX.Element {
  const classes = useStyles();
  const [birth, setBirth] = React.useState<Dayjs>(dayjs("2000-01-01"));

  const userdata: Userdata = new Userdata(birth.toDate());

  const controls = (
      <Datepicker selected={birth} update={setBirth} />
  );

  const cards = (
    <>
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <Paper className={classes.paper}>
            <InfoCard counter={userdata.getWeeksBehind()} text="weeks behind" />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Paper className={classes.paper}>
            <InfoCard counter={userdata.getWeeksLeft()} text="weeks left" />
          </Paper>
        </Grid>
      </Grid>
    </>
  );

  const dots = (
      <Dots userdata={userdata} />
  );

  // var now = new Date();
  // const livedMilliseconds = now.getTime() - birth.toDate().getTime();
  // const livedWeeks = Math.floor(livedMilliseconds / (1000 * 60 * 60 * 24 * 7));

  return (
    <>
      <Head>
        <title>Weeks</title>
      </Head>
      <>
        {controls}
        <Timeline userdata={userdata} />
        <Box>&nbsp;</Box>
        {/* {cards} */}
        {dots}
      </>
    </>
  );
}
