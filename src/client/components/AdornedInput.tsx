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

const AdornedInputContainer = styled.div`
  display: flex;
  justify-content: flex-start;

  && input {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
`

const Adornment = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #495057;
  background-color: #e9ecef;
  padding: 4px 8px;
  border: 1px solid #ced4da;
  border-left: none;
  border-radius: 4px;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  font-size: 14px;
  line-height: 1.5;
`
