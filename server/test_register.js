import http from 'http';

const data = JSON.stringify({
  name: 'Test Employee',
  email: 'testemployee@gmail.com',
  password: 'password123',
  department: 'Engineering',
  designation: 'Frontend Developer',
  baseSalary: 60000,
});

const req = http.request(
  {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  },
  (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      console.log('API Register Response:', body);
    });
  }
);

req.write(data);
req.end();
