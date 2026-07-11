const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
const db = { host: "127.0.0.1", user: "root", password: "", database: "adyeldb" };
const fns = ["Obuku","Amara","Tendo","Nakato","Ssemwogerere","Akello","Kato","Nalwanga","Mugisha","Apio","Ssali","Nambi","Wasswa","Nanteza","Okello","Adong","Kyambadde","Nankunda","Ssebaggala","Namaganda"];
const lns = ["Oketcho","Musisi","Okwir","Birungi","Kabuye","Oryem","Tumwine","Nassali","Kayiwa","Achola","Mulindwa","Kasozi","Ogenga","Nantaba","Lukyamuzi","Auma","Otim","Wavamunno","Mbabazi","Nabukeera"];
const profs = ["Software Engineer","Doctor","Lawyer","Teacher","Accountant","Nurse","Architect","Journalist","Entrepreneur","Banker","Pharmacist","Engineer","Lecturer","Pilot","Designer"];
const yrs = [1990,1993,1995,1998,2000,2002,2004,2006,2008,2010,2012,2014,2016,2018,2020];
const imgs = ["https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800","https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800","https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800","https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800","https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800"];
const locs = ["Kampala, Uganda","Entebbe, Uganda","Jinja, Uganda","Gulu, Uganda","Mbarara, Uganda","Mbale, Uganda","Arua, Uganda","Lira, Uganda","Fort Portal, Uganda","Masaka, Uganda"];
const jts = ["FULL_TIME","PART_TIME","CONTRACT","INTERNSHIP","REMOTE"];
const bizCats = ["Technology","Food & Beverages","Fashion","Healthcare","Agriculture","Real Estate","Education","Finance","Logistics","Tourism"];
const cats = ["Technology","Health","Education","Finance","Arts","Business","Sports","Science","Politics","Entertainment"];
const rv = (a) => a[Math.floor(Math.random()*a.length)];
const nv = (mn,mx) => Math.floor(Math.random()*(mx-mn+1))+mn;

async function seed() {
  const c = await mysql.createConnection(db);
  console.log("Connected to DB");
  try {
    const hash = await bcrypt.hash("Password123!", 10);
    const uids = [];
    console.log(">> Seeding 20 users...");
    for (let i=0;i<20;i++) {
      const fn=fns[i], ln=lns[i], em=fn.toLowerCase()+"."+ln.toLowerCase()+"@adyel.ac.ug";
      // Try insert, if duplicate just fetch existing id
      await c.execute("INSERT IGNORE INTO users (first_name,last_name,email,password,class_year,profession,phone,account_status) VALUES (?,?,?,?,?,?,?,?)",[fn,ln,em,hash,yrs[i%yrs.length],profs[i%profs.length],"+25670"+(1000000+i),"ACTIVE"]);
      const [rows]=await c.execute("SELECT id FROM users WHERE email=?",[em]);
      if(rows[0]) uids.push(rows[0].id);
    }
    for (const uid of uids) await c.execute("INSERT IGNORE INTO user_roles (user_id,role_id) VALUES (?,6)",[uid]);
    console.log(uids.length+" users ready");

    const [adms]=await c.execute("SELECT id FROM users WHERE role IN (?,?) LIMIT 1",["SUPER_ADMIN","ADMIN"]);
    const aid = adms.length>0 ? adms[0].id : uids[0];

    console.log(">> Seeding 20 news articles...");
    const ntitles=["Adyel Class of 2004 Reunion Announced","New Library Block Construction Begins","Alumni Fund Surpasses 50 Million UGX","Career Fair 2025: 200 Opportunities","Former Student Wins National Award","School Celebrates 60 Years of Excellence","Alumni Scholarship Applications Open","Sports Complex Renovation Complete","Meet the New School Head","Annual Giving Campaign Sets Record","Tech Hub Launched by Alumni","Five Adyelites Named to Parliament","Alumni Network Reaches 5000 Members","Primary 7: 98% First Grade","New Science Lab Commissioned","Alumni Mentorship Program Launches","Blood Donation Drive Success","Old Boys Cricket Team Wins Cup","Welfare Fund Helps 12 Families","AGM: Key Resolutions Passed"];
    for (let i=0;i<20;i++) await c.execute("INSERT INTO news_articles (title,content,image_url,category,status,author_id,published_at) VALUES (?,?,?,?,?,?,?)",[ntitles[i],"This is a detailed update from the Adyel Alumni Association. "+ntitles[i]+". We are proud to share this milestone with the community. Our alumni continue to make exceptional contributions to society. We encourage all members to participate and stay connected. Together we build a stronger legacy. Contact the PRO office for more information. Stay blessed, Adyelites!",imgs[i%imgs.length],cats[i%cats.length],"PUBLISHED",aid,new Date(Date.now()-(20-i)*86400000)]);
    console.log("20 news done");

    console.log(">> Seeding 20 events...");
    const etitles=["Annual Alumni Gala 2025","Career Networking Night","Homecoming Weekend","Tech Hackathon","Alumni Sports Day","Mentorship Breakfast","Founders Day","Class of 2000 Jubilee","Medical Outreach","Cultural Evening","Business Pitching","Book Club Launch","Young Alumni Dinner","Cleanup Drive","AGM 2025","Prize Giving Day","Alumni vs Students Match","Women in Leadership","Digital Skills Workshop","Prayer Breakfast"];
    const eids=[];
    for (let i=0;i<20;i++) {
      const [er]=await c.execute("INSERT INTO events (title,description,event_date,location,image_url,created_by_id) VALUES (?,?,?,?,?,?)",[etitles[i],"Join us for "+etitles[i]+". A premier event for Adyel alumni to connect and celebrate their shared heritage. All alumni and guests are warmly welcome. Please register early as spaces are limited.",new Date(Date.now()+(i+1)*7*86400000),locs[i%locs.length],imgs[i%imgs.length],aid]);
      eids.push(er.insertId);
      await c.execute("INSERT INTO event_ticket_tiers (event_id,name,price,capacity) VALUES (?,?,?,?),(?,?,?,?)",[er.insertId,"Standard",nv(20000,50000),nv(100,300),er.insertId,"VIP",nv(80000,150000),nv(20,50)]);
    }
    console.log("20 events done");

    console.log(">> Seeding 20 tickets...");
    for (let i=0;i<20;i++) {
      if (!uids[i]) continue;
      const [trs]=await c.execute("SELECT id,price FROM event_ticket_tiers WHERE event_id=? LIMIT 1",[eids[i%eids.length]]);
      if(trs.length>0) await c.execute("INSERT INTO event_tickets (event_id,tier_id,user_id,quantity,total_paid,status) VALUES (?,?,?,?,?,?)",[eids[i%eids.length],trs[0].id,uids[i],1,trs[0].price,"PAID"]);
    }
    console.log("20 tickets done");

    console.log(">> Seeding 20 projects...");
    const ptitles=["P7 Classroom Renovation","Science Lab Equipment","School Water Borehole","Library Expansion","Computer Lab","School Bus","Solar Power","Kitchen Renovation","School Fence Upgrade","Medical Sick Bay","Playground Equipment","Audio Visual Room","Staff Housing","Tree Planting","School Records System","Fire Safety Equipment","Wheelchair Ramps","CCTV System","Teachers Resource Center","School Swimming Pool"];
    const pids=[];
    for (let i=0;i<20;i++) {
      const goal=nv(5,50)*1000000;
      const [pr]=await c.execute("INSERT INTO projects (title,description,goal_amount,raised_amount,image_url,deadline,created_by_id) VALUES (?,?,?,?,?,?,?)",[ptitles[i],"This project aims to "+ptitles[i].toLowerCase()+" at Adyel Primary School. Your contribution directly impacts quality of education for 800+ students. We have secured commitment from several alumni chapters. Every shilling counts!",goal,Math.floor(goal*Math.random()*0.85),imgs[i%imgs.length],new Date(Date.now()+(i+3)*30*86400000),aid]);
      pids.push(pr.insertId);
    }
    console.log("20 projects done");

    console.log(">> Seeding donations & updates...");
    for (let i=0;i<20;i++) {
      if (!uids[i]) continue;
      await c.execute("INSERT INTO project_donations (project_id,user_id,amount,is_anonymous,payment_status) VALUES (?,?,?,?,?)",[pids[i%pids.length],uids[i],nv(50000,2000000),i%4===0?1:0,"COMPLETED"]);
      await c.execute("INSERT INTO project_updates (project_id,title,description,image_url) VALUES (?,?,?,?)",[pids[i%pids.length],"Update "+(i+1)+": Progress Report","We are happy to share our latest project progress. We are "+nv(20,90)+"% towards our goal. Thank you to all generous donors. Next phase begins next month.",imgs[i%imgs.length]]);
    }
    console.log("20 donations + 20 updates done");

    console.log(">> Seeding 20 welfare obituaries...");
    const oids=[];
    for (let i=0;i<20;i++) {
      const fn=fns[(i+5)%20], ln=lns[(i+5)%20];
      const [or]=await c.execute("INSERT INTO welfare_obituaries (deceased_name,biography,target_amount,raised_amount,funeral_dates_venues,spokesperson_contact,status) VALUES (?,?,?,?,?,?,?)",[fn+" "+ln,fn+" "+ln+" was a beloved member of our community known for dedication and integrity. They served as "+profs[i%profs.length]+" and touched many lives. Rest in eternal peace.",nv(1,5)*1000000,nv(100000,800000),"Saturday "+nv(1,28)+" October 2025 at St Pauls Cathedral, Kampala at 10:00 AM","+25677"+(8000000+i),"ACTIVE"]);
      oids.push(or.insertId);
    }
    console.log("20 obituaries done");

    console.log(">> Seeding contributions, condolences & rates...");
    const cmsgs=["Our hearts go out to the family. May God grant them peace.","A great soul has returned to the Lord. We will miss you.","Your legacy lives on in all of us. Rest well.","Adyel has lost a great member. May God grant eternal rest.","The memories we shared will forever remain in our hearts.","Gone too soon but never forgotten. Fly high.","We stand with the family in prayer and solidarity.","A life well lived. Thank you for all you did for our school.","Your smile will never be forgotten.","Until we meet again. Rest in peace."];
    for (let i=0;i<20;i++) {
      if (!uids[i]) continue;
      await c.execute("INSERT INTO welfare_contributions (obituary_id,user_id,amount_gross,amount_net,payment_method,verification_status) VALUES (?,?,?,?,?,?)",[oids[i%oids.length],uids[i],nv(50000,500000),nv(45000,490000),rv(["MOBILE_MONEY","BANK_TRANSFER","CASH"]),rv(["VERIFIED","PENDING","PENDING"])]);
      await c.execute("INSERT INTO condolences (obituary_id,user_id,message,status) VALUES (?,?,?,?)",[oids[i%oids.length],uids[i],cmsgs[i%cmsgs.length],rv(["APPROVED","APPROVED","PENDING"])]);
    }
    const wrates=[["Mobile Money Fee","PERCENTAGE",1.5],["Processing Fee","FLAT",1000],["Admin Levy","PERCENTAGE",0.5],["Funeral Fund","FLAT",5000],["Annual Dues","FLAT",50000]];
    for (const [nm,tp,am] of wrates) await c.execute("INSERT IGNORE INTO welfare_deduction_rates (name,rate_type,amount) VALUES (?,?,?)",[nm,tp,am]);
    console.log("Welfare data done");

    console.log(">> Seeding 20 jobs...");
    const jts2=["Senior Software Engineer","Medical Officer","Legal Counsel","Secondary Teacher","Financial Analyst","Registered Nurse","Civil Engineer","News Editor","Business Development Manager","Bank Officer","Clinical Pharmacist","Structural Engineer","University Lecturer","Commercial Pilot","UI/UX Designer","Data Scientist","HR Manager","Project Manager","Sales Executive","Network Admin"];
    const cos=["Stanbic Bank Uganda","Uganda Airlines","MTN Uganda","Makerere University","Mulago Hospital","NSSF Uganda","Uganda Revenue Authority","Monitor Publications","Centenary Bank","Roofings Group","Cipla Quality Chemical","Kakira Sugar Works","Uganda Telecom","Equity Bank Uganda","Jumia Uganda","SafeBoda Uganda","Nation Media Group","DFCU Bank","PostBank Uganda","Airtel Uganda"];
    for (let i=0;i<20;i++) {
      if (!uids[i]) continue;
      await c.execute("INSERT INTO job_listings (title,company,description,requirements,location,job_type,salary_range,posted_by_id,status) VALUES (?,?,?,?,?,?,?,?,?)",[jts2[i],cos[i],"We are looking for a qualified "+jts2[i]+" to join our team at "+cos[i]+". An exciting opportunity with a leading Ugandan organisation. The ideal candidate is innovative and results-driven.","Bachelors degree in relevant field. "+nv(2,7)+" years experience. Strong communication skills. Adyel Alumni encouraged to apply.",locs[i%locs.length],rv(jts),"UGX "+(nv(1,8)*500000)+" - UGX "+(nv(9,20)*500000),uids[i],"ACTIVE"]);
    }
    console.log("20 jobs done");

    console.log(">> Seeding 20 marketplace businesses...");
    const bnames=["Tendo Tech Solutions","Nakato Fashions","Mugisha Pharmacy","Akello Agribusiness","Ssali Real Estate","Nambi Kitchen","Kato Associates","Nalwanga Design Studio","Wasswa Logistics","Nanteza Academy","Obuku Digital Agency","Apio Health Clinic","Kyambadde Finance","Nankunda Tours","Okello Auto Garage","Adong Bookshop","Ssemwogerere Hardware","Namaganda Supermarket","Birungi Media House","Achola Beauty Salon"];
    for (let i=0;i<20;i++) {
      if (!uids[i]) continue;
      await c.execute("INSERT INTO marketplace_businesses (owner_id,business_name,description,category,website,phone,status) VALUES (?,?,?,?,?,?,?)",[uids[i],bnames[i],bnames[i]+" is an Adyel alumni-owned business offering premium "+bizCats[i%bizCats.length].toLowerCase()+" services. We pride ourselves on quality and excellent customer service.",bizCats[i%bizCats.length],"https://www."+bnames[i].toLowerCase().replace(/[^a-z0-9]/g,"")+".co.ug","+25677"+(9000000+i),"ACTIVE"]);
    }
    console.log("20 businesses done");

    console.log(">> Seeding governance polls & docs...");
    const poltitles=["Election of Alumni President 2025","Approve Annual Budget 2025","Elect Treasurer","Build new sports complex?","Elect Vice President","Approve Welfare Constitution","Ratify Kampala Partnership","Elect PRO Officer","Vote on Subscription Increase","Elect Secretary General","Approve Renovation Priority","Invest in land?","Elect Women Representative","Approve Membership Tiers","Elect Regional Coordinator","Ratify Old Girls Merger","Vote on Gala Date","Elect Youth Representative","Approve Social Media Policy","Elect Auditor General"];
    const doctitles=["Annual Report 2024","Audited Financials 2024","Alumni Constitution","Minutes AGM 2024","Welfare Fund Policy","Strategic Plan 2025-2030","Membership Guidelines","Code of Conduct","Event Management Policy","Election Regulations","Annual Budget 2025","Investment Policy","Communication Policy","Data Protection Policy","Dispute Resolution Procedure","Scholarship Guidelines","Alumni Network Charter","Assets Register","Minutes EGM March 2025","Sponsorship Policy"];
    const dtypes=["FINANCIAL_REPORT","CONSTITUTION","MINUTES","POLICY","OTHER"];
    for (let i=0;i<20;i++) {
      const isEl = i%3===0;
      const [plr]=await c.execute("INSERT INTO governance_polls (title,description,poll_type,start_date,end_date,created_by_id,status) VALUES (?,?,?,?,?,?,?)",[poltitles[i],poltitles[i]+". All registered alumni members are eligible to vote. Please review the options carefully. Voting is anonymous and results will be announced at the next AGM.",isEl?"ELECTION":"REFERENDUM",new Date(Date.now()-nv(1,10)*86400000),new Date(Date.now()+nv(5,30)*86400000),aid,"ACTIVE"]);
      if(isEl) await c.execute("INSERT INTO poll_options (poll_id,option_text) VALUES (?,?),(?,?)",[plr.insertId,fns[i%20]+" "+lns[i%20],plr.insertId,fns[(i+1)%20]+" "+lns[(i+1)%20]]);
      else await c.execute("INSERT INTO poll_options (poll_id,option_text) VALUES (?,?),(?,?)",[plr.insertId,"Yes, I approve",plr.insertId,"No, I do not approve"]);
      await c.execute("INSERT INTO governance_documents (title,doc_type,file_url,uploaded_by_id) VALUES (?,?,?,?)",[doctitles[i],dtypes[i%dtypes.length],"https://docs.adyelalumni.ug/"+doctitles[i].toLowerCase().replace(/[^a-z0-9]/g,"_")+".pdf",aid]);
    }
    console.log("20 polls + 20 docs done");

    console.log(">> Seeding 20 shop products & orders...");
    const sitems=[["Alumni Polo Shirt","Premium polo with embroidered Adyel Alumni logo.",45000],["Alumni Cap","Stylish baseball cap with the Adyel emblem.",25000],["Alumni Mug","White ceramic mug featuring the school crest.",18000],["Alumni Tote Bag","Canvas tote bag with alumni logo. Eco-friendly.",22000],["Alumni Hoodie","Warm fleece hoodie in maroon with white logo.",75000],["School Tie","Official school tie for formal alumni events.",35000],["Alumni Pin Badge","Elegant enamel pin badge of the school crest.",8000],["Alumni Notebook","A5 hardcover notebook with Adyel branding.",15000],["Alumni Pen Set","Premium set of 3 pens with Adyel logo.",20000],["Framed School Crest","Beautifully framed school crest for your office.",55000],["Adyel Wristband","Rubber wristband with Adyel motto in maroon.",5000],["Alumni Keyring","Metal keyring with school crest engraved.",12000],["Alumni Lanyard","Branded lanyard with ID holder in school colours.",10000],["Alumni Calendar 2026","Full colour 12-month wall calendar.",30000],["Alumni Water Bottle","1L stainless steel bottle with Adyel branding.",40000],["Car Sticker Set","Pack of 5 high-quality vinyl car stickers.",7000],["Alumni Umbrella","Full-size umbrella in maroon with Adyel logo.",50000],["Varsity Jacket","Premium varsity jacket with school colours.",120000],["Photo Book 2024","Commemorative photo album of 2024 events.",60000],["Desk Plaque","Personalised wooden desk plaque with inscription.",45000]];
    const spids=[];
    for (let i=0;i<20;i++) {
      const [sp]=await c.execute("INSERT INTO shop_products (name,description,price,stock_quantity,image_url,status) VALUES (?,?,?,?,?,?)",[sitems[i][0],sitems[i][1],sitems[i][2],nv(5,100),imgs[i%imgs.length],"ACTIVE"]);
      spids.push(sp.insertId);
    }
    const ostats=["PENDING","PAID","SHIPPED","DELIVERED","DELIVERED"];
    for (let i=0;i<20;i++) {
      if (!uids[i]) continue;
      const pid=spids[i%spids.length];
      const [prs]=await c.execute("SELECT price FROM shop_products WHERE id=?",[pid]);
      const price=prs[0]?.price||20000; const qty=nv(1,3);
      const [or2]=await c.execute("INSERT INTO shop_orders (user_id,total_amount,status,shipping_address) VALUES (?,?,?,?)",[uids[i],price*qty,ostats[i%ostats.length],nv(1,100)+" "+locs[i%locs.length]]);
      await c.execute("INSERT INTO shop_order_items (order_id,product_id,quantity,price_at_purchase) VALUES (?,?,?,?)",[or2.insertId,pid,qty,price]);
    }
    console.log("20 products + 20 orders done");

    console.log(">> Seeding 20 audit logs...");
    const aacts=["USER_LOGIN","ROLE_CHANGE","STATUS_CHANGE","NEWS_PUBLISHED","EVENT_CREATED","PROJECT_CREATED","DONATION_RECEIVED","JOB_APPROVED","BUSINESS_APPROVED","TICKET_PURCHASED"];
    for (let i=0;i<20;i++) {
      if (!uids[i]) continue;
      await c.execute("INSERT INTO audit_logs (user_id,action,description,ip_address) VALUES (?,?,?,?)",[uids[i],aacts[i%aacts.length],"User performed: "+aacts[i%aacts.length]+". Logged for compliance and security purposes.","192.168."+nv(1,255)+"."+nv(1,255)]);
    }
    console.log("20 audit logs done");

    console.log("\nALL DONE! Data seeded across all major tables.");
  } catch(err) { console.error("Seed error:", err.message||err); if(err.sql)console.error("SQL:",err.sql); }
  finally { await c.end(); }
}
seed();
