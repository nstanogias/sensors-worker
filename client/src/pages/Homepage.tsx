import { useEffect, useState } from 'react';
import Logger from '../components/Logger';
import Sensor from '../components/Sensor';
import Toggle from '../components/Toggle';
import { ISensorData, MessageType, workerMessage } from '../types';

const Homepage = () => {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [sensors, setSensors] = useState<{ [key: string]: ISensorData }>({});
  const [log, setLog] = useState<string[]>([]);
  const [buttonState, setButtonState] = useState<boolean>(false);
  const [showOnlyConnected, setShowOnlyConnected] = useState<boolean>(false);

  const sensorsToShow = showOnlyConnected
    ? Object.values(sensors).filter((sen) => sen.connected)
    : Object.values(sensors);

  const hanldeStartConnection = () => {
    worker?.postMessage({
      command: 'initSocketConnection',
    });
  };

  const handleStopConnection = () => {
    worker?.postMessage({
      command: 'stopSocketConnection',
    });
    setSensors({});
  };

  const handleConnectSensor = (id: string) => {
    worker?.postMessage({
      command: 'connectSensor',
      payload: {
        command: 'connect',
        id,
      },
    });
  };

  const handleDisconnectSensor = (id: string) => {
    worker?.postMessage({
      command: 'disconnectSensor',
      payload: {
        command: 'disconnect',
        id,
      },
    });
  };

  useEffect(() => {
    const myWorker = new Worker(new URL('../workers/main.worker.ts', import.meta.url)); //NEW SYNTAX
    setWorker(myWorker);

    return () => {
      myWorker.terminate();
    };
  }, []);

  useEffect(() => {
    if (worker) {
      worker.onmessage = (e) => {
        const data = e.data as workerMessage;
        const { type, payload } = data;
        switch (type) {
          case MessageType.LOG:
            setLog((prevLogs) => [...prevLogs, payload]);
            break;
          case MessageType.BUTTON:
            setButtonState(payload);
            break;
          case MessageType.SENSOR:
            setSensors((prevSensors) => {
              return { ...prevSensors, [payload.id]: payload };
            });
            break;
        }
      };
    }
  }, [worker]);

  return (
    <div className='flex flex-col w-full'>
      <div className='mx-auto'>
        <p className='text-xl font-semibold'>Internet of Things (IoT) sensors</p>
        <div className='flex mt-4 gap-x-2'>
          <button
            className='p-2 text-white bg-green-500 rounded-md disabled:opacity-75 disabled:bg-gray-400'
            onClick={hanldeStartConnection}
            disabled={!worker || buttonState}
          >
            Start Connection
          </button>
          <button
            className='p-2 text-white bg-red-500 rounded-md disabled:opacity-75 disabled:bg-gray-400'
            onClick={handleStopConnection}
            disabled={!buttonState}
          >
            Stop Connection
          </button>
        </div>
        {sensorsToShow.length > 0 && (
          <div className='mt-4'>
            <Toggle
              label='Show only connected'
              enabled={showOnlyConnected}
              setEnabled={() => setShowOnlyConnected(!showOnlyConnected)}
            />
          </div>
        )}
      </div>
      {sensorsToShow.length > 0 && (
        <div className='grid grid-cols-2 gap-4 mx-auto mt-6 md:grid-cols-3'>
          {sensorsToShow.map((sensor) => (
            <div key={sensor.id} className='mt-2'>
              <Sensor
                sensorData={sensor}
                connect={() => handleConnectSensor(sensor.id)}
                disconnect={() => handleDisconnectSensor(sensor.id)}
              />
            </div>
          ))}
        </div>
      )}
      <Logger logs={log} />
    </div>
  );
};

export default Homepage;
