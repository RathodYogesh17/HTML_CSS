import 'dotenv/config';
import server from './src';
import connectDB from './src/database/connection';
const PORT = Number(process.env.PORT) || 6000;
server.listen(PORT, () => {
    connectDB()
    console.log(`server started on port ${PORT}`);
});