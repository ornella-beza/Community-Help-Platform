// Messaging Service
import { db } from './firebase-config.js';
import { 
  collection, 
  doc, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Send message
export const sendMessage = async (requestId, senderId, text) => {
  try {
    await addDoc(collection(db, 'requests', requestId, 'messages'), {
      senderId,
      text,
      timestamp: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Listen to messages in real-time
export const listenToMessages = (requestId, callback) => {
  const q = query(
    collection(db, 'requests', requestId, 'messages'),
    orderBy('timestamp', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const messages = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() });
    });
    callback(messages);
  });
};