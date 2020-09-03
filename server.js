const express=require('express');
const morgan=require('morgan'); 
const bodyParser =require('body-parser');
require('dotenv').config(); 
const cors=require('cors'); 
const {initRouter} =require('./src/router/auth.router')
const connectDb=require('./src/config/db');
 
const PROT=process.env.PORT;
const app=express();
// conenct database
connectDb();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false})) 

if(process.env.NODE_ENV="development")
{
    app.use(cors())
    app.use(morgan('dev'));
}

initRouter(app);
app.use((req,res,next)=>{
    res.status(404).json({
        success:false,
        message:"Page Not Fuonded"
    })
})

 
app.listen(PROT,()=>console.log(`chay voi port ${PROT}`))