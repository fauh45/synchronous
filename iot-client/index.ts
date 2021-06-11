import { io } from "socket.io-client";
import {
  DeviceMessage,
  MessageAll,
  MESSAGE_EVENT,
  MESSAGE_SUBSCRIPTION_EVENT,
  SubscriptionMessage,
  SYNC_ROBOT_ID,
  SYNC_USER_ACCOUNT,
} from "@synchronous/common";
import pino from "pino";
import fs from "fs";
import Config from "./config";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

const socket = io(Config.server, {
  auth: Config.connection,
});

const location: number[][] = JSON.parse(
  fs.readFileSync("./location.json", "utf-8")
);
const location_length = location.length;

let location_index = 0;
let moving = false;

socket.on("connect", () => {
  logger.info("Connected to edge");

  const message_all: MessageAll = {
    device_id: SYNC_ROBOT_ID,
    user_account: SYNC_USER_ACCOUNT,
    message: JSON.stringify({
      type: "status",
      status: "ready",
    }),
  };
  socket.emit("MessageAll", message_all);

  socket.on(MESSAGE_EVENT, (data: DeviceMessage) => {
    logger.info(data);
    const message = JSON.parse(data.message);

    if (data.from === SYNC_USER_ACCOUNT) {
      if (message.type === "order" && message.order === "start") {
        location_index = 0;
        moving = true;

        sendLocation();
      }
    }

    if (message.type === "order" && message.order === "open") {
      socket.emit("MessageAll", {
        device_id: SYNC_ROBOT_ID,
        user_account: SYNC_USER_ACCOUNT,
        message: JSON.stringify({
          type: "status",
          status: "open",
        }),
      });
    }
  });

  socket.on(MESSAGE_SUBSCRIPTION_EVENT, (data: SubscriptionMessage) => {
    logger.info(data);
  });
});

const sendLocation = () => {
  let location_sender_timeout = setTimeout(() => locationSender(), 1000);
  const locationSender = () => {
    if (location_index < location_length) {
      socket.emit("MessageAll", {
        device_id: SYNC_ROBOT_ID,
        user_account: SYNC_USER_ACCOUNT,
        message: JSON.stringify({
          type: "location",
          location: location[location_index],
        }),
      });

      location_index++;
      location_sender_timeout = setTimeout(() => locationSender(), 1000);
    } else {
      socket.emit("MessageAll", {
        device_id: SYNC_ROBOT_ID,
        user_account: SYNC_USER_ACCOUNT,
        message: JSON.stringify({
          type: "status",
          status: "arrived",
        }),
      });

      moving = false;
    }
  };
};
socket.on("connect_error", (error) => {
  logger.error(error, "Got an error");
});
