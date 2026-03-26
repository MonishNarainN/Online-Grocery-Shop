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
        name: "Pure Cow Ghee (500ml)",
        description: "Traditional aromatic ghee for cooking and flavor.",
        price: 12.99,
        category: "oils_ghee",
        stock: 30,
        unit: "bottle",
        image_url: "https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=800&q=80"
    },
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
        name: "Artisan Sourdough Bread",
        description: "Hand-crafted loaf with a perfect crust and tangy flavor.",
        price: 6.50,
        category: "bakery_bread",
        stock: 12,
        unit: "loaf",
        image_url: "https://images.unsplash.com/photo-1585478259715-876a2080a9d1?w=800&q=80"
    },
    {
        name: "Orange Juice (1L)",
        description: "100% pure squeezed orange juice with pulp.",
        price: 5.49,
        category: "beverages",
        stock: 30,
        unit: "bottle",
        image_url: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&q=80"
    }
];

module.exports = products;
