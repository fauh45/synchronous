import { createServer } from "http";
import express from "express";
import { Server } from "socket.io";
import pino from "pino";
import expressPino from "express-pino-logger";
import cors from "cors";
import {
  LOCATION,
  isValidLocation,
  ADD_DEVICE_EVENT,
  AddDeviceMessage,
  CENTRAL_MESSAGE_EVENT,
  CentralMessage,
  MESSAGE_EVENT,
  SYNC_USER_ACCOUNT,
  SYNC_ROBOT_ID,
  AuthRequest,
  AuthResponse,
  CloseRequest,
  REMOVE_DEVICE_EVENT,
  RemoveDeviceMessage,
  CENTRAL_PASSTHROUGH_EVENT,
  CentralPassthroughMessage,
} from "@synchronous/common";
import Config from "./config";
import { getRandomDeviceId, isAuthDataValid } from "./authHandler";

const logger = pino({ level: process.env.LOG_LEVEL || "info" });
const expressLogger = expressPino({
  logger: logger,
});

// Server instance
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(cors());
app.use(express.json());
app.use(expressLogger);

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
    device_id: SYNC_ROBOT_ID,
    user_account: SYNC_USER_ACCOUNT,
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

// Sync Delivers HTTP Endpoint
app.post(
  "/auth",
  (
    req: express.Request<{}, AuthResponse, AuthRequest>,
    res: express.Response<AuthResponse>
  ) => {
    const { password, username } = req.body;
    req.log.info(
      "Got auth request, username : " + username + " password : " + password
    );

    if (isAuthDataValid(username, password)) {
      const device_id = "DEVICE-" + getRandomDeviceId();

      const add_device_message: AddDeviceMessage = {
        device_id: device_id,
        user_account: SYNC_USER_ACCOUNT,
      };

      const LA_connection = region_server.get(LOCATION.LA);

      if (LA_connection !== undefined) {
        io.to(LA_connection).emit(ADD_DEVICE_EVENT, add_device_message);

        const central_passthrough_message: CentralPassthroughMessage = {
          to: SYNC_ROBOT_ID,
          user_account: SYNC_USER_ACCOUNT,
          message: JSON.stringify({
            type: "order",
            order: "start",
          }),
        };

        io.to(LA_connection).emit(
          CENTRAL_PASSTHROUGH_EVENT,
          central_passthrough_message
        );
      } else {
        logger.error("Connection " + LOCATION.LA + " is not found");

        return res.status(500).send();
      }

      // Harcoded location for now
      return res.send({
        user_account: SYNC_USER_ACCOUNT,
        device_id: device_id,
        robot_device_id: SYNC_ROBOT_ID,
        server_url: Config.server.edge.LA,
      });
    }

    return res.status(401).send();
  }
);

app.post(
  "/close",
  (req: express.Request<{}, {}, CloseRequest>, res: express.Response<{}>) => {
    const { password, username, device_id } = req.body;

    if (isAuthDataValid(username, password)) {
      const remove_device_message: RemoveDeviceMessage = {
        device_id: device_id,
        user_account: SYNC_USER_ACCOUNT,
      };

      const LA_connection = region_server.get(LOCATION.LA);

      if (LA_connection !== undefined) {
        io.to(LA_connection).emit(REMOVE_DEVICE_EVENT, remove_device_message);

        return res.status(200).send();
      } else {
        logger.warn("Connection " + LOCATION.LA + " is not found");

        return res.status(500).send();
      }
    }
  }
);

httpServer.listen(Config.server.port);

logger.info("Central server is running at port " + Config.server.port + "...");
