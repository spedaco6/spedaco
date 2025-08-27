import React from 'react'

export default function Form({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>): React.ReactElement {
  return (
    <form { ...props }>
      { children }
    </form>
  )
}
