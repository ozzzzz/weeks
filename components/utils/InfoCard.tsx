import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CardContent, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 400,
  },
}));

interface InfoCardProp {
  counter: number;
  text: string;
}

export default function InfoCard(prop: InfoCardProp): JSX.Element {
  const classes = useStyles();

  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {prop.counter} {prop.text}
      </Typography>
    </>
  );
}
