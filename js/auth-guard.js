// Authentication Guard
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getCurrentUserData } from './auth.js';

// Check if user is authenticated and redirect if not
export const requireAuth = (requiredRole = null) => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // User not authenticated, redirect to login
        window.location.href = '../pages/login.html';
        reject('Not authenticated');
        return;
      }

      if (requiredRole) {
        const userData = await getCurrentUserData();
        if (!userData || userData.role !== requiredRole) {
          // User doesn't have required role
          if (userData?.role === 'citizen') {
            window.location.href = '../pages/citizen_dashboard.html';
          } else if (userData?.role === 'volunteer') {
            window.location.href = '../pages/volunteer_dashboard.html';
          } else {
            window.location.href = '../pages/login.html';
          }
          reject('Insufficient permissions');
          return;
        }
      }

      resolve(user);
    });
  });
};

// Get current user or redirect to login
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        resolve(user);
      } else {
        window.location.href = '../pages/login.html';
        reject('Not authenticated');
      }
    });
  });
};