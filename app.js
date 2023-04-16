const express = require('express')
const cors = require('cors');
const bodyParser = require('body-parser');

//mongodb version 5
const mongo=require('mongodb');
const {MongoClient} =require('mongodb');
const url="mongodb://localhost:27017";
const client=new MongoClient(url)

const app = express()

const port = process.env.PORT || 5000

const swaggerUi=require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const package= require('./package.json');
swaggerDocument.info.version=package.version;
app.use('/app-doc',swaggerUi.serve,swaggerUi.setup(swaggerDocument))

app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cors())

app.use(express.static(__dirname+'/public'))
app.set('views','./src/views')
app.set('view engine','ejs')



const collection=client.db('internfeb').collection('dashmarch')


// !important! 
// you need to install the following libraries |express|[dotenv > if required]
// or run this command >> npm i express dotenv 
async function main(){
   await client.connect()
}

app.get('/health' , (req , res)=>{

   res.send('hello from simple server :)')

})
//add user
// app.post('/addUser' , async(req , res)=>{

//    await collection.insertOne(req.body);
//    res.send('data added successfully')

// })
app.post('/addUser', async(req,res) => {
    let data = {
        name:req.body.name,
        city:req.body.city,
        phone:req.body.phone,
        role:req.body.role?req.body.role:'User',
        isActive:true
    }
    await collection.insertOne(data);
   
    res.redirect('/')
    
})


app.get('/',async(req,res) =>{
    const output = [];
    const cursor = collection.find();
        for await(const doc of cursor){
            output.push(doc)
        }
    cursor.closed;
    res.render('index',{data:output});
})

app.get('/new',(req,res) => {
    res.render('forms')
})


//get data
// app.get('/users' , async(req , res)=>{
// const output=[];
// const query={}


// })
app.get('/users' , async(req, res)=>{
const output=[];
const query={};
if(req.query.city && req.query.role){
   query={
      city:req.query.city,
      city:req.query.role,
      isActive:true
   }
}
   else if(req.query.city){
      query={
         city:req.query.city, 
         isActive:true
      }
   }
   else if(req.query.role){
      query={
         role:req.query.role,
         isActive:true
      }
   }
   else if(req.query.isActive){
      let isActive=req.query.isAcitve;
      if (isActive=="false") {
         isActive=false
      }
      else{
         isActive=true
      }
      query={
         isActive
      }
   }
      const cursor=collection.find(query)
for await(const doc of cursor){
   output.push(doc)
}
cursor.closed;
res.send(output)
})
//information particual user
app.get('/users/:id', async(req,res)=>{
   const output=[]
   let query={
      _id:new mongo.ObjectId(req.params.id)
   }
   const cursor=collection.find(query);
   for await(const doc of cursor){
      output.push(doc)
   }
   cursor.closed;
   res.send(output)
})
//update user
app.put('/updateUser', async(req,res)=>{
   await collection.updateOne(
      
         {_id: new mongo.ObjectId(req.body._id)},
      
      {
         $set:{
            name:req.body.name,
            city:req.body.city,
            phone:req.body.phone,
            role:req.body.role,
            isActive:true
         }
      }
   )
   res.send('data updated successfully')
})
//delete user *Hard Delete*//
app.delete('/deleteUser', async(req, res)=>{
   await collection.deleteOne(
      {_id:new mongo.ObjectId(req.body._id)}
   )
res.send('user Deleted successfully')
})
//soft delete deactivate User//
app.put('/deactivateUser', async(req,res)=>{
   await collection.updateOne(
      
         {_id: new mongo.ObjectId(req.body._id)},
      
      {
         $set:{
          
            isActive:false
         }
      }
   )
   res.send('user deactivated successfully')
})

//Activate User//
app.put('/activateUser', async(req,res)=>{
   await collection.updateOne(
      
         {_id: new mongo.ObjectId(req.body._id)},
      
      {
         $set:{
            
            isActive:true
         }
      }
   )
   res.send('User is Activated successfully')
})

app.listen(port , ()=> {
   main()
   console.log('> Server is up and running on port : ' + port)
})