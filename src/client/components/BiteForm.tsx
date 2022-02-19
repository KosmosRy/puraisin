import dayjs from 'dayjs'
import { ChangeEvent, VFC, useRef, useState } from 'react'
import styled from 'styled-components'
import { BiteInfo } from '../../common/types'
import { AdornedInput } from './AdornedInput'
import { Row } from './CommonStyles'
import { Location, LocationEvent } from './Location'
import { PfEvent, PostFestum } from './PostFestum'

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

const Form = styled.div({
  label: {
    fontWeight: 300
  },
  marginTop: -16
})

const FullWidthRow = styled(Row)({
  '> *': {
    width: '100%'
  }
})

const PortionRow = styled(Row)({
  flexDirection: 'column',
  label: {
    marginBottom: 8,
    display: 'inline-block'
  }
})

const PortionSelect = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,

  '.portion-select': {
    flex: '2 1 66%',
    select: {
      width: '100%',
      appearance: 'none',
      background: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='currentColor'><polygon points='0,25 100,25 50,75'/></svg>") no-repeat`,
      backgroundSize: 12,
      backgroundPosition: 'calc(100% - 10px) center',
      backgroundRepeat: 'no-repeat',
      backgroundColor: 'white',
      paddingRight: 32
    }
  },

  '.portion-input': {
    flex: '1 0 33%',
    input: {
      maxWidth: 65
    }
  }
})

const Submit = styled.button({
  display: 'inline-block',
  color: '#fff',
  backgroundColor: '#28a745',
  border: '1px solid #28a745',
  textAlign: 'center',
  verticalAlign: 'middle',
  userSelect: 'none',
  padding: '6px 12px',
  fontSize: 16,
  lineHeight: 1.5,
  borderRadius: 4,
  ':hover': {
    backgroundColor: '#218838',
    borderColor: '#1e7e34'
  }
})
