// main.jsx
import 'purgo'; // Import at the entry point
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// App.jsx
import React, { useState } from 'react';

function App() {
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
    
    // API call with PHI will be redacted
    fetch(`https://api.example.com/patients?email=${patient.email}`)
      .then(response => response.json())
      .then(data => console.log('API response:', data));
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

export default App;
