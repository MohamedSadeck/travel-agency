import { PagerComponent } from "@syncfusion/ej2-react-grids";
import { TripCard } from "components";
import Header from "components/Header"
import { parseTripData } from "lib/utils";
import { useState } from "react";
import { useSearchParams, type LoaderFunctionArgs } from "react-router";
import { getAllTrips } from "~/appwrite/trips";

type TripData = {
  userId: string;
  imageUrls: string[];
  tripDetails: string;
}

type TripsProps = {
  trips: TripData[];
  total: number;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const limit = 8;
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const offset = (page - 1) * limit;

  const { allTrips, total } = await getAllTrips(limit, offset);

  return {
    trips: allTrips.map(({ $id, tripDetails, imageUrls }) => (
      {
        userId: $id,
        imageUrls: imageUrls ?? [],
        tripDetails,
      }
    )) as TripData[],
    total
  } as TripsProps;
}

const Trips = ({ loaderData }: { loaderData: TripsProps }) => {
  const trips = loaderData.trips;

  const [searchParams] = useSearchParams();
  const initialPage = Number(searchParams.get('page') || '1');

  const [currentPage, setCurrentPage] = useState(initialPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.location.search = `?page=${page}`;
  }

  return (
    <main className="all-users wrapper">
      <Header
        title="Trips"
        description="View and edit Ai-generated travel plans."
        ctaText="Create New Trip"
        ctaUrl="/trips/create"
      />
      <section>
        <h1 className="p-24-semibold text-dark-100 mb-4">
          Manage Created Trips
        </h1>
        <div className="trip-grid mb-4">
          {trips.map((trip) => {
            console.log('AllTrips--> trip:', trip);
            const tripDetails = parseTripData(trip.tripDetails);
            if (!tripDetails) return null;
            return (
              <TripCard
                key={trip.userId}
                id={trip.userId}
                name={tripDetails.name}
                location={tripDetails.itinerary?.[0]?.location || tripDetails.country}
                imageUrl={trip.imageUrls?.[0] || '/assets/images/placeholder.jpg'}
                tags={[tripDetails.travelStyle, tripDetails.budget]}
                price={tripDetails.estimatedPrice}
              />
            );
          })}
        </div>

        <PagerComponent
          totalRecordsCount={loaderData.total}
          pageSize={8}
          currentPage={currentPage}
          click={(args)=> handlePageChange(args.currentPage)}
          cssClass="mb-4"
        />
      </section>
    </main>
  )
}

export default Trips
