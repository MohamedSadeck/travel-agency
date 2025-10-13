import { Header } from "components"

function Dashboard() {
  const user = { name: "Mohamed" }
  return (
    <main className="dashboard wrapper">
      <Header 
        title={`Welcome back, ${user.name}`}
        description="Track activities, trends and popular destinations in real time."
      />
      Dashboard Page Content
    </main>
  )
}

export default Dashboard
