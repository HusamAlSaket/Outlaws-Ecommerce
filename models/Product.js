const mongoose = require('mongoose');

// Define schema structure
const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true // This field is required
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  image: String,
  category: String,
  popular: {
    type: Boolean,
    default: false
  }
});

// Export model
module.exports = mongoose.model('Product', productSchema);
