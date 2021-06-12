import "@fontsource/roboto";
import {
  Box,
  Button,
  Collapse,
  createMuiTheme,
  IconButton,
  ThemeProvider,
  Typography,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import CloseIcon from "@material-ui/icons/Close";
import React from "react";
import LoadingBody from "./LoadingBody";
import LoginBody from "./LoginBody";
import TrackingScreen from "./TrackingScreen";
import Config from "./config";
import { AuthResponse } from "../../common/build";

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
  const [authError, setAuthError] = React.useState(false);
  const [edgeInfo, setEdgeInfo] = React.useState<AuthResponse>({
    device_id: "",
    robot_device_id: "",
    server_url: "",
    user_account: "",
  });

  // Not so elegant way to make sure it never be empty

  const loginHandler = async (event: {
    username: string;
    password: string;
  }) => {
    const response = await fetch(Config.central_server + "/auth", {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });

    if (response.status === 200) {
      setEdgeInfo(await response.json());
      console.log(edgeInfo);

      setAuthError(false);
      setStatus(STATUS.WaitingForServer);

      return;
    }

    setAuthError(true);
  };

  const handleTrackingInfo = async () => {
    // Should be where it get the data from the central server
    // Now it has been changed to get data from the auth
    // So now it does nothing, and I'm too lazy to remove it
    // :P
    setTimeout(() => {
      setStatus(STATUS.Tracking);
    }, 150);
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
    <TrackingScreen doneHandler={handleDone} {...edgeInfo} />
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

          <Collapse in={authError}>
            <Alert
              action={
                <IconButton
                  aria-label="close"
                  color="secondary"
                  size="small"
                  onClick={() => {
                    setAuthError(false);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
              severity="warning"
              variant="filled"
            >
              Authentication Error, please try again!
            </Alert>
          </Collapse>

          <Box padding={1} height={1}>
            {drawOnStatus.get(status)}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;
