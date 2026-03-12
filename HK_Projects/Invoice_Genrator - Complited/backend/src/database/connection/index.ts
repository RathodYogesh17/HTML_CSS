const mongoose  = require("mongoose")

 const connectDB = () => {
     try {
          mongoose.connect(process.env.BASE_URL)
          .then(() => console.log("Database Connected Succusessfully"))
          .catch((err) => console.log(err))
     } catch (error) {
           console.error("Database connect Faild ", error)
     }
} 

export default connectDB