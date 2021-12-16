import Head from "next/head";
import { createTheme, ThemeProvider } from "@material-ui/core/styles";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DayjsUtils from "@date-io/dayjs";
import CssBaseline from "@material-ui/core/CssBaseline";
import { Container } from "@material-ui/core";

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
          <CssBaseline>
            <Head>
              <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
              />
            </Head>
            <Container>{children}</Container>
          </CssBaseline>
        </MuiPickersUtilsProvider>
      </ThemeProvider>
    </>
  );
}
