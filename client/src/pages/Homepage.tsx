import { useEffect, useState } from 'react';
import Logger from '../components/Logger';
import Sensor from '../components/Sensor';
import Toggle from '../components/Toggle';
import { ISensorData } from '../types';

const Homepage = () => {
  const [worker, setWorker] = useState<Worker | null>(null);
  const [sensors, setSensors] = useState<ISensorData[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [buttonState, setButtonState] = useState<boolean>(false);
  const [showOnlyConnected, setShowOnlyConnected] = useState<boolean>(false);

  const hanldeStartConnection = () => {
    worker?.postMessage({
      command: 'initSocketConnection',
    });
  };

  const handleStopConnection = () => {
    worker?.postMessage({
      command: 'stopSocketConnection',
    });
    setSensors([]);
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
        // console.log(JSON.parse(e.data));
        if (typeof e.data === 'string') {
          if (e.data.includes('[')) {
            setLog((prevLogs) => [...prevLogs, e.data]);
          } else {
            setSensors((prevSensors) => {
              const found = prevSensors.find((sen) => sen.id === JSON.parse(e.data)['id']);
              if (!found) {
                return [...prevSensors, JSON.parse(e.data)];
              } else {
                return prevSensors.map((sen, i) => {
                  if (sen.id === JSON.parse(e.data)['id']) {
                    return { ...sen, value: JSON.parse(e.data)['value'], connected: JSON.parse(e.data)['connected'] };
                  } else {
                    // The rest haven't changed
                    return sen;
                  }
                });
              }
            });
          }
        }

        if (typeof e.data === 'object') {
          setButtonState(e.data.disableStartButton);
        }
      };
    }
  }, [worker]);

  return (
    <div className='flex flex-col w-full'>
      <div className='mx-auto'>
        <p className='text-xl font-semibold'>Internet of Things (IoT) sensors</p>
        <div className='flex gap-x-2 mt-4'>
          <button
            className='text-white bg-green-500 p-2 rounded-md disabled:opacity-75 disabled:bg-gray-400'
            onClick={hanldeStartConnection}
            disabled={!worker || buttonState}
          >
            Start Connection
          </button>
          <button
            className='text-white bg-red-500 p-2 rounded-md disabled:opacity-75 disabled:bg-gray-400'
            onClick={handleStopConnection}
            disabled={!buttonState}
          >
            Stop Connection
          </button>
        </div>
        {sensors.length > 0 && (
          <div className='mt-4'>
            <Toggle
              label='Show only connected'
              enabled={showOnlyConnected}
              setEnabled={() => setShowOnlyConnected(!showOnlyConnected)}
            />
          </div>
        )}
      </div>
      {sensors.length > 0 && (
        <ul className='list-disc mx-auto mt-6'>
          {showOnlyConnected
            ? sensors
                .filter((sen) => sen.connected)
                .map((sensor) => (
                  <li key={sensor.id} className='mt-2'>
                    <Sensor
                      sensorData={sensor}
                      connect={() => handleConnectSensor(sensor.id)}
                      disconnect={() => handleDisconnectSensor(sensor.id)}
                    />
                  </li>
                ))
            : sensors.map((sensor) => (
                <li key={sensor.id} className='mt-2'>
                  <Sensor
                    sensorData={sensor}
                    connect={() => handleConnectSensor(sensor.id)}
                    disconnect={() => handleDisconnectSensor(sensor.id)}
                  />
                </li>
              ))}
        </ul>
      )}
      <Logger logs={log} />
    </div>
  );
};

export default Homepage;
