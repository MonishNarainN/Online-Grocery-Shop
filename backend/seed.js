const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
    {
        name: "Organic Honeycrisp Apples",
        description: "Sweet, crunchy, and freshly picked from local orchards.",
        price: 4.99,
        category: "fruits",
        stock: 50,
        image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?w=800&q=80"
    },
    {
        name: "Fresh Baby Spinach",
        description: "Pre-washed and ready to eat. Perfect for salads or smoothies.",
        price: 3.49,
        category: "vegetables",
        stock: 30,
        image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80"
    },
    {
        name: "Whole Milk (Gallon)",
        description: "Farm-fresh vitamin D milk from local dairies.",
        price: 4.25,
        category: "dairy",
        stock: 15,
        image_url: "https://images.unsplash.com/photo-1563636619-e9162444b95e?w=800&q=80"
    },
    {
        name: "Artisan Sourdough Bread",
        description: "Hand-crafted loaf with a perfect crust and tangy flavor.",
        price: 6.50,
        category: "bakery",
        stock: 12,
        image_url: "https://images.unsplash.com/photo-1585478259715-876a2080a9d1?w=800&q=80"
    },
    {
        name: "Wild-Caught Salmon Fillet",
        description: "Fresh Atlantic salmon, rich in Omega-3.",
        price: 18.99,
        category: "seafood",
        stock: 8,
        image_url: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80"
    },
    {
        name: "Premium Ground Beef",
        description: "85% lean, grass-fed beef. Perfect for burgers.",
        price: 8.99,
        category: "meat",
        stock: 20,
        image_url: "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=800&q=80"
    }
];

async function seedDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products.');

        // Insert new products
        await Product.insertMany(products);
        console.log('Successfully seeded database with products!');

        mongoose.connection.close();
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    }
}

seedDB();
