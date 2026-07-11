async function testMessaging() {
  try {
    // 1. Login
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'obemma2016@gmail.com', password: 'SuperSecurePassword123!' })
    });
    
    if (!loginRes.ok) throw new Error("Login failed");
    
    const cookies = loginRes.headers.getSetCookie();
    if (!cookies || cookies.length === 0) throw new Error("No cookies set");
    
    // Convert cookies to a string format for fetch
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
    
    // 2. Send Message to Receiver ID 2 (Amara Musisi)
    const sendRes = await fetch('http://localhost:3000/api/messages', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      },
      body: JSON.stringify({ receiver_id: 2, content: 'Hey Amara! Just testing the new messaging system.' })
    });
    
    const sendData = await sendRes.json();
    console.log("Send Message Response:", sendData);
    
    // 3. Fetch Inbox
    const inboxRes = await fetch('http://localhost:3000/api/messages', {
      headers: { 'Cookie': cookieHeader }
    });
    const inboxData = await inboxRes.json();
    console.log("Inbox:", inboxData);
    
    // 4. Fetch Chat History with ID 2
    const chatRes = await fetch('http://localhost:3000/api/messages/2', {
      headers: { 'Cookie': cookieHeader }
    });
    const chatData = await chatRes.json();
    console.log("Chat History:", chatData);
    
  } catch (err) {
    console.error(err);
  }
}

testMessaging();
