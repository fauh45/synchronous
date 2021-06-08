import { Base } from "./query_types";

export enum LOCATION {
  LA = "LA",
  BO = "BO",
}

export function isObjectBase(object: any): object is Base {
  if ((object as Base).device_id && (object as Base).user_account) {
    return true;
  }

  return false;
}

export function isValidLocation(object: any): object is LOCATION {
  if (Object.values(LOCATION).includes(object)) {
    return true;
  }

  return false;
}

export * from "./query_types";
export * from "./message_types";
