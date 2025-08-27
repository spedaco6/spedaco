import LoginForm from '@/components/Forms/LoginForm'
import React, { JSX } from 'react'

export default async function Login(): Promise<JSX.Element> {
  return (
    <main className="flex items-center flex-col">
      <LoginForm />
    </main>
  )
}
