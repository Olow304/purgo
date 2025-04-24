// app/layout.tsx
import 'purgo'; // Import at the root layout

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// app/page.tsx
'use client';

import { useState } from 'react';

export default function PatientPage() {
  const [patient, setPatient] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '123-456-7890',
    ssn: '123-45-6789',
    mrn: '12345678'
  });

  const handleClick = () => {
    // This log will be automatically redacted
    console.log('Patient data:', patient);
  };

  return (
    <div>
      <h1>Patient Information</h1>
      <p>Name: {patient.name}</p>
      <p>Email: {patient.email}</p>
      <p>Phone: {patient.phone}</p>
      <p>SSN: {patient.ssn}</p>
      <p>MRN: {patient.mrn}</p>
      <button onClick={handleClick}>Log Patient Data</button>
    </div>
  );
}

// app/api/patient/route.ts
import 'purgo/node'; // Import in API routes

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  
  // This log will be redacted
  console.log(`Searching for patient with email: ${email}`);
  
  return Response.json({
    patient: {
      name: 'John Doe',
      email: email,
      phone: '123-456-7890'
    }
  });
}
