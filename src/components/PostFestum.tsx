import { ChangeEvent, FC } from 'react';
import { AdornedInput } from './AdornedInput';
import { pfCheckbox, pfInput, pfLabel, pfRow } from './PostFestum.css';

export interface PfEvent {
  postfestum: boolean;
  pftime: number;
}

interface PfProps {
  postfestum: boolean;
  pftime: number;
  handleChange: (change: PfEvent) => void;
}

export const PostFestum: FC<PfProps> = ({ postfestum, pftime, handleChange }) => {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { target } = e;
    if (target.type === 'checkbox') {
      handleChange({ postfestum: target.checked, pftime });
    } else {
      handleChange({ postfestum, pftime: parseInt(target.value, 10) });
    }
  };

  return (
    <div className={pfRow}>
      <label className={pfLabel}>
        <input type="checkbox" className={pfCheckbox} checked={postfestum} onChange={onChange} />{' '}
        Postfestum
      </label>
      {postfestum && (
        <AdornedInput
          input={
            <input
              type="number"
              required={true}
              title="Postfestum-ajankohta"
              value={pftime}
              onChange={onChange}
              min="1"
              step="1"
              className={pfInput}
            />
          }
          adornment="min sitten"
        />
      )}
    </div>
  );
};
