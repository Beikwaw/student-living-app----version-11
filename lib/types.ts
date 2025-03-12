export interface RequestDetails {
  accommodationType: string;
  location: string;
  dateSubmitted?: Date;
}

export interface UserData {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin';
  createdAt: Date;
  applicationStatus?: 'pending' | 'accepted' | 'denied';
  requestDetails?: RequestDetails;
  communicationLog?: {
    message: string;
    sentBy: 'admin' | 'user';
    timestamp: Date;
  }[];
} 