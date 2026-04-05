import React from 'react'
import Cards from './components/Cards'
import DashBoard from './components/DashBoard'
import Login from "./components/Login/Login.jsx"
import Details from "./components/Details/Details.jsx";
import Signup from "./components/Signup/Signup.jsx";
import Navbar from "./components/Navbar.jsx";
import Profile from "./components/Profile.jsx";
import OrganizerRoute from "./components/OrganizerRoutes.jsx";
import MyEvents from "./components/MyEvents.jsx";
import CreateEvent from "./components/CreateEvent.jsx";
import Payment from "./components/Payment";
import Success from "./components/Success";
import MyBookings from "./components/MyBookings.jsx";
import EditEvent from './components/EditEvent.jsx';
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import Cancel from "./components/Cancel.jsx"

import {Routes,Route} from "react-router-dom"
import { useLocation } from 'react-router-dom';
import { Navigate } from "react-router-dom";

const App = () => {
  const location=useLocation();

  return (
    <>
         {location.pathname !== "/login" &&
          location.pathname !== "/signup" && <Navbar />}
    <Routes>
            <Route
              path="/"
              element={
                localStorage.getItem("token")
                  ? <Navigate to="/dashboard" />
                  : <Navigate to="/login" />
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup/>}/>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashBoard />
               </ProtectedRoute>}
            />
            <Route path="/details/:id" element={
              <ProtectedRoute>
              <Details />
              </ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute>
                                              <Profile />
                                            </ProtectedRoute>} />
            <Route path="/my-events"element={
              <ProtectedRoute>
                <OrganizerRoute>
                  <MyEvents />
                </OrganizerRoute>
              </ProtectedRoute>
              }
            />

            <Route
              path="/create-event"
              element={
                <ProtectedRoute>
                <OrganizerRoute>
                  <CreateEvent />
                </OrganizerRoute>
                </ProtectedRoute>
              }
            />
            <Route path="/payment" element={
              <ProtectedRoute>
              <Payment />
            </ProtectedRoute>} />
            <Route path="/success" element={
              <ProtectedRoute>
              <Success />
            </ProtectedRoute>} />
            <Route path="/my-bookings" element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>} />
            <Route path="/edit-event/:id" element={
              <ProtectedRoute>
                <EditEvent />
              </ProtectedRoute>} />
              <Route path="/cancel" element={<Cancel />} />
         </Routes>

      </>
  )
}


export default App
