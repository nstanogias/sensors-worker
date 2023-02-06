import { MessageType } from '../types';

let socketInstance: WebSocket | null = null;

const createSocketInstance = () => {
  let socket = new WebSocket('ws://localhost:5000');

  return socket;
};

const socketManagement = () => {
  if (socketInstance) {
    socketInstance.onopen = (e: Event) => {
      console.log('[open] Connection established');
      postMessage({ type: MessageType.LOG, payload: '[SOCKET] Connection established' });
      postMessage({ type: MessageType.BUTTON, payload: true });
    };

    socketInstance.onmessage = (event: MessageEvent) => {
      console.log(`[message] Data received from server: ${event.data}`);
      postMessage({ type: MessageType.SENSOR, payload: JSON.parse(event.data) });
    };

    socketInstance.onclose = (event: CloseEvent) => {
      if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code}`);
        postMessage({ type: MessageType.LOG, payload: `[SOCKET] Connection closed cleanly, code=${event.code}` });
      } else {
        // e.g. server process killed or network down
        console.log('[close] Connection died');
        postMessage({ type: MessageType.LOG, payload: '[SOCKET] Connection died' });
      }
      postMessage({ type: MessageType.BUTTON, payload: false });
    };

    socketInstance.onerror = (error: Event) => {
      console.log(`[error] ${error}`);
      postMessage({ type: MessageType.LOG, payload: `[SOCKET] ${error}` });
      socketInstance?.close();
    };
  }
};

// SOCKET MANAGEMENT:
// eslint-disable-next-line no-restricted-globals
self.onmessage = (e: MessageEvent) => {
  const workerData = e.data;
  postMessage({ type: MessageType.LOG, payload: '[WORKER] Web worker received message' });
  switch (workerData.command) {
    case 'initSocketConnection':
      socketInstance = createSocketInstance();
      socketManagement();
      break;
    case 'stopSocketConnection':
      socketInstance?.close();
      break;
    case 'connectSensor':
      socketInstance?.send(JSON.stringify(workerData.payload));
      break;
    case 'disconnectSensor':
      socketInstance?.send(JSON.stringify(workerData.payload));
      break;
    default:
      socketManagement();
  }
};
