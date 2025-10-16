import { Query } from "appwrite"
import { appwriteConfig, tables } from "./client"

export const getAllTrips = async (limit:number, offset:number)=> {
    const allTrips = await tables.listRows({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.tripsTableId,
        queries: [
            Query.limit(limit),
            Query.offset(offset),
            Query.orderDesc('$createdAt'),
        ]
    });

    if (allTrips.total === 0) {
        console.error('No trips found in the database.');
        return { allTrips: [], total: 0 };
    }

    return { allTrips: allTrips.rows, total: allTrips.total };
}

export const getTripById = async (tripId: string) => {
    const trip = await tables.getRow({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.tripsTableId,
        rowId: tripId
    });

    if (!trip) {
        console.error(`No trip found with ID: ${tripId}`);
        return null;
    }

    return trip;
}