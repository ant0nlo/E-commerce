const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');  
const app = express();
require('dotenv').config(); 
const PORT = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection with updated options
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
 .then(() => console.log('MongoDB connected'))
 .catch(err => console.log(err));

app.get('/', (req,res)=>[
  res.send('Succssesfuly connected...')
])

// Image Storage Engine
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
  }
});

const upload = multer({storage: storage});

// Creating upload endpoint for images
app.use('/images', express.static('upload/images'));

app.post('/upload', upload.single('product'), (req, res) => {
  res.json({
    success: 1,
    image_url: `http://localhost:${PORT}/images/${req.file.filename}`
  });
});

// Schema for creating products
const Item = mongoose.model('Item', {
  id: {
    type: Number,
    required: true,
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

//removeing product from db
app.post('/removeproduct', async (req,res)=>{
    await Item.findOneAndDelete({id:req.body.id})
    console.log('Removed!');
    res.json({
        success:true,
        name:req.body.name
    })
})

//creating api for getting all products
app.get('/allproducts', async(req,res)=>{
    let items = await Item.find({});
    console.log('All products fetched');
    res.send(items)
})

//Shema creating for User model
const Users = mongoose.model('Users', {
  name:{
    type:String,
  },
  email:{
    type:String,
    unique:true,
  },
  password:{
    type:String,
  },
  cartData:{
    type:Object,
  },
  date:{
    type:Date,
    default:Date.now,
  },
})

//Creating endpoint for registering the user
app.post('/signup', async(req,res)=>{
  
  let check = await Users.findOne({email:req.body.email}); 
  if(check){
    return res.status(400).json({success:false, errors:"This email is already used!"})
  }
  let cart={}
  for (let i = 0; i < 300; i++) {
    cart[i] = 0
  }
  const user = new Users({
    name:req.body.username,
    email:req.body.email,
    password:req.body.password,
    cartData:cart,
  })

  await user.save()

  const data={
    user:{
      id:user.id
    }
  }
  const token = jwt.sign(data,'secret_ecom')
  res.json({success:true,token})
})

// Endpoint for user login
/* app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, error: "User not found" });
    }

    if (password !== user.password) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const data = {
      user: {
        id: user.id
      }
    };
    const token = jwt.sign(data, 'secret_ecom');

    res.json({
      success: true,
      token,
      message: "User logged in successfully"
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Server error"
    });
  }
}); */

// Endpoint for user login
app.post('/login', async (req, res) => {
  let user = await Users.findOne({ email:req.body.email });
  if (user) {
    const passCompare = req.body.password == user.password
    if(passCompare){
      // Generate token
      const data = {
        user: {
          id: user.id
        }
      };
      const token = jwt.sign(data, 'secret_ecom');
      res.json({success:true, token})
    } else {
        res.status(401).json({ success: false, error: "Invalid password" });
    }
  } else {
      res.json({ success: false, error: "Wrong email id" })
}
  
});

//creating endpoint for new collections
app.get('/newcollections', async(req,res)=>{
  let products = await Item.find({})
  let newcollection = products.slice(1).slice(-8)
  console.log("New Collection Fetched")
  res.send(newcollection)
})

//creating endpoint for popular in women section
app.get('/popularinwomen', async(req,res)=>{
  let products = await Item.find({category:"women"})
  let popularinwomen = products.slice(0,4)
  console.log("Popular in women fethed");
  res.send(popularinwomen)
})

//creating middleware to fetch user
const fetchUser = async(req,res,next)=>{
  const token = req.header('auth-token')
  if (!token) {
    req.status(401).send({errors:"Please authenticate using valid token"})
  } else {
    try {
      const data = jwt.verify(token, 'secret_ecom')
      req.user = data.user
      next();
    } catch (error) {
      res.status(404).send({errors:"Please authenticate using valid toke"})
    }
  }
}

//creating endpoint for adding products in cartdata
app.post('/addtocart',fetchUser, async(req,res)=>{
  console.log("added", req.body.itemId);
  let userData = await Users.findOne({_id:req.user.id})
  userData.cartData[req.body.itemId] += 1
  await Users.findByIdAndUpdate({_id:req.user.id},{cartData:userData.cartData})
  res.send("Added")
})

//creatimg emdpoint to remove product from cartdata
app.post('/removefromcart', fetchUser, async(req,res)=>{
  console.log("removed", req.body.itemId);
  let userData = await Users.findOne({_id:req.user.id})
  if( userData.cartData[req.body.itemId] > 0){
    userData.cartData[req.body.itemId] -= 1
  }
  await Users.findByIdAndUpdate({_id:req.user.id},{cartData:userData.cartData})
  res.send("Removed")
})

app.post('/getcart', fetchUser, async(req,res)=>{
  console.log("Get Cart");
  let userData = await Users.findOne({_id:req.user.id})
  if (!userData) {
    res.status(404).send({ errors: "User not found" });
  } else {
    res.json(userData.cartData)
  }
})


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});