import { SYNC_ROBOT_ID, SYNC_USER_ACCOUNT } from "@synchronous/common";

export default {
  server: "http://localhost:3000",
  connection: {
    device_id: SYNC_ROBOT_ID,
    user_account: SYNC_USER_ACCOUNT,
  },
};
