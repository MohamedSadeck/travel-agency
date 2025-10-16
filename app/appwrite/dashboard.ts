import { Query } from "appwrite";
import { appwriteConfig, tables } from "./client";
import { parseTripData } from "lib/utils";

interface Document {
    [key: string]: any;
}

export const getUsersAndTripsStats = async () : Promise<DashboardStats> => {
    const d = new Date();
    const startCurrent = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    const startPrev = new Date(d.getFullYear(), d.getMonth()-1, 1).toISOString();
    const endPrev = new Date(d.getFullYear(), d.getMonth(), 0).toISOString();

    const [ 
        totalUsers, 
        usersCurrentMonth, 
        usersPrevMonth,
        totalTrips,
        tripsCurrentMonth,
        tripsPrevMonth,
        activeUsers,
        activeUsersCurrentMonth,
        activeUsersPrevMonth
    ] = await Promise.all([
        // Total users
        tables.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
        }),
        // Users joined current month
        tables.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
            queries: [
                Query.greaterThanEqual('$createdAt', startCurrent),
            ]
        }),
        // Users joined previous month
        tables.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
            queries: [
                Query.greaterThanEqual('$createdAt', startPrev),
                Query.lessThanEqual('$createdAt', endPrev),
            ]
        }),
        // Total trips
        tables.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.tripsTableId,
        }),
        // Trips created current month
        tables.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.tripsTableId,
            queries: [
                Query.greaterThanEqual('$createdAt', startCurrent),
            ]
        }),
        // Trips created previous month
        tables.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.tripsTableId,
            queries: [
                Query.greaterThanEqual('$createdAt', startPrev),
                Query.lessThanEqual('$createdAt', endPrev),
            ]
        }),
        // Active users total (users with role)
        tables.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
        }),
        // Active users current month
        tables.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
            queries: [
                Query.greaterThanEqual('$createdAt', startCurrent),
            ]
        }),
        // Active users previous month
        tables.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
            queries: [
                Query.greaterThanEqual('$createdAt', startPrev),
                Query.lessThanEqual('$createdAt', endPrev),
            ]
        }),
    ]);

    return {
        totalUsers: totalUsers.total,
        usersJoined: {
            currentMonth: usersCurrentMonth.total,
            lastMonth: usersPrevMonth.total,
        },
        userRole: {
            total: activeUsers.total,
            currentMonth: activeUsersCurrentMonth.total,
            lastMonth: activeUsersPrevMonth.total,
        },
        totalTrips: totalTrips.total,
        tripsCreated: {
            currentMonth: tripsCurrentMonth.total,
            lastMonth: tripsPrevMonth.total,
        },
    };

}

export const getUserGrowthPerDay = async () => {
    const users = await tables.listRows({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.usersTableId,
    });

    const userGrowth = users.rows.reduce(
        (acc: { [key: string]: number }, user: Document) => {
            const date = new Date(user.$createdAt);
            const day = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        },
        {}
    );

    return Object.entries(userGrowth).map(([day, count]) => ({
        count: Number(count),
        day,
    }));
};

export const getTripsCreatedPerDay = async () => {
    const trips = await tables.listRows({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.tripsTableId,
    });

    const tripsGrowth = trips.rows.reduce(
        (acc: { [key: string]: number }, trip: Document) => {
            const date = new Date(trip.$createdAt);
            const day = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            });
            acc[day] = (acc[day] || 0) + 1;
            return acc;
        },
        {}
    );

    return Object.entries(tripsGrowth).map(([day, count]) => ({
        count: Number(count),
        day,
    }));
};

export const getTripsByTravelStyle = async () => {
    const trips = await tables.listRows({
        databaseId: appwriteConfig.databaseId,
        tableId: appwriteConfig.tripsTableId,
    });

    const travelStyleCounts = trips.rows.reduce(
        (acc: { [key: string]: number }, trip: Document) => {
            const tripDetail = parseTripData(trip.tripDetails);

            if (tripDetail && tripDetail.travelStyle) {
                const travelStyle = tripDetail.travelStyle;
                acc[travelStyle] = (acc[travelStyle] || 0) + 1;
            }
            return acc;
        },
        {}
    );

    return Object.entries(travelStyleCounts).map(([travelStyle, count]) => ({
        count: Number(count),
        travelStyle,
    }));
};