// Update your App.js to use this structure for proper routing:

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';

// Import your pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// Component to redirect authenticated users away from login/signup
const PublicRoute = ({ children }) => {
const { user, loading } = useAuth();

if (loading) {
return (
<div className="min-h-screen flex items-center justify-center">
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
</div>
);
}

// If user is already logged in, redirect to home
if (user) {
console.log('🔄 User already logged in, redirecting to home');
return <Navigate to="/" replace />;
}

// User is not logged in, show login/signup page
return children;
};

// Component to protect routes that require authentication
const ProtectedRoute = ({ children }) => {
const { user, loading } = useAuth();

if (loading) {
return (
<div className="min-h-screen flex items-center justify-center">
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-900"></div>
</div>
);
}

// If user is not logged in, redirect to login
if (!user) {
console.log('🔒 User not authenticated, redirecting to login');
return <Navigate to="/login" replace />;
}

// User is authenticated, show protected content
return children;
};

function App() {
return (
<AuthProvider>
<Router>
<div className="min-h-screen bg-gradient-to-br from-amber-50 to-red-100">
<Routes>
{/_ Public routes - redirect to home if already logged in _/}
<Route
path="/login"
element={
<PublicRoute>
<LoginPage />
</PublicRoute>
}
/>
<Route
path="/signup"
element={
<PublicRoute>
<SignupPage />
</PublicRoute>
}
/>

            {/* Protected routes - require authentication */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>

);
}

export default App;
