import { Box, Button, Typography } from "@material-ui/core";
import { LatLngExpression, Icon, Point } from "leaflet";
import React from "react";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
import "./TrackingScreen.css";
import roboDeliveryIcon from "./img/delivery.png";

interface TrackingScreenProps {
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

const Arrived = (props: { openHandler(): void }): JSX.Element => {
  return (
    <>
      <Typography variant="h6">Has Arrived!</Typography>
      <Box marginTop={1}>
        <Button
          color="secondary"
          variant="outlined"
          onClick={() => props.openHandler()}
        >
          Open The Bot!
        </Button>
      </Box>
    </>
  );
};

const TrackingScreen = (props: TrackingScreenProps): JSX.Element => {
  const [status, setStatus] = React.useState<TrackingStatus>(
    TrackingStatus.Arrived
  );

  const openHandler = () => {
    props.doneHandler();
  };

  const drawOnStatus: Map<TrackingStatus, JSX.Element> = new Map();
  drawOnStatus.set(TrackingStatus.WaitingForData, <Waiting />);
  drawOnStatus.set(TrackingStatus.Delivering, <Delivering />);
  drawOnStatus.set(
    TrackingStatus.Arrived,
    <Arrived openHandler={openHandler} />
  );

  const position: LatLngExpression = [34.06229377227809, -118.34315294324733];

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
