import { ReactElement, VFC } from 'react'
import styled from 'styled-components'

type AdornedInputProps = {
  input: ReactElement
  adornment: string
  className?: string
}

export const AdornedInput: VFC<AdornedInputProps> = ({ input, adornment, className }) => (
  <AdornedInputContainer className={className}>
    {input}
    <Adornment>{adornment}</Adornment>
  </AdornedInputContainer>
)

const AdornedInputContainer = styled.div({
  display: 'flex',
  justifyContent: 'flex-start',
  '&& input': {
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  }
})

const Adornment = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#495057',
  backgroundColor: '#e9ecef',
  padding: '4px 8px',
  border: '1px solid #ced4da',
  borderLeft: 'none',
  borderRadius: 4,
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  fontSize: 14,
  lineHeight: 1.5
})
