import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function RedirectHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkRedirections = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'redirections'));
        const redirections = querySnapshot.docs.map(doc => doc.data());
        
        const currentPath = location.pathname;
        const match = redirections.find(r => r.oldUrl === currentPath);
        
        if (match && match.newUrl) {
          navigate(match.newUrl, { replace: true });
        }
      } catch (error) {
        console.error("Error checking redirections:", error);
      }
    };

    checkRedirections();
  }, [location.pathname, navigate]);

  return null;
}
