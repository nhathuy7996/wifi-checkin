const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Test configuration
const config = {
  chatId: 'YOUR_CHAT_ID',
  botToken: 'YOUR_BOT_TOKEN', // Optional if configured in .env
  ssid: 'Test-WiFi'
};

async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check...');
  try {
    const response = await axios.get(`${API_URL}/health`);
    console.log('✅ Health Check:', response.data);
  } catch (error) {
    console.error('❌ Health Check failed:', error.message);
  }
}

async function testSendMessage() {
  console.log('\n📤 Testing Send Message...');
  try {
    const response = await axios.post(`${API_URL}/telegram/send`, {
      chatId: config.chatId,
      message: '🔔 Test message from Backend API',
      botToken: config.botToken
    });
    console.log('✅ Send Message:', response.data);
  } catch (error) {
    console.error('❌ Send Message failed:', error.response?.data || error.message);
  }
}

async function testWiFiConnected() {
  console.log('\n📶 Testing WiFi Connected Notification...');
  try {
    const response = await axios.post(`${API_URL}/telegram/wifi-connected`, {
      chatId: config.chatId,
      ssid: config.ssid,
      deviceName: 'Test Device',
      botToken: config.botToken
    });
    console.log('✅ WiFi Connected:', response.data);
  } catch (error) {
    console.error('❌ WiFi Connected failed:', error.response?.data || error.message);
  }
}

async function testGetRequest() {
  console.log('\n🔔 Testing GET Test Endpoint...');
  try {
    const response = await axios.get(`${API_URL}/telegram/test`, {
      params: {
        chatId: config.chatId,
        botToken: config.botToken
      }
    });
    console.log('✅ GET Test:', response.data);
  } catch (error) {
    console.error('❌ GET Test failed:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🧪 Starting API Tests...');
  console.log('API URL:', API_URL);
  
  await testHealthCheck();
  
  if (config.chatId === 'YOUR_CHAT_ID' || config.botToken === 'YOUR_BOT_TOKEN') {
    console.log('\n⚠️  Please update config in test-api.js with your Telegram credentials');
    return;
  }
  
  await testSendMessage();
  await testWiFiConnected();
  await testGetRequest();
  
  console.log('\n✅ All tests completed!');
}

// Run tests
runTests().catch(console.error);
