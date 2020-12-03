var express = require('express');
var multer = require('multer');
var path = require('path');
var empModel=require('../modules/employee');
var uploadModel=require('../modules/upload');
var jwt=require('jsonwebtoken');

var router = express.Router();
var employee=empModel.find({});
var imageData=uploadModel.find({});

router.use(express.static(__dirname+"./public/"));

if (typeof localStorage === "undefined" || localStorage === null) {
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

var Storage = multer.diskStorage({
  destination:"./public/uploads/",
  filename:(req,file,cb)=>{
    cb(null,file.fieldname+"_"+Date.now()+path.extname(file.originalname));
  }
});

var upload = multer({
  storage:Storage
}).single('file')

router.post('/upload',upload,function(req, res, next) {
  var imageFile=req.file.filename;
  var success = req.file.filename + " uploaded successfully ";
  var imageDetails = new uploadModel({
    imagename:imageFile
  });
  imageDetails.save(function(err,data){
    if(err)
      throw err;
      imageData.exec(function(err,data){
        if(err)
          throw err;
          res.render('upload-file', {
            title: 'Upload file',
            record:data,
            success:success
          });
      });
  });
});

router.get('/upload', function(req, res, next) {
  imageData.exec(function(err,data){
    if(err)
      throw err;
      res.render('upload-file', {
        title: 'Upload file',
        record:data,
        success:''
      });
  });
});

router.get('/',checkLogin,function(req, res, next) {
  employee.exec((err,data)=>{
    if(err)
      throw err;
      res.render('index', {
        title: 'Employee Records',
        message:'Welcome to employee record',
        record:data,
        success:''
      });
  });
});

router.get('/login', function(req, res, next) {
  var token = jwt.sign({foo:'bar'},'logintoken');
  localStorage.setItem('myToken',token);
  res.send("Login Successfully");
});

router.get('/logout', function(req, res, next) {
  localStorage.removeItem('myToken');
  res.send("Logout Successfully");
});

function checkLogin(req,res,next)
{
  var myToken=localStorage.getItem('myToken');
  try
  {
    jwt.verify(myToken,'logintoken');
  }
  catch(err)
  {
    res.send("You need to login to access this page");
  }
  next();
}

router.post("/",function(req,res,next){
  var empDetails = new empModel({
    name:req.body.uname,
    email:req.body.email,
    type:req.body.emptype,
    hourlyrate:parseInt(req.body.hrlyrate),
    subject:req.body.usubject,
    totalhour:parseInt(req.body.ttlhr),
    total:parseInt(req.body.hrlyrate)*parseInt(req.body.ttlhr)
  });

  empDetails.save(function(err,response){
    if(err)
      throw err;
      employee.exec(function(err,data){
        if(err)
          throw err;
          res.render('index', {
            title: 'Employee Records',
            message:'Welcome to employee record',
            success:"Record data inserted Successfully ",
            record:data
          });
      });
  });
});

router.post('/search/',function(req,res,next){
    var flrtName=req.body.fltrname;
    var flrtEmail=req.body.fltremail;
    var fltremptype=req.body.fltremptype;

    if(flrtName !='' && flrtEmail !='' && fltremptype !='' )
      var flterParameter={ $and:[{ name:flrtName}, {$and:[{email:flrtEmail},{type:fltremptype}]} ]}
    else if(flrtName !='' && flrtEmail =='' && fltremptype !='')
      var flterParameter={ $and:[{ name:flrtName},{type:fltremptype}] }
    else if(flrtName =='' && flrtEmail !='' && fltremptype !='')
      var flterParameter={ $and:[{ email:flrtEmail},{type:fltremptype}]}
    else if(flrtName =='' && flrtEmail =='' && fltremptype !='')
      var flterParameter={type:fltremptype}
    else
      var flterParameter={}

    var employeeFilter = empModel.find(flterParameter);
    employeeFilter.exec(function(err,data){
      if(err)
        throw err;
        res.render('index', {
          title: 'Employee Records',
          message:'Welcome to employee record',
          record:data
        });
    });
});

router.get('/delete/:id', function(req, res, next) {
  var id = req.params.id;
  var del = empModel.findByIdAndDelete(id);
  del.exec((err,data)=>{
    if(err)
      throw err;
      employee.exec(function(err,data){
        if(err)
          throw err;
          res.render('index', {
            title: 'Employee Records',
            message:'Welcome to employee record',
            success:"Record data deleted Successfully ",
            record:data
          });
      });
  })
});

router.get('/edit/:id', function(req, res, next) {
  var id = req.params.id;
  var edit = empModel.findById(id);
  edit.exec((err,data)=>{
    if(err)
      throw err;
      res.render('edit', {
        title: 'Edit Employee Records',
        message:'Welcome to employee record of '+data.name,
        record:data
      });
  })
});

router.post('/update', function(req, res, next) {
  var update = empModel.findByIdAndUpdate(req.body.id,{
    name:req.body.uname,
    email:req.body.email,
    type:req.body.emptype,
    hourlyrate:parseInt(req.body.hrlyrate),
    subject:req.body.usubject,
    totalhour:parseInt(req.body.ttlhr),
    total:parseInt(req.body.hrlyrate)*parseInt(req.body.ttlhr)
  });
  update.exec((err,data)=>{
    if(err)
      throw err;
      res.render('index', {
        title: 'Employee Records',
        message:'Welcome to employee record',
        success:"Record data updated Successfully ",
        record:data
      });
  })
});

router.get('/autocomplete/',(req,res,next)=>{
  var regex = new RegExp(req.query["term"],'i');
  var employeeFilter = empModel.find({name:regex},{'name':1}).sort({"update_at":-1}).sort({"created_at":-1}).limit(5);
  employeeFilter.exec(function(err,data){
    var result=[];
    if(!err)
    {
      if(data && data.length && data.length>0)
      {
        data.forEach(user=>{
          let obj={
            id:user._id,
            label:user.name
          };
          result.push(obj);
        });
      }
    }
    res.jsonp(result);
  })
});

var officegen=require('officegen');

router.get('/genratePpt',(req, res, next)=>{
  let pptx = officegen('pptx')

  var slide = pptx.makeNewSlide()

  var arrs = [];
  employee.exec(function(err,data){
    if(err)
      throw err;
  var sam = [];
  sam.push('Name');
  sam.push('Email');
  sam.push('Type');
  sam.push('Hourly Rate');
  sam.push('Subject');
  sam.push('Total Hour');
  sam.push('Total');

  arrs.push(sam);

  for(var i=0;i<data.length;i++)
  {
    var arr = [];
    arr.push(data[i].name);
    arr.push(data[i].email);
    arr.push(data[i].type);
    arr.push(data[i].hourlyrate);
    arr.push(data[i].subject);
    arr.push(data[i].totalhour);
    arr.push(data[i].total);

    arrs.push(arr);
  }

  console.log(arrs);

  slide.addTable(arrs,{x:0,y:0,cx:'100%',cy:'100%',columnWidth:1000000});
  res.writeHead(200, {
    'Content-Type':'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'Content-disposition': 'attachment filename=out.pptx'
  });

  pptx.on('error', function(err) {
    res.end(err)
  });

  res.on('error', function(err) {
    res.end(err)
  });

  res.on('finish', function() {
    res.end()
  });
  pptx.generate(res);
  });
});

module.exports = router;