async function testAnalytics() {
  try {
    // 1. Login as super admin (obemma2016@gmail.com is super admin if we made them one earlier)
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'obemma2016@gmail.com', password: 'SuperSecurePassword123!' })
    });
    
    if (!loginRes.ok) throw new Error("Login failed");
    const cookies = loginRes.headers.getSetCookie();
    if (!cookies || cookies.length === 0) throw new Error("No cookies set");
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');
    
    // 2. Fetch analytics
    const res = await fetch('http://localhost:3000/api/admin/analytics', {
      method: 'GET',
      headers: { 'Cookie': cookieHeader }
    });
    
    const data = await res.json();
    console.log("Analytics Response:");
    console.dir(data, { depth: null });
    
  } catch (err) {
    console.error(err);
  }
}

testAnalytics();
