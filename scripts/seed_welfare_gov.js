const mysql = require("mysql2/promise");
const db = { host: "127.0.0.1", user: "root", password: "", database: "adyeldb" };
const fns = ["Obuku","Amara","Tendo","Nakato","Ssemwogerere","Akello","Kato","Nalwanga","Mugisha","Apio","Ssali","Nambi","Wasswa","Nanteza","Okello","Adong","Kyambadde","Nankunda","Ssebaggala","Namaganda"];
const lns = ["Oketcho","Musisi","Okwir","Birungi","Kabuye","Oryem","Tumwine","Nassali","Kayiwa","Achola","Mulindwa","Kasozi","Ogenga","Nantaba","Lukyamuzi","Auma","Otim","Wavamunno","Mbabazi","Nabukeera"];
const profs = ["Software Engineer","Doctor","Lawyer","Teacher","Accountant","Nurse","Architect","Journalist","Entrepreneur","Banker","Pharmacist","Engineer","Lecturer","Pilot","Designer"];
const locs = ["Kampala, Uganda","Entebbe, Uganda","Jinja, Uganda","Gulu, Uganda","Mbarara, Uganda","Mbale, Uganda","Arua, Uganda","Lira, Uganda","Fort Portal, Uganda","Masaka, Uganda"];
const jts = ["FULL_TIME","PART_TIME","CONTRACT","INTERNSHIP","REMOTE"];
const bizCats = ["Technology","Food & Beverages","Fashion","Healthcare","Agriculture","Real Estate","Education","Finance","Logistics","Tourism"];
const rv = (a) => a[Math.floor(Math.random()*a.length)];
const nv = (mn,mx) => Math.floor(Math.random()*(mx-mn+1))+mn;

async function seed() {
  const c = await mysql.createConnection(db);
  console.log("Connected");
  try {
    // Get real user ids
    const [urows] = await c.execute("SELECT id FROM users WHERE account_status='ACTIVE' ORDER BY id LIMIT 20");
    const uids = urows.map(r=>r.id);
    const [adms] = await c.execute("SELECT id FROM users WHERE role IN ('SUPER_ADMIN','ADMIN') LIMIT 1");
    const aid = adms.length>0 ? adms[0].id : uids[0];
    console.log("Using",uids.length,"users, admin id:", aid);

    // OBITUARIES (20)
    console.log(">> Seeding 20 obituaries...");
    const oids = [];
    for (let i=0;i<20;i++) {
      const fn=fns[(i+5)%20], ln=lns[(i+5)%20];
      const [or]=await c.execute(
        "INSERT INTO obituaries (deceased_name,biography,funeral_dates_venues,spokesperson_contact,target_amount,status) VALUES (?,?,?,?,?,?)",
        [fn+" "+ln, fn+" "+ln+" was a beloved member of our community known for dedication and integrity. They served as "+profs[i%profs.length]+" and touched many lives. Rest in eternal peace.", "Saturday "+nv(1,28)+" October 2025 at St Pauls Cathedral, Kampala at 10:00 AM", "+25677"+(8000000+i), nv(1,5)*1000000, "ACTIVE"]
      );
      oids.push(or.insertId);
    }
    console.log("20 obituaries done");

    // CONTRIBUTIONS (20)
    console.log(">> Seeding 20 contributions...");
    for (let i=0;i<20;i++) {
      if(!uids[i]) continue;
      await c.execute(
        "INSERT INTO contributions (obituary_id,user_id,amount_gross,payment_method,status) VALUES (?,?,?,?,?)",
        [oids[i%oids.length], uids[i], nv(50000,500000), rv(["MOBILE_MONEY","BANK_TRANSFER","CASH"]), rv(["VERIFIED","PENDING","PENDING"])]
      );
    }
    console.log("20 contributions done");

    // CONDOLENCES (20)
    console.log(">> Seeding 20 condolences...");
    const cmsgs=["Our hearts go out to the family. May God grant them peace.","A great soul has returned to the Lord. We will miss you.","Your legacy lives on in all of us. Rest well.","Adyel has lost a great member. May God grant eternal rest.","The memories we shared will forever remain in our hearts.","Gone too soon but never forgotten. Fly high.","We stand with the family in prayer and solidarity.","A life well lived. Thank you for all you did.","Your smile will never be forgotten.","Until we meet again. Rest in peace."];
    for (let i=0;i<20;i++) {
      if(!uids[i]) continue;
      await c.execute(
        "INSERT INTO condolences (obituary_id,user_id,message,status) VALUES (?,?,?,?)",
        [oids[i%oids.length], uids[i], cmsgs[i%cmsgs.length], rv(["APPROVED","APPROVED","PENDING"])]
      );
    }
    console.log("20 condolences done");

    // DEDUCTION RATES
    console.log(">> Seeding deduction rates...");
    const wrates=[["Mobile Money Fee","PERCENTAGE",1.5],["Processing Fee","FIXED",1000],["Admin Levy","PERCENTAGE",0.5],["Funeral Fund","FIXED",5000],["Annual Dues","FIXED",50000]];
    for (const [nm,tp,am] of wrates) await c.execute("INSERT IGNORE INTO deduction_rates (name,rate_type,amount) VALUES (?,?,?)",[nm,tp,am]);
    console.log("Deduction rates done");

    // JOBS (20)
    console.log(">> Seeding 20 jobs...");
    const jts2=["Senior Software Engineer","Medical Officer","Legal Counsel","Secondary Teacher","Financial Analyst","Registered Nurse","Civil Engineer","News Editor","Business Development Manager","Bank Officer","Clinical Pharmacist","Structural Engineer","University Lecturer","Commercial Pilot","UI/UX Designer","Data Scientist","HR Manager","Project Manager","Sales Executive","Network Admin"];
    const cos=["Stanbic Bank Uganda","Uganda Airlines","MTN Uganda","Makerere University","Mulago Hospital","NSSF Uganda","Uganda Revenue Authority","Monitor Publications","Centenary Bank","Roofings Group","Cipla Quality Chemical","Kakira Sugar Works","Uganda Telecom","Equity Bank Uganda","Jumia Uganda","SafeBoda Uganda","Nation Media Group","DFCU Bank","PostBank Uganda","Airtel Uganda"];
    for (let i=0;i<20;i++) {
      if(!uids[i]) continue;
      await c.execute(
        "INSERT INTO jobs (posted_by_id,title,company,industry,location,job_type,description,requirements,status) VALUES (?,?,?,?,?,?,?,?,?)",
        [uids[i], jts2[i], cos[i], bizCats[i%bizCats.length], locs[i%locs.length], rv(jts), "We are looking for a qualified "+jts2[i]+" to join our growing team at "+cos[i]+". This is an exciting opportunity with a leading Ugandan organisation. The ideal candidate is innovative and results-driven. Adyel Alumni are especially encouraged to apply.", "Bachelors degree in a relevant field. Minimum "+nv(2,7)+" years experience. Strong communication and analytical skills.", "ACTIVE"]
      );
    }
    console.log("20 jobs done");

    // BUSINESSES (20)
    console.log(">> Seeding 20 marketplace businesses...");
    const bnames=["Tendo Tech Solutions","Nakato Fashions","Mugisha Pharmacy","Akello Agribusiness","Ssali Real Estate","Nambi Kitchen","Kato Associates Law","Nalwanga Design Studio","Wasswa Logistics","Nanteza Academy","Obuku Digital Agency","Apio Health Clinic","Kyambadde Finance","Nankunda Tours","Okello Auto Garage","Adong Bookshop","Ssemwogerere Hardware","Namaganda Supermarket","Birungi Media House","Achola Beauty Salon"];
    for (let i=0;i<20;i++) {
      if(!uids[i]) continue;
      await c.execute(
        "INSERT INTO businesses (owner_id,business_name,category,description,location,website_url,whatsapp_number,offers_alumni_discount,discount_details,status) VALUES (?,?,?,?,?,?,?,?,?,?)",
        [uids[i], bnames[i], bizCats[i%bizCats.length], bnames[i]+" is an Adyel alumni-owned business offering premium "+bizCats[i%bizCats.length].toLowerCase()+" services. We pride ourselves on quality, integrity and excellent customer service.", locs[i%locs.length], "https://www."+bnames[i].toLowerCase().replace(/[^a-z0-9]/g,"")+".co.ug", "+25677"+(9000000+i), 1, "10% discount for all verified Adyel alumni. Show your alumni card.", "ACTIVE"]
      );
    }
    console.log("20 businesses done");

    // POLLS (20)
    console.log(">> Seeding 20 governance polls...");
    const poltitles=["Election of Alumni President 2025","Approve Annual Budget 2025","Elect Treasurer","Build new sports complex?","Elect Vice President","Approve Welfare Constitution","Ratify Kampala Partnership","Elect PRO Officer","Vote on Subscription Increase","Elect Secretary General","Approve Renovation Priority","Invest in land?","Elect Women Representative","Approve Membership Tiers","Elect Regional Coordinator","Ratify Old Girls Merger","Vote on Gala Date","Elect Youth Representative","Approve Social Media Policy","Elect Auditor General"];
    for (let i=0;i<20;i++) {
      const isEl = i%3===0;
      const [plr]=await c.execute(
        "INSERT INTO polls (title,description,poll_type,start_date,end_date,created_by_id,status) VALUES (?,?,?,?,?,?,?)",
        [poltitles[i], poltitles[i]+". All registered alumni members are eligible to vote. Please review the options carefully. Voting is anonymous and results will be announced at the next AGM.", isEl?"ELECTION":"AMENDMENT", new Date(Date.now()-nv(1,10)*86400000), new Date(Date.now()+nv(5,30)*86400000), aid, "ACTIVE"]
      );
      if(isEl) await c.execute("INSERT INTO poll_options (poll_id,option_text) VALUES (?,?),(?,?)",[plr.insertId,fns[i%20]+" "+lns[i%20],plr.insertId,fns[(i+1)%20]+" "+lns[(i+1)%20]]);
      else await c.execute("INSERT INTO poll_options (poll_id,option_text) VALUES (?,?),(?,?)",[plr.insertId,"Yes, I approve",plr.insertId,"No, I do not approve"]);
    }
    console.log("20 polls done");

    // DOCUMENTS (20)
    console.log(">> Seeding 20 governance documents...");
    const doctitles=["Annual Report 2024","Audited Financials 2024","Alumni Constitution","Minutes AGM 2024","Welfare Fund Policy","Strategic Plan 2025-2030","Membership Guidelines","Code of Conduct","Event Management Policy","Election Regulations","Annual Budget 2025","Investment Policy","Communication Policy","Data Protection Policy","Dispute Resolution Procedure","Scholarship Guidelines","Alumni Network Charter","Assets Register","Minutes EGM March 2025","Sponsorship Policy"];
    for (let i=0;i<20;i++) {
      await c.execute(
        "INSERT INTO documents (title,doc_type,file_url,uploaded_by_id) VALUES (?,?,?,?)",
        [doctitles[i], i%4===0?"FINANCIAL_REPORT":"CONSTITUTION", "https://docs.adyelalumni.ug/"+doctitles[i].toLowerCase().replace(/[^a-z0-9]/g,"_")+".pdf", aid]
      );
    }
    console.log("20 documents done");

    // AUDIT LOGS (20)
    console.log(">> Seeding 20 audit logs...");
    const aacts=["USER_LOGIN","ROLE_CHANGE","STATUS_CHANGE","NEWS_PUBLISHED","EVENT_CREATED","PROJECT_CREATED","DONATION_RECEIVED","JOB_APPROVED","BUSINESS_APPROVED","TICKET_PURCHASED"];
    for (let i=0;i<20;i++) {
      if(!uids[i]) continue;
      await c.execute("INSERT INTO audit_logs (user_id,action,description,ip_address) VALUES (?,?,?,?)",[uids[i],aacts[i%aacts.length],"User performed: "+aacts[i%aacts.length]+". Logged for compliance and security.","192.168."+nv(1,255)+"."+nv(1,255)]);
    }
    console.log("20 audit logs done");

    console.log("\nALL DONE! Welfare, governance, jobs, businesses seeded.");
  } catch(err) {
    console.error("Error:", err.message||err);
    if(err.sql) console.error("SQL:", err.sql);
  } finally {
    await c.end();
  }
}
seed();
