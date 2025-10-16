import { OAuthProvider, Query } from "appwrite";
import { account, appwriteConfig, tables } from "./client";
import { redirect } from "react-router";

export const loginWithGoogle = async () => {
    try {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        account.createOAuth2Session({
            provider: OAuthProvider.Google,
            success: `${origin}/sign-in?oauth=success`,
            failure: `${origin}/sign-in?oauth=failure`
        });
    } catch (error) {
        console.error('Login with Google failed', error);
    }
}

export const getUser = async () => {
    try {
        const user = await account.get();
        if (!user) return redirect('/sign-in');

        try {
            const rows = await tables.listRows({
                databaseId: appwriteConfig.databaseId,
                tableId: appwriteConfig.usersTableId,
                queries: [
                    Query.equal('$id', user.$id),
                    Query.select(['$id', 'name', 'email', 'imageUrl', '$createdAt', '$updatedAt'])
                ]
            });
            
            if (!rows.rows || rows.rows.length === 0) {
                // User exists in Auth but not in database - try to create them
                console.log('User not found in database, attempting to create...');
                try {
                    await storeUserData();
                    // Retry fetching after creation
                    const retryRows = await tables.listRows({
                        databaseId: appwriteConfig.databaseId,
                        tableId: appwriteConfig.usersTableId,
                        queries: [
                            Query.equal('$id', user.$id),
                            Query.select(['$id', 'name', 'email', 'imageUrl', '$createdAt', '$updatedAt'])
                        ]
                    });
                    
                    if (retryRows.rows && retryRows.rows.length > 0) {
                        const userData = retryRows.rows[0];
                        return {
                            id: userData.$id,
                            name: userData.name,
                            email: userData.email,
                            imageUrl: userData.imageUrl || '',
                            createdAt: userData.$createdAt,
                            updatedAt: userData.$updatedAt
                        } as User;
                    }
                } catch (createError) {
                    console.error('Failed to create user in database:', createError);
                }
                
                // If we still can't get/create user in DB, use auth data as fallback
                console.warn('Using auth data as fallback for user information');
                return {
                    id: user.$id,
                    name: user.name,
                    email: user.email,
                    imageUrl: '',
                    createdAt: user.$createdAt,
                    updatedAt: user.$updatedAt
                } as User;
            }
            
            const userData = rows.rows[0];
            
            return {
                id: userData.$id,
                name: userData.name,
                email: userData.email,
                imageUrl: userData.imageUrl || '',
                createdAt: userData.$createdAt,
                updatedAt: userData.$updatedAt
            } as User;
        } catch (dbError: any) {
            // Database read failed (likely permissions issue)
            // Use auth user data as fallback
            console.error('Database query failed, using auth data:', dbError.message || dbError);
            return {
                id: user.$id,
                name: user.name,
                email: user.email,
                imageUrl: '',
                createdAt: user.$createdAt,
                updatedAt: user.$updatedAt
            } as User;
        }
    } catch (error) {
        console.error('Get user failed', error);
        return redirect('/sign-in');
    }
}

export const getGooglePicture = async () => {
    try {
        // Get the current session to retrieve the access token
        const session = await account.getSession({ sessionId: 'current' });
        const accessToken = session.providerAccessToken;

        if (!accessToken) {
            throw new Error('No access token available');
        }

        // Fetch user info from Google People API
        const response = await fetch(
            'https://people.googleapis.com/v1/people/me?personFields=photos',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch profile photo from Google');
        }

        const data = await response.json();

        // Return the photo URL (Google provides multiple sizes, we'll return the first one)
        return data.photos?.[0]?.url || null;
    } catch (error) {
        console.error('Get Google picture failed', error);
        return null;
    }
}

export const logoutUser = async () => {
    try {
        await account.deleteSession({ sessionId: 'current' });
        return redirect('/sign-in');
    } catch (error) {
        console.error('Logout failed', error);
    }
}

export const getExistingUser = async (id: string) => {
    try {
        const rows = await tables.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
            queries: [
                Query.equal('$id', id),
                Query.limit(1)
            ]
        });

        return rows.rows && rows.rows.length > 0 ? rows.rows[0] : null;
    } catch (error) {
        console.error('Get existing user failed', error);
        return null;
    }
}

export const storeUserData = async () => {
    try {
        const user = await account.get();
        if (!user) throw new Error('No user session found');

        // Check if user already exists
        const existingUser = await getExistingUser(user.$id);
        if (existingUser) {
            console.log('User already exists in database:', existingUser.$id);
            return existingUser;
        }

        console.log('Creating new user in database:', user.$id);

        // Get the profile picture URL
        const imageUrl = await getGooglePicture();

        // Generate a unique row ID
        const rowId = user.$id;

        // Create new user record in the database
        const newUser = await tables.createRow({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
            rowId: rowId,
            data: {
                name: user.name,
                email: user.email,
                imageUrl: imageUrl || '',
            },
        });

        console.log('User created successfully in database:', newUser.$id);
        return newUser;
    } catch (error: any) {
        console.error('Store user data failed:', error.message || error);
        
        // Provide more specific error information
        if (error?.code === 401 || error?.type === 'general_unauthorized_scope') {
            throw new Error('Database permissions error: Please configure your Appwrite Users table to allow "Create" permission for "Any" or "Users" role');
        }
        
        throw error; // Re-throw to let caller handle it
    }
}

export const getAllUsers = async (limit: number, offset: number) =>{
    try {
        const res = await tables.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
            queries: [
                Query.limit(limit),
                Query.offset(offset),
                Query.select(['$id', 'name', 'email', 'imageUrl', '$createdAt', 'status'])
            ]
        });

        if(!res.rows || res.rows.length === 0) return { users: [], total: 0};

        return {
            users:
            res.rows.map(row => ({
                id: row.$id,
                name: row.name,
                email: row.email,
                imageUrl: row.imageUrl || '',
                createdAt: row.$createdAt,
                status: row.status || 'user'
            } as UserData)),
            total: res.total
        }
    } catch (error) {
        console.log('Error: getAllUsers failed', error)
        return { users: [], total:0}
    }
}