import { Logout } from "@/components/Forms/Logout";

export default function Dashboard(): React.ReactElement {

  return <main>
    <h1>My Dashboard</h1>
    <p>Login successful! Welcome to your dashboard</p>
    <Logout />
  </main>
}