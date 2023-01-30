import { FC } from 'react';
import { Switch } from '@headlessui/react';

interface Props {
  label: string;
  enabled: boolean;
  setEnabled: (val: boolean) => void;
}
const Toggle: FC<Props> = ({ label, enabled, setEnabled }) => {
  return (
    <Switch.Group>
      <div className='flex items-center justify-center'>
        <Switch.Label className='mr-4'>{label}</Switch.Label>
        <Switch
          checked={enabled}
          onChange={setEnabled}
          className={`${
            enabled ? 'bg-blue-600' : 'bg-gray-200'
          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
        >
          <span
            className={`${
              enabled ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
};

export default Toggle;
