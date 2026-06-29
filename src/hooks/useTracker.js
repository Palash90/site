import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

function encodePath(path) {
  return btoa(path).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

export default function useTracker() {
  const location = useLocation();

  useEffect(() => {
    if (!window.location.hostname.endsWith('palashkantikundu.in')) return;

    const path = location.pathname + location.search;
    const encoded = encodePath(path);

    setDoc(doc(db, 'page_stats', encoded), {
      path,
      views: increment(1),
      lastViewed: serverTimestamp(),
    }, { merge: true });
  }, [location]);
}
