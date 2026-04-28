const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/hypelife')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Order Schema
const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true },
  customerName: String,
  customerEmail: String,
  items: [{
    productId: String,
    productName: String,
    price: Number,
    quantity: Number
  }],
  subtotal: Number,
  shippingOption: { type: String, enum: ['pickup', 'shipping'] },
  shippingFee: { type: Number, default: 0 },
  totalPrice: Number,
  shippingAddress: {
    fullName: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    phone: String
  },
  paymentMethod: { type: String, enum: ['sol', 'usdc'] },
  transactionHash: String,
  status: { type: String, default: 'pending', enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// Generate unique Order ID
function generateOrderId() {
  return 'HYP-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

// API Routes

// Create Order
app.post('/api/orders', async (req, res) => {
  try {
    const { items, customerName, customerEmail, shippingOption, shippingAddress, paymentMethod } = req.body;
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = shippingOption === 'shipping' ? 12.99 : 0;
    const totalPrice = subtotal + shippingFee;
    
    const order = new Order({
      orderId: generateOrderId(),
      customerName,
      customerEmail,
      items,
      subtotal,
      shippingOption,
      shippingFee,
      totalPrice,
      shippingAddress: shippingOption === 'shipping' ? shippingAddress : null,
      paymentMethod,
      status: 'pending'
    });
    
    await order.save();
    
    // Send confirmation email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customerEmail,
      subject: `Order Confirmed - ${order.orderId}`,
      html: `
        <h2>Order Confirmation</h2>
        <p>Thank you for your order!</p>
        <p><strong>Order ID:</strong> ${order.orderId}</p>
        <p><strong>Total:</strong> $${totalPrice.toFixed(2)}</p>
        <p><strong>Shipping:</strong> ${shippingOption === 'pickup' ? 'Free Pickup' : 'Shipping ($12.99)'}</p>
        <p>We will notify you when your order ships.</p>
      `
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log('Email error:', error);
      else console.log('Email sent:', info.response);
    });
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all orders (admin)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single order
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status (admin)
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status, updatedAt: Date.now() }, { new: true });
    
    // Send status update email
    const statusMessages = {
      confirmed: 'Your order has been confirmed!',
      shipped: 'Your order has shipped!',
      delivered: 'Your order has been delivered!',
      cancelled: 'Your order has been cancelled.'
    };
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.customerEmail,
      subject: `Order ${status} - ${order.orderId}`,
      html: `<h2>${statusMessages[status]}</h2><p>Order ID: ${order.orderId}</p>`
    };
    
    transporter.sendMail(mailOptions, (error) => {
      if (error) console.log('Email error:', error);
    });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Verify transaction hash (for crypto payments)
app.post('/api/verify-transaction', async (req, res) => {
  try {
    const { transactionHash, orderId } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, { transactionHash, status: 'confirmed' }, { new: true });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
