import { Box, Typography } from "@material-ui/core";
import React from "react";
interface LoadingBodyProps {}

const LoadingBody = (props: LoadingBodyProps): JSX.Element => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      marginTop={10}
    >
      <Typography variant="h5" align="center">
        Preparing your delivery...
      </Typography>
    </Box>
  );
};

export default LoadingBody;
