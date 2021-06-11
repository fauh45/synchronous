import { Box, Button, Typography } from "@material-ui/core";
import { LatLngExpression, Icon, Point } from "leaflet";
import React from "react";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import "./TrackingScreen.css";
import roboDeliveryIcon from "./img/delivery.png";
import {
  AuthResponse,
  DeviceMessage,
  MessageDevice,
  MESSAGE_EVENT,
} from "@synchronous/common";
import { io, Socket } from "socket.io-client";

interface TrackingScreenProps extends AuthResponse {
  doneHandler(): void;
}

const robotIcon = new Icon({
  iconUrl: roboDeliveryIcon,
  iconRetinaUrl: roboDeliveryIcon,
  iconSize: new Point(25, 25),
});

enum TrackingStatus {
  WaitingForData,
  Delivering,
  Arrived,
}

const Waiting = (): JSX.Element => {
  return <Typography variant="h6">Waiting for data...</Typography>;
};

const Delivering = (): JSX.Element => {
  return <Typography variant="h6">Is carrying your order...</Typography>;
};

const Arrived = (props: {
  openHandler(): void;
  isLoading: boolean;
}): JSX.Element => {
  return (
    <>
      <Typography variant="h6">Has Arrived!</Typography>
      <Box marginTop={1}>
        <Button
          color="secondary"
          variant="outlined"
          onClick={() => props.openHandler()}
          disabled={props.isLoading}
        >
          Open The Bot!
        </Button>
      </Box>
    </>
  );
};

const TrackingScreen = (props: TrackingScreenProps): JSX.Element => {
  const [status, setStatus] = React.useState<TrackingStatus>(
    TrackingStatus.WaitingForData
  );
  const [position, setPosition] = React.useState<LatLngExpression>([
    34.06229377227809, -118.34315294324733,
  ]);
  const [orderSent, setOrderSent] = React.useState(false);
  const socket = React.useRef<Socket>();

  const openHandler = () => {
    const message_device: MessageDevice = {
      device_id: props.device_id,
      user_account: props.user_account,
      to_connection_id: props.robot_device_id,
      message: JSON.stringify({
        type: "order",
        order: "open",
      }),
    };

    socket.current?.emit("MessageDevice", message_device);

    setOrderSent(true);
  };

  const drawOnStatus: Map<TrackingStatus, JSX.Element> = new Map();
  drawOnStatus.set(TrackingStatus.WaitingForData, <Waiting />);
  drawOnStatus.set(TrackingStatus.Delivering, <Delivering />);
  drawOnStatus.set(
    TrackingStatus.Arrived,
    <Arrived openHandler={openHandler} isLoading={orderSent} />
  );

  React.useEffect(() => {});

  React.useEffect(() => {
    console.log(props);

    socket.current = io(props.server_url, {
      auth: {
        device_id: props.device_id,
        user_account: props.user_account,
      },
    });

    socket.current.on("connect", () => {
      console.log("Connected");
    });

    socket.current.on(MESSAGE_EVENT, (params: DeviceMessage) => {
      if (params.from === props.robot_device_id) {
        console.log(params.from);
        const message = JSON.parse(params.message);

        if (
          (status === TrackingStatus.WaitingForData &&
            message.type === "location") ||
          (message.type === "status" && message.status === "ready")
        ) {
          setStatus(TrackingStatus.Delivering);
        }

        if (message.type === "location") {
          console.log("Robot Location : " + message.location);

          setPosition(message.location);
        }

        if (message.type === "status") {
          console.log("Robot Status : " + message.status);

          if (message.status === "arrived") setStatus(TrackingStatus.Arrived);
          else if (message.status === "open") props.doneHandler();
        }
      }
    });

    return () => {
      socket.current?.disconnect();
    };

    // eslint-disable-next-line
  }, []);

  return (
    <Box display="flex" flexDirection="column" height={1}>
      {status !== TrackingStatus.WaitingForData ? (
        <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={position} icon={robotIcon}>
            <Tooltip direction="top">Robo-1</Tooltip>
          </Marker>
        </MapContainer>
      ) : null}
      <Box padding={1}>
        <Typography variant="h4">
          <b>Robo-1</b>
        </Typography>
        {drawOnStatus.get(status)}
      </Box>
    </Box>
  );
};

export default TrackingScreen;
