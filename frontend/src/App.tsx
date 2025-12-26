import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import Verify from './pages/Auth/Verify';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import EventsList from './pages/Seeker/EventsList';
import MyEnrollments from './pages/Seeker/MyEnrollments';
import CreateEvent from './pages/Facilitator/CreateEvent';
import MyEvents from './pages/Facilitator/MyEvents';

const App: React.FC = () => {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<Verify />} />

        <Route path="/" element={<Layout />}>
          {/* Protected Routes */}

          {/* Seeker Routes */}
          <Route element={<ProtectedRoute allowedRoles={['SEEKER']} />}>
            <Route path="events" element={<EventsList />} />
            <Route path="my-enrollments" element={<MyEnrollments />} />
          </Route>

          {/* Facilitator Routes */}
          <Route element={<ProtectedRoute allowedRoles={['FACILITATOR']} />}>
            <Route path="my-events" element={<MyEvents />} />
            <Route path="create-event" element={<CreateEvent />} />
          </Route>

          {/* Redirect root based on login status? Or Landing page. 
               For now, redirect to login if not logged in, or filtered by ProtectedRoute logic 
               if we had a dashboard wrapper.
               Let's just redirect root to /login for simplicity or handle in a logic component.
            */}
          <Route index element={<Navigate to="/login" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
