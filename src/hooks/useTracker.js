import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { col } from '../utils/firestorePath';

function encodePath(path) {
  return btoa(path).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function getVisitorId(user) {
  if (user) return 'u_' + user.uid;
  let id = localStorage.getItem('tracker_id');
  if (!id) {
    id = 'a_' + crypto.randomUUID();
    localStorage.setItem('tracker_id', id);
  }
  return id;
}

export default function useTracker() {
  const location = useLocation();
  const { user } = useAuth();
  const userRef = useRef(user);
  userRef.current = user;

  const pathKey = location.pathname + location.search;

  useEffect(() => {
    if (!window.location.hostname.endsWith('palashkantikundu.in')) return;
    if (pathKey.startsWith('/analytics')) return;

    const encoded = encodePath(pathKey);
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
    const currentUser = userRef.current;

    const isReturning = !!currentUser || !!localStorage.getItem('tracker_id');
    getVisitorId(currentUser);

    setDoc(doc(db, col('page_stats'), encoded), {
      path: pathKey,
      views: increment(1),
      newUsers: increment(isReturning ? 0 : 1),
      returningUsers: increment(isReturning ? 1 : 0),
      [`tz.${timezone}`]: increment(1),
      lastViewed: serverTimestamp(),
    }, { merge: true });
  }, [pathKey]);
}
