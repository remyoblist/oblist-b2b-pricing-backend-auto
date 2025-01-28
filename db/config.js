//import mongoose in the application
const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI;

if (!mongoURI) {
  console.error("Error: MONGODB_URI is not defined in environment variables.");
  process.exit(1); // Exit the application if MONGODB_URI is not set
}
// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
  console.log("Connected to MongoDB successfully.");
})
.catch((error) => {
  console.error("Error connecting to MongoDB:", error);
  process.exit(1); // Exit the application if the connection fails
});;

module.exports = mongoose;