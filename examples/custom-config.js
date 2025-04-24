// Import Purgo with custom configuration
import { purgo, redact } from 'purgo';

// Initialize with custom settings
purgo({
  // Specify which targets to patch
  targets: ['console', 'fetch', 'xhr'],
  
  // Specify patterns to match
  patterns: [
    // Built-in patterns
    'email',
    'phone',
    'ssn',
    
    // Custom patterns
    /\b[A-Z]{2}-\d{6}\b/g, // Custom patient ID format
    /\b[A-Z]{3}\d{5}\b/g   // Custom insurance ID format
  ],
  
  // Custom censor function
  censor: (match) => {
    // Keep the last 2 characters
    return '***' + match.slice(-2);
  },
  
  // Enable hash mode for correlation
  hashMode: true
});

// Log some PHI data with custom redaction
console.log('Patient email: patient@example.com');
console.log('SSN: 123-45-6789');
console.log('Custom patient ID: AB-123456');
console.log('Custom insurance ID: XYZ12345');

// Using the redact helper directly
const patientData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  ssn: '123-45-6789',
  patientId: 'AB-123456',
  insuranceId: 'XYZ12345'
};

const safeData = redact(patientData);
console.log('Safe data:', safeData);
