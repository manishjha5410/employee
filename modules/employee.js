var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/employee',{useNewUrlParser:true,useUnifiedTopology: true});
var connect=mongoose.connection;

var employeeSchema=new mongoose.Schema({
    name:String,
    email:String,
    type:String,
    hourlyrate:Number,
    subject:String,
    totalhour:Number,
    total:Number
});

var employeeModel = mongoose.model('Employee',employeeSchema);

module.exports=employeeModel;