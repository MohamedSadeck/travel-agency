import { Query } from "appwrite";
import { appwriteConfig, tables } from "./client";

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