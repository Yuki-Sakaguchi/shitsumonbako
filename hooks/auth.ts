import { useEffect } from 'react';
import firebase from '../lib/firebase';
import { User } from '../models/User';
import { atom, useRecoilState } from 'recoil';

// atom関数でステータスを定義
const userState = atom<User>({
  key: 'user',
  default: null,
});

// データを扱う
export function useAuthentication() {
  const [user, setUser] = useRecoilState(userState);

  useEffect(() => {
    if (user !== null) {
      return;
    }

    firebase
      .auth()
      .signInAnonymously()
      .catch(error => {
        console.log(error);
      });

    firebase
      .auth()
      .onAuthStateChanged(firebaseUser => {
        if (firebaseUser) {
          const loginUser: User = {
            uid: firebaseUser.uid,
            isAnonymous: firebaseUser.isAnonymous,
            name: '',
          }
          setUser(loginUser);
          createUserIfNotFound(loginUser);
        } else {
          setUser(null);
        }
      });

  }, []);

  return { user };
}

async function createUserIfNotFound(user: User) {
  const userRef = firebase.firestore().collection('users').doc(user.uid);
  const doc = await userRef.get();

  if (doc.exists) {
    return;
  }

  await userRef.set({
    name: 'taro' + new Date().getTime(),
  });
}
