import dayjs from 'dayjs';
import { ChangeEvent, useRef, useState, FC } from 'react';
import { BiteInfo } from '../types/common';
import { AdornedInput } from './AdornedInput';
import { Location, LocationEvent } from './Location';
import { PfEvent, PostFestum } from './PostFestum';
import {
  biteForm,
  portionSelectLabel,
  portionRow,
  portionInfo,
  row,
  portionSelectColumn,
  portionSelectComponent,
  portionInputColumn,
  portionInput,
  submit,
  fullWidthInput,
} from './BiteForm.css';
import { NumberInput } from './NumberInput';

interface BiteFormProps {
  submitBite: (b: BiteInfo) => void;
}

const portions: Array<[string, number]> = [
  ['Pieni tuoppi keskaria (330 ml, 4,6 %)', 1],
  ['Iso tuoppi keskaria (500 ml, 4,6 %)', 1.5],
  ['Pieni tuoppi nelosta (330 ml, 5,2 %)', 1.2],
  ['Iso tuoppi nelosta (500 ml, 5,2 %)', 1.8],
  ['12 senttiä viiniä (120 ml, 12,5 %)', 1],
  ['16 senttiä viiniä (160 ml, 12,5 %)', 1.3],
  ['24 senttiä viiniä (240 ml, 12,5 %)', 2],
  ['8 senttiä väkevää viiniä (80 ml, 20 %)', 1],
  ['4 cl viinaa (40 ml, 40 %)', 1.1],
  ['4 cl 60-volttista viinaa (40 ml, 60 %)', 1.6],
];

export const BiteForm: FC<BiteFormProps> = ({ submitBite }) => {
  const [portion, setPortion] = useState(1);
  const [postfestum, setPostfestum] = useState(false);
  const [pftime, setPftime] = useState(0);
  const [location, setLocation] = useState('koti');
  const [content, setContent] = useState('');
  const [customLocation, setCustomLocation] = useState<string>();
  const [info, setInfo] = useState('');
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>();

  const clearState = () => {
    setPortion(1);
    setPostfestum(false);
    setPftime(0);
    setLocation('koti');
    setContent('');
    setCustomLocation(undefined);
    setInfo('');
  };

  const portionSelect = useRef<HTMLSelectElement>(null);

  const portionLabel = portion === 1 ? 'annos' : 'annosta';

  const textChangeHandler =
    (fn: (v: string) => void) =>
    (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) =>
      fn(event.target.value);

  const handlePostfestum = (pfEvent: PfEvent) => {
    setPostfestum(pfEvent.postfestum);
    setPftime(pfEvent.pftime);
  };

  const handleLocation = (locationEvent: LocationEvent) => {
    setLocation(locationEvent.location);
    setCustomLocation(locationEvent.customLocation);
  };

  const handleSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setPortion(parseFloat(event.target.value));
  };

  const handleSubmit = () => {
    submitBite({
      portion,
      postfestum,
      pftime,
      location,
      content,
      customLocation,
      info,
      coordinates,
      tzOffset: dayjs().format('Z'),
    });
    clearState();
    if (portionSelect.current) {
      portionSelect.current.selectedIndex = 0;
    }
  };

  return (
    <div className={biteForm}>
      <div className={row}>
        <input
          placeholder="Mitäs ajattelit puraista?"
          type="text"
          value={content}
          onChange={textChangeHandler(setContent)}
          required={true}
          className={fullWidthInput}
        />
      </div>

      <div className={portionRow}>
        <div>
          <label htmlFor="portion-select" className={portionSelectLabel}>
            Alkoholiannos
          </label>
        </div>
        <div className={portionInfo}>
          <div className={portionSelectColumn}>
            <select
              onChange={handleSelect}
              ref={portionSelect}
              id="portion-select"
              className={portionSelectComponent}
            >
              {portions.map(([option, value], index) => (
                <option key={index} value={value}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <AdornedInput
            className={portionInputColumn}
            input={
              <NumberInput
                required={true}
                value={portion}
                onChange={(v: number) => setPortion(v)}
                className={portionInput}
              />
            }
            adornment={portionLabel}
          />
        </div>
      </div>

      <PostFestum postfestum={postfestum} pftime={pftime} handleChange={handlePostfestum} />

      <Location
        location={location}
        customLocation={customLocation}
        handleChange={handleLocation}
        setCoordinates={setCoordinates}
      />

      <div className={row}>
        <textarea
          placeholder="Erityisiä huomioita puraisuun liittyen.."
          value={info}
          onChange={textChangeHandler(setInfo)}
          className={fullWidthInput}
        />
      </div>

      <button type="submit" className={submit} onClick={handleSubmit}>
        Puraise!
      </button>
    </div>
  );
};
