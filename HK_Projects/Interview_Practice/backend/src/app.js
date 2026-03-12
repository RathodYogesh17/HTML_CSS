const express =  require("express");
const router = require("./routes/main.routes");

const port = 3000;
const app =  express()

app.use("/api", router)


app.listen(port ,  () => {
    console.log(`server running on localhost:${port}`);
})