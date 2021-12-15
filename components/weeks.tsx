import Head from "next/head";
import Link from "next/link";
import Dot from "./dot";
import Date from "./date";

import React from "react";
import { Grid } from "@material-ui/core";


export default function Weeks(props) {
  const [birth, setBirth] = React.useState<any>(null);
  return (
    <>
      <Head>
        <title>Weeks</title>
      </Head>
      <>
      <Date selected={birth} update={setBirth} />
      {/* <Grid container spacing={3}>
        <Grid item xs>
          xs
        </Grid>
        <Grid item xs>
          1
        </Grid>
        <Grid item xs>
          2
        </Grid>
      </Grid> */}

        {/* <Box m={2} sx={{ display: "grid" }}>
        
        
        </Box>
        <Box sx={{ display: "inline-grid" }}>
          <Button variant="contained">Hello World</Button>;{generateCircles(25)}
        </Box> */}
      </>
    </>
  );
}

function generateCircles(total: number) {
  return Array.from({ length: total }, (x, i) => <Dot>{i.toString()}</Dot>);
}
