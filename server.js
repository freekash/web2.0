const express=require('express');
const app=express();
const bodyParser = require('body-parser');
const {save_user_information}=require('./models/server_db');
const path = require('path');
const publicPath= path.join(__dirname, './public');
const paypal = require('paypal-rest-sdk');


//pay pal configuration
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AenCu0y7hooS07_FrGb-bdwkXl6P185eSh6TSC_1zZ1eZp6YXxOMBuJzs6PEFBvd9C3WWOu45GXfamEa',
  'client_secret': 'EBfzsUK5xKqzADh1eR_H-udqTpp0zS0ctARWuCjN91d10NLzK83a8CDJ5MpbO-UPXwHmtwWNq3ZFkVY1'
});

app.use(bodyParser.json());
app.use(express.static(publicPath));
//console.log("hello");
app.post('/post_info',async (req,res)=>{
  var email=req.body.email;
  var amount=req.body.amount;

 if(amount<=1){
   return_info={};
   return_info.error=true;
   return_info.message="The amount should be greater than 1";
   return res.send(return_info);
 }
 var result=await save_user_information({"amount":amount,"email":email});


 var create_payment_json = {
     "intent": "sale",
     "payer": {
         "payment_method": "paypal"
     },
     "redirect_urls": {
         "return_url": "http://localhost:3000/success",
         "cancel_url": "http://localhost:3000/cancel"
     },
     "transactions": [{
         "item_list": {
             "items": [{
                 "name": "LOTTERY",
                 "sku": "funding",
                 "price": amount,
                 "currency": "USD",
                 "quantity": 1
             }]
         },
         "amount": {
             "currency": "USD",
             "total": amount
         },
         'payee': {
           'email':'sb-vkmsc3821752@business.example.com'
         },
         "description": "Lottery Purchase"
     }]
 };


 paypal.payment.create(create_payment_json, function (error, payment) {
     if (error) {
         throw error;
     } else {
         console.log("Create Payment Response");
         console.log(payment);
         for(var i = 0; i< payment.links.length; i++){
          if(payment.links[i].rel =='approval_url'){
            return res.send(payment.links[i].href);
          }
        }
     }
 });

  //res.send(result);
});
app.get('/get_total_amount',async(req,res)=>{
  var result= await get_total_amount();
  //console.console.log(result);
  res.send(result);
});
app.listen(3000,()=>{
  console.log('server is running on port 3000');

});
