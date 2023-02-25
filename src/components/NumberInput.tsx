import { ChangeEvent, FC, InputHTMLAttributes, useState } from 'react';

interface NumberInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'max' | 'min' | 'step' | 'type' | 'onChange'
  > {
  step?: number;
  min?: number;
  max?: number;
  value?: number;
  onChange: (value: number) => void;
}

const parse = (
  value: string,
  { min, max }: Pick<NumberInputProps, 'step' | 'min' | 'max'>,
): number | undefined => {
  const numVal = parseFloat(value.replace(',', '.'));
  if (!isNaN(numVal)) {
    if (min !== undefined && numVal < min) {
      return undefined;
    }
    if (max !== undefined && numVal > max) {
      return undefined;
    }
    return numVal;
  }
  return undefined;
};

const format = (value: number | undefined): string => String(value ?? '');

const numRegex = /^\d*[.,]?\d*$/;

export const NumberInput: FC<NumberInputProps> = ({
  value,
  onChange,
  step,
  min,
  max,
  ...inputProps
}) => {
  const [textValue, setTextValue] = useState(format(value));

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!numRegex.test(event.target.value)) {
      return false;
    }
    const newVal = parse(event.target.value, { step, min, max });
    if (newVal) {
      if (newVal !== value) {
        onChange(newVal);
      }
    } else if (event.target.value === '') {
      onChange(0);
    }
    setTextValue(event.target.value);
    return true;
  };

  return <input type="text" value={textValue} onChange={onInputChange} {...inputProps} />;
};
