const request = require('supertest');

// Simple debug script to see the actual validation response
async function debugValidation() {
  try {
    // You'll need to manually get the admin token and app URL
    console.log(
      'This is a debug script. Run it after starting the app manually.',
    );
    console.log('You need to:');
    console.log('1. Start the app with npm run start:dev');
    console.log('2. Get an admin token');
    console.log('3. Make a POST request to /pets with invalid data');
    console.log('4. Check the response structure');
  } catch (error) {
    console.error('Error:', error);
  }
}

debugValidation();
