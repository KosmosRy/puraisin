import { FC, ReactElement } from 'react';
import { adornedInputContainer, inputAdornment } from './AdornedInput.css';

interface AdornedInputProps {
  input: ReactElement;
  adornment: string;
  className?: string;
}

export const AdornedInput: FC<AdornedInputProps> = ({ input, adornment, className }) => (
  <div className={`${adornedInputContainer} ${className ?? ''}`}>
    {input}
    <div className={inputAdornment}>{adornment}</div>
  </div>
);
