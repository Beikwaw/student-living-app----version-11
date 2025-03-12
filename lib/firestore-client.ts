import { 
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  Timestamp
} from 'firebase/firestore';
import { clientDb } from './firebase-client';
import { UserData } from './types';

const USERS_COLLECTION = 'users';

export const createUser = async (
  userData: Omit<UserData, 'createdAt' | 'applicationStatus'> & {
    requestDetails?: Omit<NonNullable<UserData['requestDetails']>, 'dateSubmitted'>;
  }
) => {
  const userRef = doc(clientDb, USERS_COLLECTION, userData.id);
  const now = new Date();
  
  await setDoc(userRef, {
    ...userData,
    createdAt: now,
    applicationStatus: 'pending',
    requestDetails: userData.requestDetails ? {
      ...userData.requestDetails,
      dateSubmitted: now
    } : undefined,
    communicationLog: []
  });
};

export const getUserById = async (userId: string) => {
  const userRef = doc(clientDb, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data();
    return {
      id: userSnap.id,
      ...data,
      createdAt: data.createdAt.toDate(),
      requestDetails: data.requestDetails ? {
        ...data.requestDetails,
        dateSubmitted: data.requestDetails.dateSubmitted.toDate()
      } : undefined,
      communicationLog: data.communicationLog?.map((log: any) => ({
        ...log,
        timestamp: log.timestamp.toDate()
      }))
    } as UserData;
  }
  return null;
};

export const addCommunication = async (
  userId: string,
  message: string,
  sentBy: 'admin' | 'user'
) => {
  const userRef = doc(clientDb, USERS_COLLECTION, userId);
  const now = new Date();

  await updateDoc(userRef, {
    communicationLog: arrayUnion({
      message,
      sentBy,
      timestamp: Timestamp.fromDate(now)
    })
  });
};

export const updateUser = async (userId: string, updates: Partial<UserData>) => {
  const userRef = doc(clientDb, USERS_COLLECTION, userId);
  await updateDoc(userRef, updates);
}; 