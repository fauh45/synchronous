import { Server } from "socket.io";
import { Socket } from "socket.io-client";
import { getDeviceId, getSubscriber, sendMessage } from "./redis";
import { sendToCentral, sendToSubscriber } from "./socket";

const publishMessage = async (
  central_socket: Socket,
  io: Server,
  connection_id: string,
  message: string
) => {
  const device_id = await getDeviceId(connection_id);
  sendMessage(connection_id, message);

  const subsribers = await getSubscriber(connection_id);
  sendToSubscriber(io, subsribers, device_id, connection_id, message);

  subsribers.forEach((subscriber_connection_id) => {
    sendToCentralConnectionId(
      central_socket,
      subscriber_connection_id,
      message
    );
  });
};

const sendToCentralConnectionId = async (
  central_socket: Socket,
  connection_id: string,
  message: string
) => {
  const device_id = await getDeviceId(connection_id);

  sendToCentral(central_socket, device_id, message);
};

export * from "./redis";
export * from "./socket";
export { publishMessage, sendToCentralConnectionId };
