// Test route - add this to your server.js temporarily
app.get("/test/popup", (req, res) => {
  res.send(`
    <html>
      <head><title>Test Popup</title></head>
      <body>
        <h2>Test Popup Communication</h2>
        <button onclick="sendTestMessage()">Send Test Message</button>
        <script>
          function sendTestMessage() {
            console.log('Sending test message to parent window');
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'test_success', 
                data: { message: 'Test successful!' }
              }, 'http://localhost:5173');
              setTimeout(() => window.close(), 1000);
            } else {
              alert('No parent window found');
            }
          }
          
          // Auto-send message after 2 seconds
          setTimeout(sendTestMessage, 2000);
        </script>
      </body>
    </html>
  `);
});
