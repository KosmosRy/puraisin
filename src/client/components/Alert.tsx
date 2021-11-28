import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import styled from 'styled-components'

type Props = HTMLAttributes<HTMLDivElement> & {
  variant: 'success' | 'danger'
  children: ReactNode
}

export const Alert = forwardRef<HTMLDivElement, Props>(({ variant, className, children }, ref) => (
  <AlertContainer variant={variant} ref={ref} className={className}>
    {children}
  </AlertContainer>
))

const successStyles = {
  color: '#155724',
  backgroundColor: '#d4edda',
  borderColor: '#c3e6cb'
}

const warningStyles = {
  color: '#856404',
  backgroundColor: '#fff3cd',
  borderColor: '#ffeeba'
}

const AlertContainer = styled.div<Props>(
  {
    borderRadius: 4,
    padding: '12px 20px',
    marginBottom: 16,
    border: '1px solid transparent'
  },
  ({ variant }) => ({
    ...(variant === 'success' ? successStyles : warningStyles)
  })
)

Alert.displayName = 'Alert'
