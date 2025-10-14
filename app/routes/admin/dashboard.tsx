import { Header, StatsCard, TripCard } from "components"
import { dashboardStats, user, allTrips } from "~/constants"
function Dashboard() {
  const { totalUsers, usersJoined, totalTrips, tripsCreated, userRole } = dashboardStats

  return (
    <main className="dashboard wrapper">
      <Header
        title={`Welcome back, ${user.name}`}
        description="Track activities, trends and popular destinations in real time."
      />
      <section className="flex flex-col gap-6" >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" >
          <StatsCard
            headerTitle="Total Users"
            total={totalUsers}
            currentMonthCount={usersJoined.currentMonth}
            lastMonthCount={usersJoined.previousMonth}
          />
          <StatsCard
            headerTitle="Total Trips"
            total={totalTrips}
            currentMonthCount={tripsCreated.currentMonth}
            lastMonthCount={tripsCreated.previousMonth}
          />
          <StatsCard
            headerTitle="Active Users"
            total={userRole.total}
            currentMonthCount={userRole.currentMonth}
            lastMonthCount={userRole.previousMonth}
          />

        </div>

      </section>
      <section className="container">
        <h1 className="text-xl font-semibold">
          Created Trips
        </h1>
        <div className="trip-grid" >
          {allTrips.slice(0, 4).map(({id, estimatedPrice, imageUrls, itinerary,name, tags}) => (
            <TripCard
              key={id}
              id={id.toString()}
              name={name}
              imageUrl={imageUrls[0]}
              location={itinerary?.[0]?.location ?? ''}
              tags={tags}
              price={estimatedPrice}
            />
          ))}
        </div>

      </section>
    </main>
  )
}

export default Dashboard
