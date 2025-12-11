// Enhanced Features Service
import { db, auth, storage } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    query, 
    where, 
    orderBy, 
    onSnapshot,
    serverTimestamp,
    getDoc
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// User Verification System
export const verificationService = {
    async submitVerification(verificationData) {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        
        return await addDoc(collection(db, 'verificationRequests'), {
            userId: user.uid,
            ...verificationData,
            status: 'pending',
            submittedAt: serverTimestamp()
        });
    },
    
    async getVerificationStatus(userId) {
        const q = query(
            collection(db, 'verificationRequests'),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(q);
        return snapshot.empty ? null : snapshot.docs[0].data();
    }
};

// Request Templates System
export const templateService = {
    async getTemplates() {
        const snapshot = await getDocs(collection(db, 'requestTemplates'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async createTemplate(template) {
        return await addDoc(collection(db, 'requestTemplates'), {
            ...template,
            createdAt: serverTimestamp()
        });
    },
    
    getDefaultTemplates() {
        return [
            {
                id: 'grocery',
                title: 'Grocery Shopping',
                category: 'shopping',
                description: 'Need help with grocery shopping',
                urgency: 'medium',
                estimatedTime: '1-2 hours'
            },
            {
                id: 'tech',
                title: 'Tech Support',
                category: 'technology',
                description: 'Need help with computer/phone issues',
                urgency: 'low',
                estimatedTime: '30 minutes - 1 hour'
            },
            {
                id: 'transport',
                title: 'Transportation',
                category: 'transportation',
                description: 'Need a ride to appointment/location',
                urgency: 'medium',
                estimatedTime: '1-3 hours'
            },
            {
                id: 'emergency',
                title: 'Emergency Assistance',
                category: 'emergency',
                description: 'Urgent help needed',
                urgency: 'high',
                estimatedTime: 'Immediate'
            }
        ];
    }
};

// Enhanced Review System
export const reviewService = {
    async createReview(reviewData) {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        
        return await addDoc(collection(db, 'reviews'), {
            reviewerId: user.uid,
            ...reviewData,
            createdAt: serverTimestamp()
        });
    },
    
    async getReviewsForVolunteer(volunteerId) {
        const q = query(
            collection(db, 'reviews'),
            where('volunteerId', '==', volunteerId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};

// Community Board System
export const communityService = {
    async createPost(postData) {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        
        return await addDoc(collection(db, 'communityPosts'), {
            authorId: user.uid,
            ...postData,
            createdAt: serverTimestamp(),
            likes: 0,
            comments: []
        });
    },
    
    async getPosts() {
        const q = query(
            collection(db, 'communityPosts'),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async createSuccessStory(storyData) {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        
        return await addDoc(collection(db, 'successStories'), {
            authorId: user.uid,
            ...storyData,
            createdAt: serverTimestamp(),
            featured: false
        });
    },
    
    async getSuccessStories() {
        const q = query(
            collection(db, 'successStories'),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
};

// Volunteer Enhancement System
export const volunteerService = {
    async updateVolunteerProfile(profileData) {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        
        const userRef = doc(db, 'users', user.uid);
        return await updateDoc(userRef, {
            ...profileData,
            updatedAt: serverTimestamp()
        });
    },
    
    async getVolunteerStats(volunteerId) {
        // Get completed requests
        const completedRequests = query(
            collection(db, 'requests'),
            where('acceptedBy', '==', volunteerId),
            where('status', '==', 'completed')
        );
        const completedSnapshot = await getDocs(completedRequests);
        
        // Get ratings
        const ratings = query(
            collection(db, 'ratings'),
            where('volunteerId', '==', volunteerId)
        );
        const ratingsSnapshot = await getDocs(ratings);
        
        const ratingsData = ratingsSnapshot.docs.map(doc => doc.data());
        const avgRating = ratingsData.length > 0 
            ? ratingsData.reduce((sum, r) => sum + r.rating, 0) / ratingsData.length 
            : 0;
        
        return {
            tasksCompleted: completedSnapshot.size,
            totalRatings: ratingsData.length,
            averageRating: avgRating,
            hoursVolunteered: completedSnapshot.size * 2 // Estimate 2 hours per task
        };
    },
    
    async createVolunteerGroup(groupData) {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        
        return await addDoc(collection(db, 'volunteerGroups'), {
            ...groupData,
            createdBy: user.uid,
            members: [user.uid],
            createdAt: serverTimestamp()
        });
    }
};

// Request Enhancement System
export const requestEnhancementService = {
    async createRecurringRequest(requestData, schedule) {
        const user = auth.currentUser;
        if (!user) throw new Error('User not authenticated');
        
        return await addDoc(collection(db, 'requests'), {
            ...requestData,
            recurring: true,
            schedule: schedule,
            createdBy: user.uid,
            createdAt: serverTimestamp(),
            status: 'pending'
        });
    },
    
    async getRequestHistory(userId) {
        const q = query(
            collection(db, 'requests'),
            where('createdBy', '==', userId),
            where('status', '==', 'completed'),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    
    async setRequestExpiration(requestId, expirationHours = 72) {
        const requestRef = doc(db, 'requests', requestId);
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + expirationHours);
        
        return await updateDoc(requestRef, {
            expiresAt: expirationTime,
            autoExpire: true
        });
    }
};