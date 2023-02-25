import { ChangeEvent, FC, InputHTMLAttributes, useEffect, useState } from 'react';

interface NumberInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'value' | 'max' | 'min' | 'step' | 'type' | 'onChange'
  > {
  value?: number;
  onChange: (value: number) => void;
}

const parse = (value: string): number | undefined => {
  if (value === '') {
    return 0;
  }
  const numVal = parseFloat(value.replace(',', '.'));
  if (!isNaN(numVal)) {
    return numVal;
  }
  return undefined;
};

const format = (value: number | undefined): string => String(value ?? '').replace('.', ',');

const numRegex = /^\d*[.,]?\d*$/;

export const NumberInput: FC<NumberInputProps> = ({ value, onChange, ...inputProps }) => {
  const [textValue, setTextValue] = useState(format(value));

  useEffect(() => {
    if (value !== parse(textValue)) {
      setTextValue(format(value));
    }
  }, [textValue, value]);

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!numRegex.test(event.target.value)) {
      return false;
    }
    const newVal = parse(event.target.value);
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
