import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  Card,
  CardContent,
  Container,
  Typography,
} from "@material-ui/core";

import Userdata from "../../utils/userdata";
import variables from "../../styles/variables.module.scss";

const useStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 400,
  },
  timeline: {
    //   fontSize: theme.typography.h3(1)
  },
}));

interface TimelineProp {
  userdata: Userdata;
}

export default function Timeline(prop: TimelineProp): JSX.Element {
  const classes = useStyles();

  const percents = prop.userdata.getBehindAndLeftPercents();

  const behindText = `${prop.userdata.getWeeksBehind()} weeks behind`;
  const leftText = `~${prop.userdata.getWeeksLeft()} weeks left`;

  const behindStyle = {
    width: `${percents[0]}%`,
    display: "inline-block",
    backgroundColor: variables.behindColor,
  };

  const leftStyle = {
    width: `${percents[1]}%`,
    display: "inline-block",
    backgroundColor: variables.leftColor,
  };

  return (
    <Box>
      <span>
        <Typography variant="h4" style={{ display: "inline", color: variables.behindColor }}>
          {behindText}
        </Typography>
        <Typography variant="h4" style={{ float: "right", display: "inline" }}>
          {leftText}
        </Typography>
        {/* <span style={{ float: "right" }}>{leftText}</span> */}
      </span>
      <Box>
        <span style={{ fontSize: "2px" }}>
          <div style={behindStyle}>&nbsp;</div>
          <div style={leftStyle}>&nbsp;</div>
        </span>
      </Box>
    </Box>
  );
}
