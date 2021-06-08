// Edge server configurations
import { LOCATION } from "@synchronous/common";

export default {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
  server: {
    port: 3000,
    central_server: "http://localhost:58008",
    location: LOCATION.LA,
  },
};
