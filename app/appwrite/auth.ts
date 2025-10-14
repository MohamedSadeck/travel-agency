import { OAuthProvider, Query } from "appwrite";
import { account, appwriteConfig, tables } from "./client";
import { redirect } from "react-router";

export const loginWithGoogle = async ()=> {
    try{
        account.createOAuth2Session({provider:OAuthProvider.Google})
    }catch(error){
        console.error('Login with Google failed', error);
    }
}
export const logoutUser = async ()=> {
    try{

    }catch(error){
        console.error('Logout failed', error);
    }
}
export const getUser = async ()=> {
    try{
        const user = await account.get();
        if(!user) return redirect('/sign-in');

        const rows = await tables.listRows ({
            databaseId: appwriteConfig.databaseId,
            tableId: appwriteConfig.usersTableId,
            queries: [
                Query.equal('userId', user.$id),
                Query.select(['name', 'email', 'imageUrl', 'joinedAt', 'accountId'])
            ]
        });
        return user;
    }catch(error){
        console.error('Get user failed', error);
    }
}
export const getGooglePicture = async ()=> {
    try{

    }catch(error){
        console.error('Get Google picture failed', error);
    }
}
export const storeUserData = async ()=> {
    try{

    }catch(error){
        console.error('Store user data failed', error);
    }
}
export const getExistingUser = async ()=> {
    try{

    }catch(error){
        console.error('Get existing user failed', error);
    }
}