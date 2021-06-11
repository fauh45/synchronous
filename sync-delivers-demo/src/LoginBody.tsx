import { Box, Button, TextField, Typography } from "@material-ui/core";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";

interface LoginBodyProps {
  loginHandler(event: { username: string; password: string }): void;
}

const validationSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const LoginBody = (props: LoginBodyProps): JSX.Element => {
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: props.loginHandler,
  });

  return (
    <Box
      flex
      flexDirection="column"
      justifyContent="center"
      maxWidth="375px"
      margin="0 auto"
      height={1}
    >
      <Typography variant="h6">Welcome Back</Typography>
      <form onSubmit={formik.handleSubmit}>
        <Box flex flexDirection="column" marginTop={1} height={1}>
          <Box flex paddingBottom={1}>
            <TextField
              id="username"
              name="username"
              label="Username"
              variant="outlined"
              fullWidth
              value={formik.values.username}
              onChange={formik.handleChange}
              error={formik.touched.username && Boolean(formik.errors.username)}
              helperText={formik.touched.username && formik.errors.username}
            />
          </Box>
          <Box flex paddingBottom={2}>
            <TextField
              id="password"
              name="password"
              label="Password"
              variant="outlined"
              type="password"
              fullWidth
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
          </Box>

          <Button type="submit" variant="contained" color="secondary" fullWidth>
            Login
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default LoginBody;
