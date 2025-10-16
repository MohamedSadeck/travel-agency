import Header from "components/Header"

const Trips = () => {
  return (
    <main className="all-users wrapper">
      <Header
        title="Trips"
        description="View and edit Ai-generated travel plans."
        ctaText="Create New Trip"
        ctaUrl="/trips/create"
      />
    </main>
  )
}

export default Trips
