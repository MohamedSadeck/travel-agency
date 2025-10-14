import { OAuthProvider, Query } from "appwrite";
import { account, appwriteConfig, tables } from "./client";
import { redirect } from "react-router";

export const loginWithGoogle = async () => {
    try {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        account.createOAuth2Session({
            provider: OAuthProvider.Google,
            success: `${origin}/`,
            failure: `${origin}/sign-in`
        })
    } catch (error) {
        console.error('Login with Google failed', error);
    }
}

export const getUser = async () => {
    try {
        const user = await account.get();
        if (!user) return redirect('/sign-in');

        const rows = await tables.listRows({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
            queries: [
                Query.equal('$id', user.$id),
                Query.select(['$id', 'name', 'email', 'imageUrl', '$createdAt', '$updatedAt'])
            ]
        });
        
        if (!rows.rows || rows.rows.length === 0) {
            return redirect('/sign-in');
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
    } catch (error) {
        console.error('Get user failed', error);
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
            return existingUser;
        }

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
            }
        });

        return newUser;
    } catch (error) {
        console.error('Store user data failed', error);
    }
}