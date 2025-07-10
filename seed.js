require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected for seeding"))
.catch((err) => console.error(err));

// Sample products
const sampleProducts = [
  {
    title: "Men's Slim Jeans",
    description: "Comfortable slim-fit denim jeans",
    price: 49.99,
    image: "https://images.jackjones.com/12243592/4313146/003/jackjones-jjiglennjjoriginalsq223noos-blue.jpg?v=a772977d0ed58127ab546afa5758ef03&format=webp&width=640&quality=80&key=10-0-3",
    category: "men-jeans",
    popular: false
  },
  {
    title: "Women's White Shirt",
    description: "Classic white blouse for everyday wear",
    price: 39.99,
    image: "https://www.wisconline.co.uk/images/webp/A59-min.webp",
    category: "women-shirts",
    popular: true
  },
  {
    title: "Men's Sneakers",
    description: "Trendy high-top sneakers for casual outings",
    price: 59.99,
    image: "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/AIR+FORCE+1+%2707.png",
    category: "men-sneakers",
    popular: true,
    quantity: 11
  },
  {
    title: "Women's Blue Jeans",
    description: "Stylish blue denim with a slim cut",
    price: 44.99,
    image: "https://shopduer.com/cdn/shop/files/WFMR5318_Midweight-Performance-Denim-High-Rise-Curve-Vintage-Tint-Reshoot_4345-ECOM.jpg?v=1744049875",
    category: "women-jeans",
    popular: false
  },
  {
    title: "Classic Leather Jacket",
    description: "Premium black leather jacket for a bold look",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=600&fit=crop",
    category: "outerwear",
    popular: true,
    quantity: 15
  },
  {
    title: "Women's Combat Boots",
    description: "Edgy black combat boots with lace-up design",
    price: 89.99,
    image: "https://plus.unsplash.com/premium_photo-1728664897534-bf5a6be940db?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8d29tZW4lMjBjb21iYXQlMjBib290c3xlbnwwfHwwfHx8MA%3D%3D",
    category: "women-shoes",
    popular: false
  },
  {
    title: "Men's Graphic Tee",
    description: "Bold graphic t-shirt with vintage design",
    price: 24.99,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=600&fit=crop",
    category: "men-shirts",
    popular: true
  },
  {
    title: "Women's Oversized Hoodie",
    description: "Comfortable oversized hoodie in charcoal gray",
    price: 54.99,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=600&fit=crop",
    category: "women-hoodies",
    popular: false,
    quantity: 8
  },
  {
    title: "Distressed Denim Jacket",
    description: "Vintage-style distressed denim jacket",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=400&h=600&fit=crop",
    category: "outerwear",
    popular: true
  },
  {
    title: "Men's Cargo Pants",
    description: "Tactical-style cargo pants with multiple pockets",
    price: 69.99,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=600&fit=crop",
    category: "men-pants",
    popular: false,
    quantity: 30
  },
  {
    title: "Women's Platform Sneakers",
    description: "Trendy platform sneakers in white and black",
    price: 94.99,
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=600&fit=crop",
    category: "women-shoes",
    popular: true
  },
  {
    title: "Vintage Band Tee",
    description: "Authentic vintage band t-shirt collection",
    price: 34.99,
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=600&fit=crop",
    category: "unisex-shirts",
    popular: false
  }
];

// Delete all old products and insert new ones
async function seedDB() {
  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);
  console.log("🌱 Database seeded!");
  mongoose.connection.close(); // Close connection after done
}

seedDB();
