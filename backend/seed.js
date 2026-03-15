const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const BASE_URL = process.env.BASE_URL || 'http://localhost:10000';

const products = [
    // Fresh Produce
    {
        name: "Organic Honeycrisp Apples",
        description: "Sweet, crunchy, and freshly picked from local orchards.",
        price: 4.99,
        category: "fresh_produce",
        stock: 50,
        unit: "kg",
        image_url: "https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?w=800&q=80"
    },
    {
        name: "Fresh Baby Spinach",
        description: "Pre-washed and ready to eat. Perfect for salads or smoothies.",
        price: 3.49,
        category: "fresh_produce",
        stock: 30,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80"
    },
    {
        name: "Red Tomatoes",
        description: "Ripe, juicy red tomatoes perfect for cooking or salads.",
        price: 2.99,
        category: "fresh_produce",
        stock: 45,
        unit: "kg",
        image_url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&q=80"
    },

    // Grains & Cereals
    {
        name: "Premium Basmati Rice (5kg)",
        description: "Long-grain aromatic rice, perfect for biryanis and pilafs.",
        price: 18.99,
        category: "grains_cereals",
        stock: 25,
        unit: "bag",
        image_url: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"
    },
    {
        name: "Whole Wheat Flour (Atta) 5kg",
        description: "High-fiber whole wheat flour for soft rotis and bread.",
        price: 12.50,
        category: "grains_cereals",
        stock: 40,
        unit: "bag",
        image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80"
    },
    {
        name: "Oats (1kg)",
        description: "Rolled oats for a healthy heart-friendly breakfast.",
        price: 5.99,
        category: "grains_cereals",
        stock: 35,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1518843875459-f738682238a6?w=800&q=80"
    },

    // Pulses & Lentils
    {
        name: "Toor Dal (1kg)",
        description: "Premium quality split pigeon peas, essential for Indian cooking.",
        price: 4.50,
        category: "pulses_lentils",
        stock: 60,
        unit: "pack",
        image_url: "https://plus.unsplash.com/premium_photo-1671130295823-78f170465794?w=800&q=80"
    },
    {
        name: "Moong Dal (1kg)",
        description: "Yellow split gram, easy to digest and rich in protein.",
        price: 4.20,
        category: "pulses_lentils",
        stock: 55,
        unit: "pack",
        image_url: "https://plus.unsplash.com/premium_photo-1671130295823-78f170465794?w=800&q=80"
    },
    {
        name: "Chickpeas (Kabuli Chana) 1kg",
        description: "Large white chickpeas, perfect for chole and hummus.",
        price: 3.80,
        category: "pulses_lentils",
        stock: 50,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1584269614945-312948eb99a4?w=800&q=80"
    },

    // Spices & Masalas
    {
        name: "Organic Turmeric Powder",
        description: "High-quality ground turmeric, essential for curries and health.",
        price: 8.99,
        category: "spices_masalas",
        stock: 40,
        unit: "pack",
        image_url: "https://plus.unsplash.com/premium_photo-1675237625619-b22e705b472e?w=800&q=80"
    },
    {
        name: "Garam Masala",
        description: "Aromatic blend of ground spices for authentic flavor.",
        price: 5.49,
        category: "spices_masalas",
        stock: 70,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80"
    },
    {
        name: "Whole Cumin Seeds (Jeera)",
        description: "Fresh cumin seeds to temper your dishes.",
        price: 3.99,
        category: "spices_masalas",
        stock: 65,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1549925245-c49f4c80305d?w=800&q=80"
    },

    // Oils & Ghee
    {
        name: "Pure Cow Ghee (500ml)",
        description: "Traditional aromatic ghee for cooking and flavor.",
        price: 12.99,
        category: "oils_ghee",
        stock: 30,
        unit: "bottle",
        image_url: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=800&q=80"
    },
    {
        name: "Cold Pressed Coconut Oil (1L)",
        description: "Virgin coconut oil for cooking and hair care.",
        price: 15.50,
        category: "oils_ghee",
        stock: 25,
        unit: "bottle",
        image_url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"
    },
    {
        name: "Sunflower Oil (1L)",
        description: "Refined sunflower oil, light and healthy for heart.",
        price: 4.99,
        category: "oils_ghee",
        stock: 50,
        unit: "bottle",
        image_url: "https://images.unsplash.com/photo-1474979266404-7eaacbcd041c?w=800&q=80"
    },

    // Dairy Products
    {
        name: "Whole Milk (Gallon)",
        description: "Farm-fresh vitamin D milk from local dairies.",
        price: 4.25,
        category: "dairy_products",
        stock: 15,
        unit: "gallon",
        image_url: "https://images.unsplash.com/photo-1563636619-e9162444b95e?w=800&q=80"
    },
    {
        name: "Greek Yogurt (500g)",
        description: "Thick and creamy plain greek yogurt, high in protein.",
        price: 5.99,
        category: "dairy_products",
        stock: 20,
        unit: "tub",
        image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80"
    },
    {
        name: "Salted Butter (500g)",
        description: "Creamy butter perfectly salted for toast and cooking.",
        price: 6.50,
        category: "dairy_products",
        stock: 30,
        unit: "block",
        image_url: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&q=80"
    },

    // Bakery & Bread
    {
        name: "Artisan Sourdough Bread",
        description: "Hand-crafted loaf with a perfect crust and tangy flavor.",
        price: 6.50,
        category: "bakery_bread",
        stock: 12,
        unit: "loaf",
        image_url: "https://images.unsplash.com/photo-1585478259715-876a2080a9d1?w=800&q=80"
    },
    {
        name: "Whole Wheat Sandwich Bread",
        description: "Soft and healthy bread for your daily sandwiches.",
        price: 3.99,
        category: "bakery_bread",
        stock: 20,
        unit: "loaf",
        image_url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80"
    },
    {
        name: "Chocolate Chip Cookies (Pack of 6)",
        description: "Freshly baked cookies with rich chocolate chips.",
        price: 4.99,
        category: "bakery_bread",
        stock: 25,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1499636138143-bd649043ea52?w=800&q=80"
    },

    // Snacks & Packaged Foods
    {
        name: "Potato Chips - Classic Salted",
        description: "Crispy fried potato chips lightly salted.",
        price: 1.99,
        category: "snacks_packaged_foods",
        stock: 100,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1566478919030-2614439d17d5?w=800&q=80"
    },
    {
        name: "Mixed Nuts (250g)",
        description: "Roasted almonds, cashews, and peanuts lightly salted.",
        price: 8.99,
        category: "snacks_packaged_foods",
        stock: 40,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1536591375315-13368e7ec284?w=800&q=80"
    },
    {
        name: "Instant Noodles (Pack of 4)",
        description: "Quick and spicy noodles for a fast meal.",
        price: 2.50,
        category: "snacks_packaged_foods",
        stock: 80,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=800&q=80"
    },

    // Beverages
    {
        name: "Orange Juice (1L)",
        description: "100% pure squeezed orange juice with pulp.",
        price: 5.49,
        category: "beverages",
        stock: 30,
        unit: "bottle",
        image_url: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&q=80"
    },
    {
        name: "Green Tea Bags (Pack of 25)",
        description: "Antioxidant-rich green tea for a refreshing break.",
        price: 4.99,
        category: "beverages",
        stock: 50,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&q=80"
    },
    {
        name: "Cola Soft Drink (2L)",
        description: "Classic fizzy cola drink for parties.",
        price: 2.29,
        category: "beverages",
        stock: 60,
        unit: "bottle",
        image_url: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80"
    },

    // Sugar & Confectionery
    {
        name: "White Sugar (1kg)",
        description: "Refined white sugar crystals.",
        price: 1.50,
        category: "sugar_confectionery",
        stock: 100,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1627530660662-79018c641d4c?w=800&q=80"
    },
    {
        name: "Dark Chocolate Bar",
        description: "70% cocoa rich dark chocolate.",
        price: 3.99,
        category: "sugar_confectionery",
        stock: 40,
        unit: "bar",
        image_url: "https://images.unsplash.com/photo-1511381978029-18b0298dd8ed?w=800&q=80"
    },
    {
        name: "Honey (500g)",
        description: "Pure natural honey.",
        price: 6.99,
        category: "sugar_confectionery",
        stock: 35,
        unit: "bottle",
        image_url: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80"
    },

    // Household & Cleaning
    {
        name: "Dishwashing Liquid (500ml)",
        description: "Lemon scented grease fighter.",
        price: 2.99,
        category: "household_cleaning",
        stock: 60,
        unit: "bottle",
        image_url: "https://images.unsplash.com/photo-1585837575652-267c041d77d4?w=800&q=80"
    },
    {
        name: "Laundry Detergent (2L)",
        description: "Liquid detergent for all fabric types.",
        price: 11.99,
        category: "household_cleaning",
        stock: 40,
        unit: "bottle",
        image_url: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800&q=80"
    },
    {
        name: "Paper Towels (Pack of 2)",
        description: "Highly absorbent 2-ply paper towels.",
        price: 3.50,
        category: "household_cleaning",
        stock: 50,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1609358905581-e5031587237d?w=800&q=80"
    },

    // Personal Care & Toiletries
    {
        name: "Shampoo (400ml)",
        description: "Nourishing shampoo for all hair types.",
        price: 5.99,
        category: "personal_care_toiletries",
        stock: 45,
        unit: "bottle",
        image_url: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&q=80"
    },
    {
        name: "Bath Soap (Pack of 4)",
        description: "Moisturizing bath soap bars.",
        price: 4.50,
        category: "personal_care_toiletries",
        stock: 60,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=800&q=80"
    },
    {
        name: "Toothpaste (150g)",
        description: "Fluoride toothpaste for cavity protection.",
        price: 3.25,
        category: "personal_care_toiletries",
        stock: 80,
        unit: "tube",
        image_url: "https://images.unsplash.com/photo-1559599238-308793637427?w=800&q=80"
    },

    // Ready-to-Cook
    {
        name: "Instant Idli Mix",
        description: "Ready mix for fluffy idlis.",
        price: 2.99,
        category: "ready_to_cook",
        stock: 30,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1589301760574-d81628d23472?w=800&q=80"
    },
    {
        name: "Pasta Sauce (400g)",
        description: "Tomato basil pasta sauce.",
        price: 3.99,
        category: "ready_to_cook",
        stock: 25,
        unit: "jar",
        image_url: "https://images.unsplash.com/photo-1607301406259-dfb332e20546?w=800&q=80"
    },
    {
        name: "Frozen Green Peas (500g)",
        description: "Freshly frozen peas.",
        price: 2.50,
        category: "ready_to_cook",
        stock: 40,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1592394533824-9436d7d25d1e?w=800&q=80"
    },

    // Cooking Essentials
    {
        name: "Table Salt (1kg)",
        description: "Iodized table salt.",
        price: 1.00,
        category: "cooking_essentials",
        stock: 120,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1518110925495-5ae8b475143a?w=800&q=80"
    },
    {
        name: "Black Pepper Powder (100g)",
        description: "Finely ground black pepper.",
        price: 3.50,
        category: "cooking_essentials",
        stock: 50,
        unit: "jar",
        image_url: "https://images.unsplash.com/photo-1591871926615-38b43831737e?w=800&q=80"
    },
    {
        name: "Vinegar (500ml)",
        description: "White synthetic vinegar.",
        price: 1.99,
        category: "cooking_essentials",
        stock: 40,
        unit: "bottle",
        image_url: "https://images.unsplash.com/photo-1563571642055-68d9e97d197c?w=800&q=80"
    },

    // Miscellaneous
    {
        name: "Eco-Friendly Shopping Bag",
        description: "Reusable cotton shopping bag.",
        price: 2.50,
        category: "miscellaneous",
        stock: 100,
        unit: "item",
        image_url: "https://images.unsplash.com/photo-1596704017254-9b121068fb29?w=800&q=80"
    },
    {
        name: "Kitchen Sponge (Pack of 3)",
        description: "Durable scrubbing sponges.",
        price: 1.99,
        category: "miscellaneous",
        stock: 80,
        unit: "pack",
        image_url: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=800&q=80"
    },
    {
        name: "Aluminum Foil (10m)",
        description: "Food grade aluminum foil.",
        price: 3.99,
        category: "miscellaneous",
        stock: 60,
        unit: "roll",
        image_url: "https://plus.unsplash.com/premium_photo-1675237625619-b22e705b472e?w=800&q=80"
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
