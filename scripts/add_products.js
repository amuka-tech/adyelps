const mysql = require('mysql2/promise');

async function addProducts() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'adyeldb',
  });

  const products = [
    {
      name: 'Adyel Alumni Premium Hoodie',
      description: 'Stay warm and show your Adyel pride with this premium quality fleece hoodie. Features the official alumni crest embroidered on the chest. Available in Maroon and Navy Blue.',
      price: 85000.00,
      stock_quantity: 50,
      image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800'
    },
    {
      name: 'Adyel Classic Coffee Mug',
      description: 'Start your morning with a cup of coffee in this classic ceramic mug. Features the Adyel logo and motto. Microwave and dishwasher safe.',
      price: 25000.00,
      stock_quantity: 120,
      image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&q=80&w=800'
    },
    {
      name: 'Adyel Gold Lapel Pin',
      description: 'An elegant gold-plated lapel pin. Perfect for formal events, networking, or wearing on your suit jacket to show your lifelong connection to Adyel.',
      price: 15000.00,
      stock_quantity: 200,
      image_url: 'https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&q=80&w=800'
    },
    {
      name: 'Adyel Executive Leather Notebook',
      description: 'A premium faux-leather bound notebook for your meetings and journaling. Includes 200 lined pages and a ribbon bookmark, debossed with the Adyel crest.',
      price: 45000.00,
      stock_quantity: 75,
      image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'
    }
  ];

  try {
    for (const p of products) {
      await connection.query(
        `INSERT INTO shop_products (name, description, price, stock_quantity, image_url, status) VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
        [p.name, p.description, p.price, p.stock_quantity, p.image_url]
      );
    }
    console.log(`Successfully added ${products.length} products to the shop!`);
  } catch (err) {
    console.error("Error adding products:", err);
  } finally {
    await connection.end();
  }
}

addProducts();
