const express = require('express')
const app = express()

app.get('/',(req,res)=>{
    res.send('home page')
})


app.listen(5000,()=>{console.log('Started on port 5000...');})