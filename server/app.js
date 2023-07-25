const express = require('express')
const app = express()

app.get('/',(req,res)=>{
    res.send('Hello World')
})


app.listen(5000,()=>{console.log('Started on port 5000...');})