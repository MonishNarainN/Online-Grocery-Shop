const express = require('express');
const Product = require('../models/Product');
const Promotion = require('../models/Promotion');
const Review = require('../models/Review');
const auth = require('../middleware/auth');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Create a new product
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        const productData = {
            name: req.body.name,
            description: req.body.description,
            price: Number(req.body.price),
            category: req.body.category,
            stock: Number(req.body.stock),
            unit: req.body.unit,
            image_url: req.body.image_url || null,
            is_active: true
        };

        if (req.file) {
            productData.image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const product = new Product(productData);
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a product
router.put('/:id', auth, upload.single('image'), async (req, res) => {
    try {
        const productData = {
            name: req.body.name,
            description: req.body.description,
            price: Number(req.body.price),
            category: req.body.category,
            stock: Number(req.body.stock),
            unit: req.body.unit
        };

        // Preserve existing image_url if a new one is typed, or use newly uploaded file
        if (req.body.image_url) {
            productData.image_url = req.body.image_url;
        }

        if (req.file) {
            productData.image_url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
        }

        const product = await Product.findByIdAndUpdate(req.params.id, productData, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Get all products with optional filters
router.get('/', async (req, res) => {
    try {
        const { search, category } = req.query;
        let filter = { is_active: true };

        if (search) {
            filter.name = { $regex: search, $options: 'i' };
        }

        if (category && category !== 'All') {
            filter.category = category;
        }

        const products = await Product.find(filter).lean(); // Use lean() for performance since we modify objects

        // Fetch active promotions
        const currentDate = new Date();
        const promoFilter = {
            isActive: true,
            startDate: { $lte: currentDate },
            $or: [
                { endDate: null },
                { endDate: { $exists: false } },
                { endDate: { $gte: currentDate } }
            ]
        };
        const activePromotions = await Promotion.find(promoFilter);

        // Apply discounts
        const productsWithDiscounts = products.map(product => {
            let maxDiscount = 0;
            let discountMinQuantity = 0;
            // Find applicable promotions for this product
            activePromotions.forEach(promo => {
                if (promo.target === 'All' || (promo.target === 'Category' && promo.targetValue === product.category)) {
                    if (promo.discountPercent > maxDiscount) {
                        maxDiscount = promo.discountPercent;
                        discountMinQuantity = promo.minQuantity || 0;
                    }
                }
            });

            const productData = { ...product, id: product._id };
            delete productData._id;
            delete productData.__v;

            if (maxDiscount > 0) {
                productData.discountPercent = maxDiscount;
                productData.discountedPrice = product.price * (1 - (maxDiscount / 100));
                productData.discountMinQuantity = discountMinQuantity;
            }

            return productData;
        });

        res.json(productsWithDiscounts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).lean();
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Fetch active promotions
        const currentDate = new Date();
        const promoFilter = {
            isActive: true,
            startDate: { $lte: currentDate },
            $or: [
                { endDate: null },
                { endDate: { $exists: false } },
                { endDate: { $gte: currentDate } }
            ]
        };
        const activePromotions = await Promotion.find(promoFilter);

        let maxDiscount = 0;
        let discountMinQuantity = 0;

        activePromotions.forEach(promo => {
            if (promo.target === 'All' || (promo.target === 'Category' && promo.targetValue === product.category)) {
                if (promo.discountPercent > maxDiscount) {
                    maxDiscount = promo.discountPercent;
                    discountMinQuantity = promo.minQuantity || 0;
                }
            }
        });

        const productData = { ...product, id: product._id };
        delete productData._id;
        delete productData.__v;

        if (maxDiscount > 0) {
            productData.discountPercent = maxDiscount;
            productData.discountedPrice = product.price * (1 - (maxDiscount / 100));
            productData.discountMinQuantity = discountMinQuantity;
        }

        res.json(productData);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get reviews for a product
router.get('/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ product_id: req.params.id }).sort({ created_at: -1 });
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a review to a product
router.post('/:id/reviews', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;
        const userId = req.user.id;

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        // Check if user already reviewed
        const existingReview = await Review.findOne({ product_id: productId, user_id: userId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this product. You can only review once.' });
        }

        const review = new Review({
            user_id: userId,
            user_name: req.body.user_name || 'Customer', // Fallback
            product_id: productId,
            rating: Number(rating),
            comment
        });

        await review.save();

        // Update product average rating
        const allReviews = await Review.find({ product_id: productId });
        const numReviews = allReviews.length;
        const averageRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

        product.numReviews = numReviews;
        product.averageRating = averageRating;
        await product.save();

        res.status(201).json({ message: 'Review added', review, averageRating, numReviews });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a review
router.put('/:id/reviews/:reviewId', auth, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { id: productId, reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        if (review.user_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to edit this review' });
        }

        review.rating = Number(rating);
        review.comment = comment;
        await review.save();

        // Update product average rating
        const allReviews = await Review.find({ product_id: productId });
        const numReviews = allReviews.length;
        const averageRating = allReviews.reduce((acc, item) => item.rating + acc, 0) / (numReviews || 1);

        const product = await Product.findById(productId);
        if (product) {
            product.numReviews = numReviews;
            product.averageRating = averageRating;
            await product.save();
        }

        res.json({ message: 'Review updated', review, averageRating, numReviews });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a review
router.delete('/:id/reviews/:reviewId', auth, async (req, res) => {
    try {
        const { id: productId, reviewId } = req.params;

        const review = await Review.findById(reviewId);
        if (!review) return res.status(404).json({ message: 'Review not found' });

        if (review.user_id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        await review.deleteOne();

        // Update product average rating
        const allReviews = await Review.find({ product_id: productId });
        const numReviews = allReviews.length;
        const averageRating = numReviews > 0 ? allReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews : 0;

        const product = await Product.findById(productId);
        if (product) {
            product.numReviews = numReviews;
            product.averageRating = averageRating;
            await product.save();
        }

        res.json({ message: 'Review deleted', averageRating, numReviews });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
