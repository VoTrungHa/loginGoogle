const mongose=require("mongoose")
const connectDB=async()=>{
    const connection=await mongose.connect
    (process.env.MONGODB,
    {useCreateIndex:true,
    useNewUrlParser:true,
    useFindAndModify:true,
useUnifiedTopology:true})
console.log(`mongodb connected: ${connection.connection.port}`)
}
module.exports=connectDB;