import { io } from "socket.io-client";
import {
  MessageAll,
  MESSAGE_EVENT,
  MESSAGE_SUBSCRIPTION_EVENT,
  PublishMessage,
  SubscriptionMessage,
} from "@synchronous/common";
import Config from "./config";

const device_info = {
  device_id: "1000",
  user_account: "1",
};

const socket = io(Config.server, {
  auth: device_info,
});

socket.on("connect", () => {
  console.log("Connected");

  const message_all: MessageAll = {
    device_id: "1000",
    user_account: "1",
    message: JSON.stringify({
      type: "location",
      lat: 14.07035,
      lon: -100.26841,
    }),
  };

  const publish_message: PublishMessage = {
    device_id: "1000",
    user_account: "1",
    message: JSON.stringify({
      type: "status",
      open: false,
    }),
  };

  socket.emit("MessageAll", message_all);
  socket.emit("PublishMessage", publish_message);

  socket.on(MESSAGE_EVENT, (data: string) => {
    console.log(data);
  });

  socket.on(MESSAGE_SUBSCRIPTION_EVENT, (data: SubscriptionMessage) => {
    console.log(data);
  });
});

socket.on("connect_error", (error) => {
  console.error(error);
});
