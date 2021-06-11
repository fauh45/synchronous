import { createServer } from "http";
import { Server } from "socket.io";
import { io as ioClient } from "socket.io-client";
import {
  MessageAll,
  MessageDevice,
  PublishMessage,
  UpdateSubscription,
  MESSAGE_EVENT,
  isObjectBase,
  ADD_DEVICE_EVENT,
  REMOVE_DEVICE_EVENT,
  AddDeviceMessage,
  RemoveDeviceMessage,
  DeviceMessage,
  CENTRAL_PASSTHROUGH_EVENT,
  CentralPassthroughMessage,
} from "@synchronous/common";
import {
  addDevice,
  addSubscriber,
  checkIfAuthorized,
  disconnectCleanup,
  getDeviceId,
  publishMessage,
  removeDevice,
  removeSubscriber,
  sendMessage,
  sendToCentralConnectionId,
  setConnectionId,
} from "./helper/common";
import Config from "./config";
import { logger } from "./helper/logger";

// Server instance
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  }
});

// Central client
const central_socket = ioClient(Config.server.central_server, {
  query: {
    location: Config.server.location,
  },
});

central_socket.on("connect", () => {
  logger.info("Connected to the central server");

  central_socket.on(ADD_DEVICE_EVENT, (params: AddDeviceMessage) => {
    logger.info(params, "Added device id " + params.device_id);
    addDevice(params.device_id, params.user_account);
  });

  central_socket.on(REMOVE_DEVICE_EVENT, (params: RemoveDeviceMessage) => {
    logger.info(params, "Removed device id " + params.device_id);
    removeDevice(params.device_id, params.user_account);
  });

  central_socket.on(
    CENTRAL_PASSTHROUGH_EVENT,
    (params: CentralPassthroughMessage) => {
      logger.info(params, "Sending message to " + params.to);

      const device_message: DeviceMessage = {
        from: params.user_account,
        connection_id: central_socket.id,
        message: params.message,
      };

      io.to(params.to).emit(MESSAGE_EVENT, device_message);
    }
  );
});

central_socket.on("connect_error", (err) => {
  logger.error(err, "Connecting to central server error");
});

io.use(async (socket, next) => {
  logger.info("New client : " + socket.id);
  const { auth } = socket.handshake;

  if (isObjectBase(auth)) {
    const is_authorized = await checkIfAuthorized(
      auth.device_id,
      auth.user_account
    );

    if (is_authorized) {
      logger.info(auth, "Client " + socket.id + " register with data");

      socket.join(auth.user_account);
      socket.join(auth.device_id);
      setConnectionId(auth.device_id, socket.id);

      next();
    } else {
      logger.info(auth, "Client " + socket.id + " is not authorized");
      next(new Error("Not Authorized"));
    }
  } else {
    logger.info(auth, "Client " + socket.id + " unknown auth data");
    next(new Error("Bad Authentication Data"));
  }
});

io.on("connection", (socket) => {
  socket.on("MessageDevice", async (params: MessageDevice) => {
    const { device_id, to_connection_id, message } = params;
    logger.debug(
      params,
      "Client " + socket.id + " messages " + to_connection_id
    );

    const device_message: DeviceMessage = {
      from: device_id,
      connection_id: socket.id,
      message: message,
    };

    sendMessage(to_connection_id, JSON.stringify(device_message));
    io.to(to_connection_id).emit(MESSAGE_EVENT, device_message);

    sendToCentralConnectionId(central_socket, to_connection_id, message);
  });

  socket.on("MessageAll", async (params: MessageAll) => {
    const { user_account, message } = params;
    logger.debug(params, "Client " + socket.id + " send broadcast");

    const device_id = await getDeviceId(socket.id);
    const message_subs: DeviceMessage = {
      from: device_id,
      connection_id: socket.id,
      message: message,
    };

    socket.to(user_account).emit(MESSAGE_EVENT, message_subs);
    central_socket.emit(MESSAGE_EVENT, message_subs);
  });

  socket.on("PublishMessage", (params: PublishMessage) => {
    const { message } = params;
    logger.debug(params, "Client " + socket.id + " published message");

    publishMessage(central_socket, io, socket.id, message);
  });

  socket.on("UpdateSubscription", (params: UpdateSubscription) => {
    const { action, to_connection_id } = params;
    logger.debug(
      params,
      "Client " + socket.id + " " + action + " to " + to_connection_id
    );

    switch (action) {
      case "SUBSCRIBE":
        addSubscriber(socket.id, to_connection_id);
        break;

      case "UNSUBSCRIBE":
        removeSubscriber(socket.id, to_connection_id);
        break;

      default:
        break;
    }
  });

  socket.on("disconnect", async () => {
    logger.info("Client " + socket.id + " disconnected");

    disconnectCleanup(socket.id);
    logger.info("Cleanup of client " + socket.id + " are done");
  });
});

io.listen(Config.server.port);

logger.info("Edge server is running at port " + Config.server.port + "...");
