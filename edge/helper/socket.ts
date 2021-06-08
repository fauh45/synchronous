import { Server } from "socket.io";
import { Socket } from "socket.io-client";
import {
  CentralMessage,
  CENTRAL_MESSAGE_EVENT,
  MESSAGE_SUBSCRIPTION_EVENT,
  SubscriptionMessage,
} from "@synchronous/common";

const sendToSubscriber = (
  io: Server,
  subsribers: string[],
  device_id: string,
  connection_id: string,
  message: string
) => {
  const message_subscription: SubscriptionMessage = {
    from: device_id,
    connection_id: connection_id,
    message: message,
  };

  io.to(subsribers).emit(MESSAGE_SUBSCRIPTION_EVENT, message_subscription);
};

const sendToCentral = async (
  central_socket: Socket,
  to_device_id: string,
  message: string
) => {
  const message_central: CentralMessage = {
    to: to_device_id,
    message: message,
  };

  central_socket.emit(CENTRAL_MESSAGE_EVENT, message_central);
};

export { sendToSubscriber, sendToCentral };
