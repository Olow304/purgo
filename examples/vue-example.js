// main.js
import 'purgo'; // Import at the entry point
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');

// App.vue
<template>
  <div>
    <h1>Patient Information</h1>
    <p>Name: {{ patient.name }}</p>
    <p>Email: {{ patient.email }}</p>
    <p>Phone: {{ patient.phone }}</p>
    <p>SSN: {{ patient.ssn }}</p>
    <p>MRN: {{ patient.mrn }}</p>
    <button @click="logPatientData">Log Patient Data</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      patient: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        ssn: '123-45-6789',
        mrn: '12345678'
      }
    };
  },
  methods: {
    logPatientData() {
      // This log will be automatically redacted
      console.log('Patient data:', this.patient);
      
      // API call with PHI will be redacted
      fetch(`https://api.example.com/patients?email=${this.patient.email}`)
        .then(response => response.json())
        .then(data => console.log('API response:', data));
    }
  }
};
</script>
