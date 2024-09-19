// index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');  
const bcrypt = require('bcrypt'); // Добавен bcrypt
const app = express();
require('dotenv').config(); 
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB връзка с обновени опции
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
 .then(() => console.log('MongoDB connected'))
 .catch(err => console.log(err));

// Root endpoint
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

// Създаване на endpoint за качване на изображения
app.use('/images', express.static('upload/images'));

app.post('/upload', upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${PORT}/images/${req.file.filename}`
  });
});

// Схема за създаване на продукти
const Item = mongoose.model('Item', {
  id: {
    type: Number,
    required: true,
    unique: true, // Добавен уникален индекс
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

app.post('/addproduct', async (req, res) => {
  try {
    let items = await Item.find({});
    let id;
    if (items.length > 0) {
      let last_item = items[items.length - 1];
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

// Премахване на продукт от базата данни
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

// Създаване на API за получаване на всички продукти
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

// Схема за потребителски модел
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

// Създаване на endpoint за регистрация на потребителя
app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body; // Променено от req.body.formData
    // Валидация на входните данни
    if (!username || !email || !password) {
      return res.status(400).json({success:false, errors:"Please provide username, email and password"});
    }

    let check = await Users.findOne({email: email}); 
    if(check){
      return res.status(400).json({success:false, errors:"This email is already used!"});
    }

    // Хеширане на паролата
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Инициализиране на cartData с 100 артикула, всички зададени на 0
    let cart = {};
    for (let i = 0; i < 100; i++) {
      cart[i.toString()] = 0; // Ключовете са низове
    }

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

// Endpoint за логин на потребителя
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Променено от req.body.formData

    // Валидация на входните данни
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Please provide email and password" });
    }

    let user = await Users.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ success: false, error: "User not found" });
    }

    // Сравняване на паролата
    const passCompare = await bcrypt.compare(password, user.password);
    if (passCompare){
      // Генериране на токен
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

// Създаване на endpoint за нови колекции
app.get('/newcollections', async (req, res) => {
  try {
    let products = await Item.find({});
    let newcollection = products.slice(-8); // Поправено slice за получаване на последните 8 артикула
    console.log("New Collection Fetched");
    res.send(newcollection);
  } catch (error) {
    console.error("Error fetching new collections:", error);
    res.status(500).json({ success: false, error: "Failed to fetch new collections" });
  }
});

// Създаване на endpoint за популярни продукти за жени
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

// Създаване на middleware за извличане на потребителя
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

// Endpoint за добавяне на продукти в cartData
app.post('/addtocart', fetchUser, async (req, res) => {
  try {
      const { itemId, size } = req.body;
      if (itemId === undefined || !size) {
          return res.status(400).json({ errors: "Item ID and size are required" });
      }

      const itemIdStr = itemId.toString();
      const sizeStr = size.toString().toUpperCase();

      // Проверка дали itemId и size са валидни
      const itemExists = await Item.findOne({ id: Number(itemIdStr) });
      if (!itemExists) {
          return res.status(400).json({ errors: "Invalid item ID" });
      }

      // Опционално: Проверка дали size е валиден
      const validSizes = ['S', 'M', 'L', 'XL', 'XXL'];
      if (!validSizes.includes(sizeStr)) {
          return res.status(400).json({ errors: "Invalid size selected" });
      }

      // Актуализиране на cartData чрез $inc
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


// Създаване на endpoint за премахване на продукт от cartData
app.post('/removefromcart', fetchUser, async (req, res) => {
  try {
    const { itemId } = req.body;
    if (itemId === undefined) {
      return res.status(400).json({ errors: "Item ID is required" });
    }

    const itemIdStr = itemId.toString(); // Конвертиране към низ

    // Проверка дали itemId е валиден
    const itemExists = await Item.findOne({ id: Number(itemIdStr) });
    if (!itemExists) {
      return res.status(400).json({ errors: "Invalid item ID" });
    }

    // Намаляване на количеството само ако е > 0
    const user = await Users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ errors: "User not found" });
    }

    const currentQty = user.cartData.get(itemIdStr) || 0;
    if (currentQty > 0) {
      const updatedUser = await Users.findByIdAndUpdate(
        req.user.id,
        { $inc: { [`cartData.${itemIdStr}`]: -1 } },
        { new: true }
      );
      res.json({ success: true, cartData: updatedUser.cartData });
    } else {
      res.status(400).json({ errors: "Item quantity is already zero" });
    }
  } catch (error) {
    console.error("Error removing from cart:", error);
    res.status(500).json({ errors: "Failed to remove from cart" });
  }
});

// Създаване на endpoint за получаване на cartData
app.post('/getcart', fetchUser, async (req, res) => {
  try {
    console.log("Get Cart");
    let userData = await Users.findById(req.user.id);
    if (!userData) {
      res.status(404).send({ errors: "User not found" });
    } else {
      res.json(Object.fromEntries(userData.cartData)); // Конвертиране от Map към Object
    }
  } catch (error) {
    console.error("Error getting cart:", error);
    res.status(500).send({ errors: "Failed to get cart" });
  }
});

// Стартиране на сървъра
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
