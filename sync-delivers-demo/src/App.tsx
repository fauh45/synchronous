import "@fontsource/roboto";
import {
  Box,
  Button,
  createMuiTheme,
  ThemeProvider,
  Typography,
} from "@material-ui/core";
import React from "react";
import LoadingBody from "./LoadingBody";
import LoginBody from "./LoginBody";
import TrackingScreen from "./TrackingScreen";

const theme = createMuiTheme({
  palette: {
    primary: {
      light: "#ffffff",
      dark: "#ccbca9",
      main: "#ffeedb",
      contrastText: "#000000",
    },
    secondary: {
      light: "#48a999",
      dark: "#004c40",
      main: "#00796b",
      contrastText: "#ffffff",
    },
  },
});

enum STATUS {
  LoggedOut,
  WaitingForServer,
  Tracking,
  Done,
}

function App() {
  const [status, setStatus] = React.useState<STATUS>(STATUS.LoggedOut);

  const loginHandler = (event: { username: string; password: string }) => {
    console.log(event);

    setStatus(STATUS.WaitingForServer);
  };

  const handleTrackingInfo = async () => {
    const repsonse = await fetch(
      "https://jsonplaceholder.typicode.com/todos/1"
    );
    console.log(await repsonse.json());

    setStatus(STATUS.Tracking);
  };

  const handleDone = () => {
    setStatus(STATUS.Done);
  };

  React.useEffect(() => {
    if (status === STATUS.WaitingForServer) {
      handleTrackingInfo();
    } else if (status === STATUS.Done) {
      alert("Delivery is done");
      setStatus(STATUS.LoggedOut);
    }
  }, [status]);

  const drawOnStatus: Map<STATUS, JSX.Element> = new Map();
  drawOnStatus.set(STATUS.LoggedOut, <LoginBody loginHandler={loginHandler} />);
  drawOnStatus.set(STATUS.WaitingForServer, <LoadingBody />);
  drawOnStatus.set(
    STATUS.Tracking,
    <TrackingScreen doneHandler={handleDone} />
  );

  return (
    <ThemeProvider theme={theme}>
      <Box width={1} height={1}>
        <Box height="100vh" minWidth="320px" maxWidth="768px" margin="0 auto">
          <Box
            display="flex"
            bgcolor="primary.main"
            padding={2}
            flexDirection="row"
            justifyContent="space-between"
          >
            <Typography variant="h5">
              <b>Sync Delivers</b>
            </Typography>
            <Box alignSelf="flex-end">
              {status !== STATUS.LoggedOut ? (
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => setStatus(STATUS.LoggedOut)}
                >
                  Logout
                </Button>
              ) : null}
            </Box>
          </Box>

          <Box padding={1} height={1}>
            {drawOnStatus.get(status)}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
