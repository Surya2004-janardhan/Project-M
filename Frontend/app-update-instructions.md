// UPDATE YOUR App.js with this structure:

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import your pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import YouTubePage from './pages/YouTubePage';
import UsagePage from './pages/UsagePage';
import ContentPage from './pages/ContentPage';

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
return <Navigate to="/" replace />;
}

// User is not logged in, show login/signup page
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
            <Route
              path="/youtube"
              element={
                <ProtectedRoute>
                  <YouTubePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usage"
              element={
                <ProtectedRoute>
                  <UsagePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/content"
              element={
                <ProtectedRoute>
                  <ContentPage />
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
