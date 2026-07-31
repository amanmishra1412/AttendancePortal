import http from 'http';

const testHealth = () => {
  http.get('http://localhost:5000/api/health', (res) => {
    let data = '';
    res.on('data', (chunk) => (data += chunk));
    res.on('end', () => {
      console.log('✅ Health API Response:', data);
    });
  });
};

testHealth();
