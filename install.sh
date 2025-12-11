#!/bin/bash

echo "Installing Firebase dependencies..."
npm install firebase

echo "Building CSS..."
npm run build:css

echo "Setup complete! Your Community Help Platform is ready with Firebase integration."
echo ""
echo "Features included:"
echo "✅ Firebase Authentication (Email/Password + Google Sign-in)"
echo "✅ Firestore Database for users and requests"
echo "✅ Firebase Storage for file uploads"
echo "✅ Real-time messaging"
echo "✅ Protected routes with authentication guards"
echo ""
echo "To start development:"
echo "1. Run 'npm run dev' to watch CSS changes"
echo "2. Open index.html in your browser"
echo "3. Register as a citizen or volunteer to test the system"