export interface Base {
  user_account: string;
  device_id: string;
}

export interface PublishMessage extends Base {
  message: string;
}

export interface MessageAll extends Base {
  message: string;
}

export interface MessageDevice extends MessageAll {
  to_connection_id: string;
}

enum SubscriptionAction {
  SUBSCRIBE = "SUBSCRIBE",
  UNSUBSCRIBE = "UNSUBSCRIBE",
}

export interface UpdateSubscription extends Base {
  action: SubscriptionAction;
  to_connection_id: string;
}

enum DeviceUpdateAction {
  ADD = "ADD",
  REMOVE = "REMOVE",
}

export interface UpdateDevice extends Base {
  action: DeviceUpdateAction;
}

export interface CentralPassthroughMessage {
  user_account: string;
  to: string;
  message: string;
}
