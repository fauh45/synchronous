import { Base } from "./query_types";

export const MESSAGE_EVENT = "Message";
export const MESSAGE_SUBSCRIPTION_EVENT = "MessageSubscription";

export const CENTRAL_MESSAGE_EVENT = "CentralMessage";
export const CENTRAL_PASSTHROUGH_EVENT = "CentralPassthrough";
export const ADD_DEVICE_EVENT = "AddDevice";
export const REMOVE_DEVICE_EVENT = "RemoveDevice";

export interface SubscriptionMessage {
  from: string;
  connection_id: string;
  message: string;
}

export interface CentralMessage {
  to: string;
  message: string;
}

export type DeviceMessage = SubscriptionMessage;
export type AddDeviceMessage = Base;
export type RemoveDeviceMessage = Base;
