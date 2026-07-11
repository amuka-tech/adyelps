async function testPayment() {
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
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
    
    // 2. Initialize Payment
    const initRes = await fetch('http://localhost:3000/api/payments/initialize', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': cookieHeader
      },
      body: JSON.stringify({
        amount: 50000,
        type: 'SHOP_ORDER',
        metadata: { items: [{ product_id: 1, quantity: 2 }] }
      })
    });
    
    const initData = await initRes.json();
    console.log("Initialize Response:", initData);
    
    if (!initData.checkoutUrl) throw new Error("Missing checkout URL");

    // Extract reference from the simulated callback URL
    const url = new URL(initData.checkoutUrl);
    const reference = url.searchParams.get('reference');
    console.log("Got reference:", reference);

    // 3. Verify Payment
    const verifyRes = await fetch('http://localhost:3000/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, simulate: true })
    });

    const verifyData = await verifyRes.json();
    console.log("Verify Response:", verifyData);
    
  } catch (err) {
    console.error(err);
  }
}

testPayment();
