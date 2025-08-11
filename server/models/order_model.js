import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
    },
    orderId:{
        type:String,
        required:[true,"provide orderId"],
        unique:true
    },
    productId:{
        type:mongoose.Schema.ObjectId,
        ref:"product"
    }, 
     product_details:{
        name:String,
        image:Array
    },
    paymentId:{
        type:String,
        default:""
    },
    paymentstatus:{
        type:String,
        default:""
    },
    delivery_address:{
        type:mongoose.Schema.ObjectId,
        ref:"address"
    },
    subTotalAmt:{
        type:Number,
        default:null
    },
    totalAmt:{
        type:Number,
        default:null
    },
    invoice_receipt:{
        type:String,
        default:""  
    }
},{
   timestamps:true
})
const OrdertModel=mongoose.model("product",orderSchemaSchema)
export default orderModel