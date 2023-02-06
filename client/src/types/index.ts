export interface ISensorData {
  id: string;
  name: string;
  connected: boolean;
  unit: string;
  value: any;
}

export type LogMessage = {
  type: MessageType.LOG;
  payload: string;
};

export type ButtonMessage = {
  type: MessageType.BUTTON;
  payload: boolean;
};

export type SocketMessage = {
  type: MessageType.SENSOR;
  payload: ISensorData;
};

export type workerMessage = LogMessage | ButtonMessage | SocketMessage;

export enum MessageType {
  LOG,
  SENSOR,
  BUTTON,
}
