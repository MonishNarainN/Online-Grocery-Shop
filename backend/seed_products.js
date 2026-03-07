const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
    {
        name: 'Organic Red Onions',
        description: 'Fresh, organic red onions. Perfect for salads and cooking.',
        price: 45,
        category: 'Vegetables',
        stock: 100,
        unit: 'kg',
        image_url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa830?q=80&w=400'
    },
    {
        name: 'Fresh Whole Milk',
        description: 'Pure, fresh whole milk from local farms.',
        price: 60,
        category: 'Dairy',
        stock: 50,
        unit: 'Litre',
        image_url: 'https://images.unsplash.com/photo-1550583724-125581cc2532?q=80&w=400'
    },
    {
        name: 'Royal Gala Apples',
        description: 'Crisp and sweet Royal Gala apples.',
        price: 180,
        category: 'Fruits',
        stock: 30,
        unit: 'kg',
        image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?q=80&w=400'
    },
    {
        name: 'Basmati Rice (Premium)',
        description: 'Extra long grain premium basmati rice for biryani.',
        price: 120,
        category: 'Grains',
        stock: 200,
        unit: 'kg',
        image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400'
    },
    {
        name: 'Farm Fresh Eggs',
        description: 'Pack of 12 farm-fresh large white eggs.',
        price: 85,
        category: 'Dairy',
        stock: 40,
        unit: 'Pack',
        image_url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?q=80&w=400'
    },
    {
        name: 'Sourdough Bread',
        description: 'Artisanal sourdough bread baked daily.',
        price: 95,
        category: 'Bakery',
        stock: 15,
        unit: 'Loaf',
        image_url: 'https://images.unsplash.com/photo-1585478259715-876a6a81fc28?q=80&w=400'
    }
];

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas for seeding...');

        // Clear existing products (optional - uncomment if you want a fresh start)
        // await Product.deleteMany({});
        // console.log('Cleared existing products.');

        for (const productData of products) {
            const existing = await Product.findOne({ name: productData.name });
            if (!existing) {
                await Product.create(productData);
                console.log(`✅ Added: ${productData.name}`);
            } else {
                console.log(`ℹ️ Skipped (already exists): ${productData.name}`);
            }
        }

        console.log('\n✨ Database seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding error:', err.message);
        process.exit(1);
    }
}

seedProducts();
