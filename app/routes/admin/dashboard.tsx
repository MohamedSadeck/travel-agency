import { Header, StatsCard, TripCard } from "components"
import { getUser } from "~/appwrite/auth";
import { getUsersAndTripsStats } from "~/appwrite/dashboard";
import { allTrips } from "~/constants"
import type { Route } from './+types/dashboard'

export const clientLoader = async () => {
  const [user, stats] = await Promise.all([
    getUser(),
    getUsersAndTripsStats()
  ])
  return { user, stats }
}

function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user, stats } = loaderData as { user: User; stats: DashboardStats };
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
            total={stats.totalUsers}
            currentMonthCount={stats.usersJoined.currentMonth}
            lastMonthCount={stats.usersJoined.lastMonth}
          />
          <StatsCard
            headerTitle="Total Trips"
            total={stats.totalTrips}
            currentMonthCount={stats.tripsCreated.currentMonth}
            lastMonthCount={stats.tripsCreated.lastMonth}
          />
          <StatsCard
            headerTitle="Active Users"
            total={stats.userRole.total}
            currentMonthCount={stats.userRole.currentMonth}
            lastMonthCount={stats.userRole.lastMonth}
          />

        </div>

      </section>
      <section className="container">
        <h1 className="text-xl font-semibold">
          Created Trips
        </h1>
        <div className="trip-grid" >
          {allTrips.slice(0, 4).map(({ id, estimatedPrice, imageUrls, itinerary, name, tags }) => (
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
