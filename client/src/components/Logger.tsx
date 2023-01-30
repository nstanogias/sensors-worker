import { FC } from 'react';

interface IProps {
  logs: string[];
}

const Logger: FC<IProps> = ({ logs }) => {
  return (
    <div className='border-2 p-4 mt-4'>
      <span className='font-bold text-2xl'>Logged Messages:</span>
      <ul>
        {logs.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export default Logger;
