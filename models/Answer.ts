import firebase from '../lib/firebase';

export interface Answer {
  id: string;
  uid: string;
  questionId: string;
  body: string;
  createdAt: firebase.firestore.Timestamp;
}