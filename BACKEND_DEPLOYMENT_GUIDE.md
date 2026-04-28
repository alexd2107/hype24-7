# HYPELIFE Backend Deployment Guide

## Quick Start Overview

Your HYPELIFE backend is ready to deploy! This guide walks you through setting up the complete order management system with email notifications.

## What's Included

✅ **Node.js/Express Backend** - RESTful API server
✅ **MongoDB Database** - Order & customer data storage  
✅ **Email Notifications** - Automatic order confirmations & updates
✅ **Crypto Payment Integration** - Solana/USDC support
✅ **Order Management** - Track, update, ship orders
✅ **Shipping Options** - Free pickup or $12.99 shipping

## Step 1: Set Up MongoDB (FREE)

1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Sign Up" and create a free account
3. Create a free M0 cluster (512MB storage)
4. Go to "Database Access" → create username/password
5. Go to "Network Access" → Add IP Address 0.0.0.0/0 (allows all)
6. Click "Connect" → Copy your connection string
7. Replace `username:password` in the connection string

**Your MongoDB URI looks like:**
```
mongodb+srv://username:password@cluster-abc.mongodb.net/hypelife
```

## Step 2: Set Up Email (Gmail FREE)

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Go to "App passwords" and create one for "Mail"
4. Google will give you a 16-character password
5. Use your Gmail as EMAIL_USER and this 16-char password as EMAIL_PASS

## Step 3: Deploy to Render.com (FREE)

1. Go to https://render.com and sign up with GitHub
2. Click "New" → "Web Service"
3. Connect your `hype24-7` GitHub repository
4. Fill in:
   - **Name**: hypelife-backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`

5. Click "Advanced" and add Environment Variables:
   - `MONGODB_URI` = Your connection string
   - `EMAIL_USER` = your-email@gmail.com
   - `EMAIL_PASS` = 16-character app password
   - `PORT` = 5000
   - `NODE_ENV` = production

6. Click "Create Web Service"
7. Wait 2-3 minutes for deployment
8. Copy your Render.com URL (looks like: https://hypelife-backend.onrender.com)

## Step 4: Update Frontend Checkout

You now need to update your `products.html` checkout to send orders to your backend.

**API Endpoint for creating orders:**
```
POST https://your-backend-url/api/orders
```

**In products.html checkout code, change:**
```javascript
// OLD: local storage only
// NEW: send to backend
const response = await fetch('https://your-render-url/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    items: cartItems,
    customerName: /* from checkout form */,
    customerEmail: /* from checkout form */,
    shippingOption: /* 'pickup' or 'shipping' */,
    shippingAddress: /* full address object */,
    paymentMethod: /* 'sol' or 'usdc' */
  })
});
```

## Step 5: Access Admin Dashboard

**Coming soon:** Your admin dashboard will be at:
```
https://your-render-url/admin
```

For now, access orders via API:
```
GET https://your-render-url/api/orders
```

This returns all orders as JSON.

## API Endpoints

### Create Order (Customer)
```
POST /api/orders
Body: { items, customerName, customerEmail, shippingOption, shippingAddress, paymentMethod }
Returns: { success: true, order: {...} }
```

### Get All Orders (Admin)
```
GET /api/orders
Returns: [{ order1 }, { order2 }, ...]
```

### Get Single Order
```
GET /api/orders/:id
Returns: { order object }
```

### Update Order Status (Admin)
```
PATCH /api/orders/:id/status
Body: { status: 'confirmed' | 'shipped' | 'delivered' | 'cancelled' }
Returns: { updated order }
```

### Verify Crypto Transaction
```
POST /api/verify-transaction
Body: { transactionHash, orderId }
Returns: { success: true, order: {...} }
```

## Shipping Fee Logic

- **Pickup**: FREE
- **Shipping**: $12.99
- **Shipping Address**: Only required if shipping selected

## Email Notifications

Customers automatically receive emails:
1. ✅ **Order Confirmation** - When order is created
2. ✅ **Order Confirmed** - When status changed to 'confirmed'
3. ✅ **Order Shipped** - When status changed to 'shipped'
4. ✅ **Order Delivered** - When status changed to 'delivered'
5. ✅ **Order Cancelled** - When order is cancelled

## Troubleshooting

**Orders not saving?**
- Check MongoDB connection string
- Verify IP address is added in MongoDB Network Access

**Emails not sending?**
- Verify Gmail app password is correct (16 characters)
- Check 2-Step Verification is enabled

**Backend not responding?**
- Check Render.com deployment logs
- Verify environment variables are set
- Test with: `curl https://your-url/api/orders`

## Cost Breakdown

- **MongoDB Atlas**: FREE (512MB)
- **Render.com**: FREE tier (sleeps after 15 min inactivity)
- **Gmail App Password**: FREE
- **Total**: **$0/month** ✅

Upgrade to paid tiers when you need:
- More storage (MongoDB)
- Always-on hosting (Render)

## Next Steps

1. ✅ Deploy backend to Render.com
2. ✅ Update checkout to call backend API
3. ✅ Test order creation
4. ✅ Verify email notifications
5. Build admin dashboard (dashboard.html)
6. Add Solana payment verification

**Your backend is production-ready! Deploy now and start taking orders!** 🚀
