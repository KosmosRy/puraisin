import { ChangeEvent, VFC } from 'react'
import { AdornedInput } from './AdornedInput'
import styled from 'styled-components'
import { Row } from './CommonStyles'

export type PfEvent = { postfestum: boolean; pftime: number }

type PfProps = {
  postfestum: boolean
  pftime: number
  handleChange: (change: PfEvent) => void
}

export const PostFestum: VFC<PfProps> = ({ postfestum, pftime, handleChange }) => {
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { target } = e
    if (target.type === 'checkbox') {
      handleChange({ postfestum: target.checked, pftime })
    } else {
      handleChange({ postfestum, pftime: parseInt(target.value, 10) })
    }
  }

  return (
    <PfRow>
      <Label>
        <input type="checkbox" checked={postfestum} onChange={onChange} /> Postfestum
      </Label>
      {postfestum && (
        <PfInput
          input={
            <input
              type="number"
              required={true}
              title="Postfestum-ajankohta"
              value={pftime}
              onChange={onChange}
              min="1"
              step="1"
            />
          }
          adornment="min sitten"
        />
      )}
    </PfRow>
  )
}

const PfRow = styled(Row)({
  gap: 16
})

const Label = styled.label({
  display: 'flex',
  alignItems: 'center',
  height: 33,

  input: {
    marginRight: 8
  }
})

const PfInput = styled(AdornedInput)({
  input: {
    maxWidth: 65
  }
})
