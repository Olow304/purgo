// Import Purgo Node adapter
import 'purgo/node';
import { pinoRedactor } from 'purgo/node';

// Try to import pino (optional)
let pino;
try {
  pino = require('pino');
} catch (e) {
  console.warn('Pino not installed. To run this example: npm install pino');
}

// Log some PHI data - it will be automatically redacted
console.log('Patient email: patient@example.com');
console.log('SSN: 123-45-6789');

// Direct output to stdout (will be redacted)
process.stdout.write('Phone: (555) 123-4567\n');
process.stdout.write('MRN: 12345678\n');

// Using with Pino (if available)
if (pino) {
  const logger = pino({
    redact: pinoRedactor({
      paths: ['patient.email', 'patient.ssn', 'patient.phone', 'patient.mrn']
    })
  });

  // Log an object with PHI
  logger.info({
    patient: {
      name: 'John Doe',
      email: 'john.doe@example.com', // Will be redacted
      phone: '123-456-7890', // Will be redacted
      ssn: '123-45-6789', // Will be redacted
      mrn: '12345678' // Will be redacted
    }
  });
}
