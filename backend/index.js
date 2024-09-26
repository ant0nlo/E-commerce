// index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');  
const bcrypt = require('bcrypt'); // Password hashing
const amqp = require('amqplib'); // RabbitMQ
const { v4: uuidv4 } = require('uuid'); // UUID for unique IDs
const app = express();
require('dotenv').config(); 
const PORT = process.env.PORT || 4000;
const IP = 'localhost'; // Уверете се, че IP е дефинирано правилно

// CORS Configuration
const corsOptions = {
  origin: `http://${IP}:3000`, // Frontend origin
  credentials: true, // Allow credentials (cookies, authorization headers)
};


app.use(cors(corsOptions));

// Middleware
app.use(express.json());

// MongoDB Connection with Updated Options
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
 .then(() => console.log('MongoDB connected'))
 .catch(err => console.log(err));

// Root Endpoint
app.get('/', (req, res) => {
  res.send('Successfully connected...')
});

// Image Storage Engine
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
});

const upload = multer({storage: storage});

// Serve Static Images
app.use('/images', express.static('upload/images'));

// Image Upload Endpoint
app.post('/upload', upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://${IP}:${PORT}/images/${req.file.filename}`
  });
});

// Product Schema
const Item = mongoose.model('Item', {
  id: {
    type: Number,
    required: true,
    unique: true, // Unique index
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  new_price: {
    type: Number,
    required: true,
  },
  old_price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

// Add Product Endpoint
app.post('/addproduct', async (req, res) => {
  try {
    let items = await Item.find({});
    let id;
    if (items.length > 0) {
      let last_item_arr = items.slice(-1)
      let last_item = last_item_arr[0]
      id = last_item.id + 1;
    } else {
      id = 1;
    }
    
    const product = new Item({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    });
    
    console.log(product);
    
    await product.save();
    console.log("Saved");
    res.json({
      success: true,
      name: req.body.name,
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add product"
    });
  }
});

// Remove Product Endpoint
app.post('/removeproduct', async (req, res) => {
  try {
    const result = await Item.findOneAndDelete({id: req.body.id});
    if (result) {
      console.log('Removed!');
      res.json({
        success: true,
        name: req.body.name
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove product"
    });
  }
});

// Get All Products Endpoint
app.get('/allproducts', async (req, res) => {
  try {
    let items = await Item.find({});
    console.log('All products fetched');
    res.send(items);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products"
    });
  }
});

// User Schema
const Users = mongoose.model('Users', {
  name:{
    type: String,
    required: true
  },
  email:{
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  password:{
    type: String,
    required: true,
  },
  cartData:{
    type: Map,
    of: Number,
    default: {},
  },
  date:{
    type: Date,
    default: Date.now,
  },
});

// User Signup Endpoint
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body; // Changed from req.body.formData
    // Validate input data
    if (!username || !email || !password) {
      return res.status(400).json({success:false, errors:"Please provide username, email and password"});
    }

    let check = await Users.findOne({email: email}); 
    if(check){
      return res.status(400).json({success:false, errors:"This email is already used!"});
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Initialize cartData with empty object
    let cart = {};

    const user = new Users({
      name: username,
      email: email,
      password: hashedPassword,
      cartData: cart,
    });

    await user.save();

    const data = {
      user: {
        id: user._id
      }
    };
    const token = jwt.sign(data, process.env.JWT_SECRET || 'secret_ecom', { expiresIn: '1h' });
    res.json({success:true, token});
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({success:false, errors:"Server error"});
  }
});

// User Login Endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Changed from req.body.formData

    // Validate input data
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Please provide email and password" });
    }

    let user = await Users.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ success: false, error: "User not found" });
    }

    // Compare passwords
    const passCompare = await bcrypt.compare(password, user.password);
    if (passCompare){
      // Generate token
      const data = {
        user: {
          id: user._id
        }
      };
      const token = jwt.sign(data, process.env.JWT_SECRET || 'secret_ecom', { expiresIn: '1h' });
      res.json({success:true, token});
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// Get New Collections Endpoint
app.get('/newcollections', async (req, res) => {
  try {
    let products = await Item.find({});
    let newcollection = products.slice(-8); // Fixed slice to get last 8 items
    console.log("New Collection Fetched");
    res.send(newcollection);
  } catch (error) {
    console.error("Error fetching new collections:", error);
    res.status(500).json({ success: false, error: "Failed to fetch new collections" });
  }
});

// Get Popular Products for Women Endpoint
app.get('/popularinwomen', async (req, res) => {
  try {
    let products = await Item.find({category:"women"});
    let popularinwomen = products.slice(0,4);
    console.log("Popular in women fetched");
    res.send(popularinwomen);
  } catch (error) {
    console.error("Error fetching popular in women:", error);
    res.status(500).json({ success: false, error: "Failed to fetch popular in women" });
  }
});

// Middleware to Fetch User from Token
const fetchUser = async (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) {
    return res.status(401).send({errors:"Please authenticate using valid token"});
  } 
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || 'secret_ecom');
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({errors:"Please authenticate using valid token"});
  }
};

// Add to Cart Endpoint
app.post('/addtocart', fetchUser, async (req, res) => {
  try {
      const { itemId, size } = req.body;
      if (itemId === undefined || !size) {
          return res.status(400).json({ errors: "Item ID and size are required" });
      }

      const itemIdStr = itemId.toString();
      const sizeStr = size.toString().toUpperCase();

      // Check if itemId and size are valid
      const itemExists = await Item.findOne({ id: Number(itemIdStr) });
      if (!itemExists) {
          return res.status(400).json({ errors: "Invalid item ID" });
      }

      const validSizes = ['S', 'M', 'L', 'XL', 'XXL'];
      if (!validSizes.includes(sizeStr)) {
          return res.status(400).json({ errors: "Invalid size selected" });
      }

      // Update cartData using $inc
      const cartKey = `${itemIdStr}-${sizeStr}`;
      const updatedUser = await Users.findByIdAndUpdate(
          req.user.id,
          { $inc: { [`cartData.${cartKey}`]: 1 } },
          { new: true }
      );

      if (!updatedUser) {
          return res.status(404).json({ errors: "User not found" });
      }

      res.json({ success: true, cartData: Object.fromEntries(updatedUser.cartData) });
  } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ errors: "Failed to add to cart" });
  }
});

// Remove from Cart Endpoint
app.post('/removefromcart', fetchUser, async (req, res) => {
  try {
      const { itemId, size } = req.body;
      if (itemId === undefined || !size) {
          return res.status(400).json({ errors: "Item ID and size are required" });
      }

      const itemIdStr = itemId.toString();
      const sizeStr = size.toString().toUpperCase();

      // Check if itemId and size are valid
      const itemExists = await Item.findOne({ id: Number(itemIdStr) });
      if (!itemExists) {
          return res.status(400).json({ errors: "Invalid item ID" });
      }

      const validSizes = ['S', 'M', 'L', 'XL', 'XXL'];
      if (!validSizes.includes(sizeStr)) {
          return res.status(400).json({ errors: "Invalid size selected" });
      }

      // Decrease quantity only if > 0
      const user = await Users.findById(req.user.id);
      if (!user) {
          return res.status(404).json({ errors: "User not found" });
      }

      const cartKey = `${itemIdStr}-${sizeStr}`;
      const currentQty = user.cartData.get(cartKey) || 0;
      if (currentQty > 0) {
          const updatedUser = await Users.findByIdAndUpdate(
              req.user.id,
              { $inc: { [`cartData.${cartKey}`]: -1 } },
              { new: true }
          );
          res.json({ success: true, cartData: Object.fromEntries(updatedUser.cartData) });
      } else {
          return res.status(400).json({ errors: "Item quantity is already zero" });
      }
  } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ errors: "Failed to remove from cart" });
  }
});

// Get Cart Data Endpoint
app.post('/getcart', fetchUser, async (req, res) => {
  try {
    console.log("Get Cart");
    let userData = await Users.findById(req.user.id);
    if (!userData) {
      res.status(404).send({ errors: "User not found" });
    } else {
      res.json(Object.fromEntries(userData.cartData)); // Convert Map to Object
    }
  } catch (error) {
    console.error("Error getting cart:", error);
    res.status(500).send({ errors: "Failed to get cart" });
  }
});

// *** IMPORTANT: Remove the following /order endpoint if using a separate Order Service ***
/*
app.post('/order', async (req, res) => {
  const { items, total, userEmail } = req.body;

  // Validate input data
  if (!items || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  const order = {
      id: uuidv4(),
      items,
      total,
      userEmail,
      status: 'PENDING'
  };

  try {
      // Save order to MongoDB
      await db.collection('orders').insertOne(order);
      console.log('Order saved:', order.id);

      // Send message to Payment Processing Service via RabbitMQ
      if (channel) {
          const orderBuffer = Buffer.from(JSON.stringify(order));
          channel.sendToQueue('payment_queue', orderBuffer, { persistent: true });
          console.log('Order sent to payment queue');
      } else {
          console.error('RabbitMQ channel not available');
          // Optionally handle this case (e.g., retry logic)
      }

      res.status(201).json({ message: 'Order placed successfully', orderId: order.id });
      // Remove frontend redirection from backend
      // window.location.href = '/order-confirmation'; // ❌ Remove this line
  } catch (err) {
      console.error('Error placing order:', err);
      res.status(500).json({ error: 'Failed to place order' });
  }
});*/

/* app.post('/order', async (req, res) => {
  const { items, total, userEmail } = req.body;

  // Validate input data
  if (!items || !userEmail) {
      return res.status(400).json({ error: 'Missing required fields' });
  }

  const order = {
      id: uuidv4(),
      items,
      total,
      userEmail,
      status: 'PENDING'
  };

  try {
      // Save order to MongoDB
      await db.collection('orders').insertOne(order);
      console.log('Order saved:', order.id);

      // Send message to Payment Processing Service via RabbitMQ
      if (channel) {
          const orderBuffer = Buffer.from(JSON.stringify(order));
          channel.sendToQueue('payment_queue', orderBuffer, { persistent: true });
          console.log('Order sent to payment queue');
      } else {
          console.error('RabbitMQ channel not available');
          // Optionally handle this case (e.g., retry logic)
      }

      res.status(201).json({ message: 'Order placed successfully', orderId: order.id });
      // Remove frontend redirection from backend
      // window.location.href = '/order-confirmation'; // ❌ Remove this line
  } catch (err) {
      console.error('Error placing order:', err);
      res.status(500).json({ error: 'Failed to place order' });
  }
});
 */


// Get User Email Endpoint
app.get('/getUserEmail', fetchUser, async (req, res) => {
  try {
      const user = await Users.findById(req.user.id); // Adjust as per your logic
      res.status(200).json({ email: user.email });
  } catch (err) {
      console.error('Error fetching user email:', err);
      res.status(500).json({ error: 'Failed to fetch user email' });
  }
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});