import { FC } from 'react';
import { ISensorData } from '../types';

interface IProps {
  sensorData: ISensorData;
  connect: () => void;
  disconnect: () => void;
}

const Sensor: FC<IProps> = ({ sensorData, connect, disconnect }) => {
  return (
    <div className='flex flex-col justify-between h-full p-4 border gap-x-2'>
      <span className='w-[150px]'>{sensorData.name}</span>
      {sensorData.value && (
        <span className='w-[150px]'>
          {sensorData.value} {sensorData.unit}
        </span>
      )}
      <button
        onClick={sensorData.connected ? disconnect : connect}
        className={`${sensorData.connected ? 'bg-red-700' : 'bg-green-700'} text-white p-2 rounded-md`}
      >
        {sensorData.connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
};

export default Sensor;
