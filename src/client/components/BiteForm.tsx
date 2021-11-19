import { PfEvent, PostFestum } from './PostFestum'
import { Location, LocationEvent } from './Location'
import { BiteInfo } from '../../common/types'
import { ChangeEvent, useRef, useState, VFC } from 'react'
import styled from 'styled-components'
import { AdornedInput } from './AdornedInput'
import { Row } from './CommonStyles'
import dayjs from 'dayjs'

type BiteFormProps = {
  submitBite: (b: BiteInfo) => void
}

const portions: [string, number][] = [
  ['Pieni tuoppi keskaria (330 ml, 4,6 %)', 1],
  ['Iso tuoppi keskaria (500 ml, 4,6 %)', 1.5],
  ['Pieni tuoppi nelosta (330 ml, 5,2 %)', 1.2],
  ['Iso tuoppi nelosta (500 ml, 5,2 %)', 1.8],
  ['12 senttiä viiniä (120 ml, 12,5 %)', 1],
  ['16 senttiä viiniä (160 ml, 12,5 %)', 1.3],
  ['24 senttiä viiniä (240 ml, 12,5 %)', 2],
  ['8 senttiä väkevää viiniä (80 ml, 20 %)', 1],
  ['4 cl viinaa (40 ml, 40 %)', 1.1],
  ['4 cl 60-volttista viinaa (40 ml, 60 %)', 1.6]
]

export const BiteForm: VFC<BiteFormProps> = ({ submitBite }) => {
  const [portion, setPortion] = useState(1)
  const [postfestum, setPostfestum] = useState(false)
  const [pftime, setPftime] = useState(0)
  const [location, setLocation] = useState('koti')
  const [content, setContent] = useState('')
  const [customLocation, setCustomLocation] = useState<string>()
  const [info, setInfo] = useState('')
  const [coordinates, setCoordinates] = useState<GeolocationCoordinates | null>()

  const clearState = () => {
    setPortion(1)
    setPostfestum(false)
    setPftime(0)
    setLocation('koti')
    setContent('')
    setCustomLocation(undefined)
    setInfo('')
  }

  const portionSelect = useRef<HTMLSelectElement>(null)

  const portionLabel = portion === 1 ? 'annos' : 'annosta'

  const textChangeHandler =
    (fn: (v: string) => void) =>
    (event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>) =>
      fn(event.target.value)

  const handlePostfestum = (pfEvent: PfEvent) => {
    setPostfestum(pfEvent.postfestum)
    setPftime(pfEvent.pftime)
  }

  const handleLocation = (locationEvent: LocationEvent) => {
    setLocation(locationEvent.location)
    setCustomLocation(locationEvent.customLocation)
  }

  const handleSelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setPortion(parseFloat(event.target.value))
  }

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
      tzOffset: dayjs().format('Z')
    })
    clearState()
    if (portionSelect.current) {
      portionSelect.current.selectedIndex = 0
    }
  }

  return (
    <Form>
      <FullWidthRow>
        <input
          placeholder="Mitäs ajattelit puraista?"
          type="text"
          value={content}
          onChange={textChangeHandler(setContent)}
          required={true}
        />
      </FullWidthRow>

      <PortionRow>
        <div>
          <label htmlFor="portion-select">Alkoholiannos</label>
        </div>
        <PortionSelect>
          <div className="portion-select">
            <select onChange={handleSelect} ref={portionSelect}>
              {portions.map(([option, value], index) => (
                <option key={index} value={value}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <AdornedInput
            className="portion-input"
            input={
              <input
                type="number"
                min="0"
                step="0.1"
                required={true}
                value={portion}
                onChange={textChangeHandler((v: string) => setPortion(parseFloat(v)))}
              />
            }
            adornment={portionLabel}
          />
        </PortionSelect>
      </PortionRow>

      <PostFestum postfestum={postfestum} pftime={pftime} handleChange={handlePostfestum} />

      <Location
        location={location}
        customLocation={customLocation}
        handleChange={handleLocation}
        setCoordinates={setCoordinates}
      />

      <FullWidthRow>
        <textarea
          placeholder="Erityisiä huomioita puraisuun liittyen.."
          value={info}
          onChange={textChangeHandler(setInfo)}
        />
      </FullWidthRow>

      <Submit type="submit" onClick={handleSubmit}>
        Puraise!
      </Submit>
    </Form>
  )
}

const Form = styled.div`
  label {
    font-weight: 100;
  }
`

const FullWidthRow = styled(Row)`
  > * {
    width: 100%;
  }
`

const PortionRow = styled(Row)`
  flex-direction: column;

  label {
    margin-bottom: 8px;
    display: inline-block;
  }
`

const PortionSelect = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;

  .portion-select {
    flex: 2 1 66%;

    select {
      width: 100%;
    }
  }

  .portion-input {
    flex: 1 0 33%;

    input {
      max-width: 65px;
    }
  }
`

const Submit = styled.button`
  display: inline-block;
  color: #fff;
  background-color: #28a745;
  border: 1px solid #28a745;
  text-align: center;
  vertical-align: middle;
  user-select: none;
  padding: 6px 12px;
  font-size: 16px;
  line-height: 1.5;
  border-radius: 4px;
  
  :hover {
    background-color: #218838;
    border-color: #1e7e34;
  }
}
`
