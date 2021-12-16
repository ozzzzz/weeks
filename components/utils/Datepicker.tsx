import React, { Dispatch, SetStateAction } from "react";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { Dayjs } from "dayjs";

interface DateProp {
  selected: Dayjs;
  update: Dispatch<SetStateAction<Dayjs>>;
}

export default function DatePicker(prop: DateProp): JSX.Element {
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
