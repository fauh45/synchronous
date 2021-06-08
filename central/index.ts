import { createServer } from "http";
import { Server } from "socket.io";
import pino from "pino";
import {
  LOCATION,
  isValidLocation,
  ADD_DEVICE_EVENT,
  AddDeviceMessage,
  CENTRAL_MESSAGE_EVENT,
  CentralMessage,
  MESSAGE_EVENT,
} from "@synchronous/common";
import Config from "./config";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });

// Server instance
const httpServer = createServer();
const io = new Server(httpServer);

const region_server: Map<LOCATION, string> = new Map<LOCATION, string>();
const region_server_reverse: Map<string, LOCATION> = new Map<
  string,
  LOCATION
>();

const setRegionServer = (location: LOCATION, connection_id: string) => {
  region_server.set(location, connection_id);
  region_server_reverse.set(connection_id, location);
};

const unsetRegionServer = (connection_id: string) => {
  const location = region_server_reverse.get(connection_id);
  region_server_reverse.delete(connection_id);

  if (location != undefined) {
    region_server.delete(location);
  }
};

io.use((socket, next) => {
  const { query } = socket.handshake;

  if (query && isValidLocation(query.location)) {
    if (region_server.get(query.location) !== undefined)
      next(new Error("Double connection for one region"));

    setRegionServer(query.location, socket.id);

    logger.info(
      "Region " +
        query.location +
        " has connected with connection id " +
        socket.id
    );

    next();
  } else {
    logger.error(
      query,
      "Connection error of client " + socket.id + " unknown location"
    );
    next(new Error("Unknown location"));
  }
});

io.on("connection", (socket) => {
  const add_device_message: AddDeviceMessage = {
    device_id: "1000",
    user_account: "1",
  };

  socket.emit(ADD_DEVICE_EVENT, add_device_message);

  socket.on(CENTRAL_MESSAGE_EVENT, (params: CentralMessage) => {
    logger.info(params, "Got new message for " + params.to);
  });

  socket.on(MESSAGE_EVENT, (params: string) => {
    logger.info(params, "Got new message for all account");
  });

  socket.on("disconnect", () => {
    logger.info("Connection Id " + socket.id + " disconnected");

    unsetRegionServer(socket.id);
  });
});

io.listen(Config.server.port);

logger.info("Central server is running at port " + Config.server.port + "...");
