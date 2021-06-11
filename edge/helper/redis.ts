import { createNodeRedisClient } from "handy-redis";
import Config from "../config";
import { logger } from "./logger";

export const SUBSRIBERS_SUFFIX = ":subsribers";
export const CONNECTION_ID_SUFFIX = ":connection_id";
export const MESSAGE_SUFFIX = ":messages";
export const DEVICE_ID_SUFFIX = ":device_id";

export const ALLOWED = "ALLOWED";

const client = createNodeRedisClient({
  host: Config.redis.host,
  port: Config.redis.port,
});

client.flushdb().then(() => logger.info("Redis are Flushed"));

export const getSubscriber = async (
  connection_id: string
): Promise<string[]> => {
  return await client.smembers(connection_id + SUBSRIBERS_SUFFIX);
};

export const addSubscriber = async (
  connection_id: string,
  to_connection_id: string
) => {
  await client.sadd(to_connection_id + SUBSRIBERS_SUFFIX, connection_id);
};

export const removeSubscriber = async (
  connection_id: string,
  to_connection_id: string
) => {
  await client.srem(to_connection_id + CONNECTION_ID_SUFFIX, connection_id);
};

export const sendMessage = (connection_id: string, message: string) => {
  client.sadd(connection_id + MESSAGE_SUFFIX, message);
};

export const getMessage = async (connection_id: string): Promise<string[]> => {
  return await client.lrange(connection_id + MESSAGE_SUFFIX, 0, -1);
};

export const addDevice = async (device_id: string, account_id: string) => {
  await client.hset(account_id, [device_id, ALLOWED]);
};

export const removeDevice = async (device_id: string, account_id: string) => {
  await client.hdel(account_id, device_id);
};

export const checkIfDeviceAllowed = async (
  device_id: string,
  account_id: string
): Promise<boolean> => {
  const allowed_data = await client.hget(account_id, device_id);

  if (allowed_data === null) {
    return false;
  }
  logger.info(allowed_data);

  return allowed_data === ALLOWED;
};

export const checkIfAuthorized = async (
  device_id: string,
  account_id: string
): Promise<boolean> => {
  const isAllowed = await checkIfDeviceAllowed(device_id, account_id);

  if (isAllowed) {
    const conn_id = await getConnectionId(device_id);

    if (conn_id === null) return true;
    logger.info(conn_id);
    return false;
  }

  return false;
};

export const setConnectionId = (device_id: string, connection_id: string) => {
  client.set(device_id + CONNECTION_ID_SUFFIX, connection_id);
  client.set(device_id, device_id);
  client.set(connection_id + DEVICE_ID_SUFFIX, device_id);
};

export const removeConnectionId = (device_id: string) => {
  client.del(device_id + CONNECTION_ID_SUFFIX);
};

export const getConnectionId = async (
  device_id: string
): Promise<string | null> => {
  return await client.get(device_id + CONNECTION_ID_SUFFIX);
};

export const getDeviceId = async (connection_id: string): Promise<string> => {
  const result = await client.get(connection_id + DEVICE_ID_SUFFIX);

  if (result === null) throw new Error("Got no device Id");

  return result;
};

export const disconnectCleanup = async (connection_id: string) => {
  const device_id = await client.get(connection_id + DEVICE_ID_SUFFIX);

  if (device_id != null) {
    removeConnectionId(device_id);
  }

  client.del(
    connection_id + DEVICE_ID_SUFFIX,
    connection_id + MESSAGE_SUFFIX,
    connection_id + SUBSRIBERS_SUFFIX
  );
};
