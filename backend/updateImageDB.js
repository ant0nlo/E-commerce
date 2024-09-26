const mongoose = require('mongoose');
require('dotenv').config(); 

const IP = 'https://e-commerce-8wzd.onrender.com'; // Уверете се, че IP е дефинирано правилно
const OLD_IP = 'e-commerce-8wzd.onrender.com'; // Уверете се, че IP е дефинирано правилно

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
 .then(() => console.log('MongoDB connected'))
 .catch(err => console.log(err));

const productSchema = new mongoose.Schema({
  id: Number,
  name: String,
  category: String,
  image: String,
  new_price: Number,
  old_price: Number,
  description: String,
  rating: Number,
  numOfRatings: Number,
});

const Item = mongoose.model('Item', productSchema);

const updateImageUrls = async () => {
  try {
    const products = await Item.find({ image: { $regex: `${OLD_IP}` } });
    for (const product of products) {
      product.image = product.image.replace(`${OLD_IP}`, `${IP}`);
      await product.save();
    }
    console.log('Image URLs updated successfully!');
  } catch (error) {
    console.error('Error updating image URLs:', error);
  } finally {
    mongoose.connection.close();
  }
};

updateImageUrls();