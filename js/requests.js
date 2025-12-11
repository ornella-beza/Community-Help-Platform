// Help Requests Service
import { db, storage } from './firebase-config.js';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { ref, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Create new help request
export const createRequest = async (requestData, files = []) => {
  try {
    console.log('Creating request with data:', requestData);
    console.log('Files to upload:', files.length);
    
    const attachments = [];
    
    // Upload files if any
    if (files.length > 0) {
      console.log('Uploading files...');
      for (const file of files) {
        const storageRef = ref(storage, `requests/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        attachments.push(downloadURL);
      }
      console.log('Files uploaded:', attachments.length);
    }
    
    const requestDoc = {
      ...requestData,
      attachments,
      status: 'pending',
      createdAt: serverTimestamp(),
      acceptedBy: null,
      acceptedAt: null
    };
    
    console.log('Adding document to Firestore:', requestDoc);
    const docRef = await addDoc(collection(db, 'requests'), requestDoc);
    console.log('Document added with ID:', docRef.id);
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error in createRequest:', error);
    return { success: false, error: error.message };
  }
};

// Get all pending requests
export const getPendingRequests = async () => {
  try {
    const q = query(
      collection(db, 'requests'), 
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, requests };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user's requests
export const getUserRequests = async (userId) => {
  try {
    const q = query(
      collection(db, 'requests'), 
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const requests = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, requests };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Accept a request
export const acceptRequest = async (requestId, volunteerId) => {
  try {
    await updateDoc(doc(db, 'requests', requestId), {
      acceptedBy: volunteerId,
      acceptedAt: serverTimestamp(),
      status: 'accepted'
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Update request status
export const updateRequestStatus = async (requestId, status) => {
  try {
    await updateDoc(doc(db, 'requests', requestId), {
      status,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Listen to requests in real-time
export const listenToRequests = (callback, filters = {}) => {
  console.log('Setting up request listener with filters:', filters);
  let q = collection(db, 'requests');
  
  if (filters.status) {
    q = query(q, where('status', '==', filters.status));
  }
  if (filters.createdBy) {
    q = query(q, where('createdBy', '==', filters.createdBy));
  }
  if (filters.acceptedBy) {
    q = query(q, where('acceptedBy', '==', filters.acceptedBy));
  }
  
  q = query(q, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    console.log('Firestore snapshot received, docs:', snapshot.size);
    const requests = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Request doc:', doc.id, data);
      requests.push({ id: doc.id, ...data });
    });
    console.log('Total requests loaded:', requests.length);
    callback(requests);
  }, (error) => {
    console.error('Error listening to requests:', error);
  });
};