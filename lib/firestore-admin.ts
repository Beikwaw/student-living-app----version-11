import { 
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  arrayUnion,
  Timestamp
} from 'firebase-admin/firestore';
import { adminDb } from './firebase-admin';
import { UserData } from './types';

const USERS_COLLECTION = 'users';

export const getAllUsers = async () => {
  const usersRef = adminDb.collection(USERS_COLLECTION);
  const usersSnap = await usersRef.get();
  return usersSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
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
  });
};

export const getPendingApplications = async () => {
  const usersRef = adminDb.collection(USERS_COLLECTION);
  const pendingQuery = usersRef.where('applicationStatus', '==', 'pending');
  const pendingSnap = await pendingQuery.get();
  return pendingSnap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
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
  });
};

export const processRequest = async (
  userId: string,
  status: 'accepted' | 'denied',
  message: string,
  adminId: string
) => {
  const userRef = adminDb.collection(USERS_COLLECTION).doc(userId);
  const now = new Date();

  await userRef.update({
    applicationStatus: status,
    communicationLog: arrayUnion({
      message,
      sentBy: 'admin',
      timestamp: Timestamp.fromDate(now)
    })
  });
};

export const deleteUser = async (userId: string) => {
  const userRef = adminDb.collection(USERS_COLLECTION).doc(userId);
  await userRef.delete();
}; 