import Head from "next/head";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
// import DateFnsUtils from "@date-io/date-fns";
import DayjsUtils from "@date-io/dayjs";

const theme = createTheme({
  palette: {
    type: "light",
  },
});

export default function Layout({ children }) {
  return (
    <>
      <ThemeProvider theme={theme}>
        <MuiPickersUtilsProvider utils={DayjsUtils}>
          <Head>
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
            />
          </Head>
          <div>{children}</div>
        </MuiPickersUtilsProvider>
      </ThemeProvider>
    </>
  );
}
