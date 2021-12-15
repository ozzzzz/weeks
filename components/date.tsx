import React from "react";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from "@material-ui/pickers";

interface DateProp {
  selected: any;
  update: (value: any) => any;
}

export default function Date(prop: DateProp): JSX.Element {
  return (
    <KeyboardDatePicker
      disableToolbar
      variant="inline"
      format="DD/MM/YYYY"
      margin="normal"
      id="date-picker-inline"
      label="Date of birth"
      value={prop.selected}
      onChange={prop.update}
      KeyboardButtonProps={{
        "aria-label": "change date",
      }}
    />
  );
}
