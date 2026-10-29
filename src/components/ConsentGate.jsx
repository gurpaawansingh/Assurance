import React from 'react';
import { Navigate } from 'react-router-dom';
import { consent } from './safety/safetyUtils';

export default function ConsentGate({ children }) {
  if (!consent.get()) return <Navigate to="/consent" replace />;
  return children;
}