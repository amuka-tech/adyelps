const mysql = require('mysql2/promise');

async function seed() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'adyeldb'
  });

  try {
    // Delete all existing obituaries (and any related condolences/ledger entries if foreign keys cascade, but we'll disable FK checks temporarily)
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('DELETE FROM obituaries');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    const now = new Date();
    
    // Future Date (Active Contribution)
    const futureDate1 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // 5 days from now
    const futureDate2 = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days from now
    // Past Date (Expired Contribution)
    const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago

    const formatDate = (d) => d.toISOString().slice(0, 19).replace('T', ' ');

    const samples = [
      {
        deceased_name: "Mr. Charles Otim",
        biography: "Mr. Charles Otim was a dedicated former headmaster who served Adyel Primary School with distinction from 1990 to 2005. His visionary leadership transformed the school's academic standing.",
        photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
        funeral_dates_venues: "Requiem Mass: All Saints Cathedral, Kampala (10:00 AM, Wed)\nBurial: Ancestral Home, Lira (Sat)",
        spokesperson_contact: "+256 772 123 456",
        contribution_expiry: formatDate(futureDate1),
        status: "ACTIVE"
      },
      {
        deceased_name: "Dr. Sarah Akello",
        biography: "A proud Alumna from the Class of '98. Dr. Sarah was a renowned pediatrician who frequently volunteered at the Adyel annual health camps, providing free checkups to students.",
        photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80",
        funeral_dates_venues: "Memorial Service: St. Peter's Church (2:00 PM, Fri)\nBurial: Kampala Cemetery (Sat)",
        spokesperson_contact: "+256 701 987 654",
        contribution_expiry: formatDate(futureDate2),
        status: "ACTIVE"
      },
      {
        deceased_name: "Mr. John Okello",
        biography: "Former Mathematics teacher who inspired a generation of students to love numbers. He passed away peacefully after a long battle with illness.",
        photo_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80",
        funeral_dates_venues: "Vigil: His residence in Najjera (Thu evening)\nBurial: Soroti (Sun)",
        spokesperson_contact: "+256 752 444 555",
        contribution_expiry: formatDate(pastDate), // EXPIRED!
        status: "ACTIVE"
      },
      {
        deceased_name: "Mrs. Betty Namusisi",
        biography: "Head of the English department for over 20 years. Mrs. Betty was known for her strict but loving approach to teaching and her impeccable grammar.",
        photo_url: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80",
        funeral_dates_venues: "Service: Namirembe Cathedral (9:00 AM, Tue)",
        spokesperson_contact: "+256 788 111 222",
        contribution_expiry: null, // NO CONTRIBUTION SET
        status: "ACTIVE"
      },
      {
        deceased_name: "Mr. David Lwanga",
        biography: "A brilliant sports coach who led Adyel Primary to 3 national athletics championships in the 1980s.",
        photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
        funeral_dates_venues: "Burial took place privately last week.",
        spokesperson_contact: "Family Representative: +256 700 000 000",
        contribution_expiry: formatDate(futureDate1),
        status: "CLOSED" // FUND IS CLOSED
      }
    ];

    for (const obit of samples) {
      await connection.query(
        `INSERT INTO obituaries (deceased_name, biography, photo_url, funeral_dates_venues, spokesperson_contact, contribution_expiry, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [obit.deceased_name, obit.biography, obit.photo_url, obit.funeral_dates_venues, obit.spokesperson_contact, obit.contribution_expiry, obit.status]
      );
    }

    console.log('Successfully seeded 5 sample obituaries!');

  } catch (error) {
    console.error('Error seeding:', error);
  } finally {
    await connection.end();
  }
}

seed();
