// Import Purgo (zero-config)
import 'purgo';

// Log some PHI data - it will be automatically redacted
console.log('Patient email: patient@example.com');
console.log('SSN: 123-45-6789');
console.log('Phone: (555) 123-4567');
console.log('MRN: 12345678');
console.log('Diagnosis: J45.901');

// Log an object with PHI
console.log({
  patient: {
    name: 'John Doe', // Name is not redacted by default
    email: 'john.doe@example.com', // Will be redacted
    phone: '123-456-7890', // Will be redacted
    ssn: '123-45-6789', // Will be redacted
    mrn: '12345678', // Will be redacted
    diagnosis: 'J45.901' // Will be redacted
  }
});

// Using fetch with PHI in URL (will be redacted)
fetch('https://api.example.com/patients?email=john.doe@example.com')
  .then(response => response.json())
  .then(data => console.log(data));

// Using fetch with PHI in body (will be redacted)
fetch('https://api.example.com/patients', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john.doe@example.com',
    ssn: '123-45-6789'
  })
});
