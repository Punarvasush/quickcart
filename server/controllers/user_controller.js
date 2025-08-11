
import UserModel from "../models/user_model.js";
import sendEmail from "../config/sendEmail.js";
import bcrypt from "bcryptjs";
import verifyEmailTemplate from "../utils/verifyEmailTemplate.js";
import generatedAccessToken from "../utils/generatedAccessToken.js";
import generatedRefreshToken from "../utils/generatedRefreshToken.js";
import jwt from "jsonwebtoken";
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";
import forgotPasswordTemplate from "../utils/forgotPasswordTemplate.js";
import generateOtp from "../utils/generateOtp.js";
export async function registerUserController(request,response){
    try{
        const {name,email,password}=request.body
        if(!name||!email||!password){
            return response.starus(400).json({
                message:"provide email,name,password",
                error:true,
                success:falses
            })
            } 
            const user=await UserModel.findOne({email})
                if(user){
                    return response.json({
                        message:"already registered",
                        error:true,
                        success:false
                    })
                }
            const salt =await bcrypt.genSalt(10)
            const hashPassword =await bcrypt.hash(password,salt)
            const payload={
                name,
                email,
                password:hashPassword
            }
            const newUser=await UserModel(payload)
            const save =await newUser.save()
            
            const VerifyEmailUrl=`${process.env.FRONTEND_URL}/verify-email?code${save._id}`

             const verifyEmail = await sendEmail({
                sendTo:email,
                subject:"verify email from quickcart",
                html: verifyEmailTemplate({
                    name,
                    url:VerifyEmailUrl
                })
            })

            return response.json({
                message:"user register successfully",
                error:false,
                success:true,
                data:save
            })
        }catch(error){
                return response.status(500).json({
                    message:error.message||error,
                    error:true,
                    success:false
                })
            }
        }
export async function verifyEmailcontroller(request,response){
    try{
        const{code}=request.body
        const user=await UserModel.findOne({_id:code})
        if(!user){
            return response.status(400).json({
                message:"invalid code",
                error:true,
                success:false
            })
        }
        const updateUser =await UserModel.updateOne({_id:code},{
            verify_email:true
        })
        return response.json({
            message:"verify email done",
            success:true,
            error:false
            
        })
    }catch(error){
      return response.status(500).json({
        message:error.message||error,
        error:true,
        success:true
      })
    }
};
export async function loginController(request,response){
            try{
                const{email,password}=request.body
                const user=await UserModel.findOne({email})
                if(!user){
                    return response.status(400).json({
                        message:"user not register",
                        error:true,
                        success:false
                    })
                }
            if(user.status!=="Active"){
                return response.status(400).json({
                    message:"contact to Admin",
                    error:true,
                    success:false
            })
      }
             const checkPassword= await bcrypt.compare(password,user.password)
               if(!checkPassword){
                 return response.status(400).json({
                     message:"check your passwoed",
                     error:true,
                    success:false
                        })
                    }
            const accesstoken=await generatedAccessToken(user._id)
            const refreshToken=await generatedRefreshToken(user._id)
              const  updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            last_login_date : new Date()
        })

            const cookiesOption={
                httpOnly:true,
                secure:true,
                sameSite:"None"
             }
            response.cookie('accessToken',accesstoken,cookiesOption)
            response.cookie('refreshToken',refreshToken,cookiesOption)
            return response.json({
                    message:"Login successfully",
                    error:false,
                    success:true,
                    data:{
                       accesstoken,
                       refreshToken
                   }}
                   );
            }catch(error){
                 return response.status(500).json({
                 message:error.message||error,
                 error:true,
                success:false
            })

         }
};
export async function logoutController(request,response){
    try{
        const userid=request.userId
        const cookiesOption={
            httpOnly:true,
            secure:true,
            sameSite:"None"
        }
        response.clearCookie("accessToken",cookiesOption)
        response.clearCookie("refreshToken",cookiesOption)
        const removeRefreshToken =await UserModel.findByIdAndUpdate(userid,{
            refresh_token:""
        })
        return response.json({
            message:"Logout successfull",
            error:false,
            success:true

        })
    }catch(error){
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
    
    }
};

export async function uploadAvatar(request,response){
    try{
        const userId=request.userId
        const image=request.file
         const upload=await uploadImageCloudinary(image)
         
         const updateUser=await UserModel.findByIdAndUpdate(userId,{
            avatar:upload.url
         })

         return response.json({
            message:"upload profile",
            date:{
                _id:userId,
                avatar:upload.url
            }
                 })
    }catch(error){
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
    }   
}
export async function updateUserDetails(request,response){
    try{
      const userId=request.userId
      const {name,email,mobile,password}=request.body
      let hashPassword=""
      if(password){
        const salt=await bcryptjs.genSalt(10)
        hashPassword=await bcryptjs.hash(password,salt)
      }
      const updateUser=await UserModel.updateOne({_id : userId},{
        ...(name&&{name:name}),
        ...(email&& {email:email}),
        ...(mobile&& {mobile:mobile}),
        ...(password&& {password:hashPassword})
      })
      return response.json({
        message:"updated user successfully",
        error:false,
        success:true,
        data:updateUser
      })}catch(error){
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
    }
}

export async function forgotPasswordController(request,response){
    try{
        const {email}=request.body
        const user=await UserModel.findOne({email})
        if(!user){
            return response.status(400).json({
                message:"email not available",
                error:true,
                success:false
            })
        }
        const otp=generateOtp()
        const expireTime=new Date()+60*60*1000 //1hr
        const update =await UserModel.findByIdAndUpdate(user._id,{
            forgot_password_otp:otp,
            forgot_password_expiry:new Date(expireTime).toISOString()

            })
            await sendEmail({
                sendTo:email,
                subject:"forgot password from quickcart",
                html:forgotPasswordTemplate({
                    name:user.name,
                    otp:otp
                })
            })
            return response.json({
                message:"check  your email",
                error:false,
                success:true,
            })
    }catch(error){
        return response.status(500).json({
            message:error.message||error,
            error:true,
            success:false
        })
    }
}

export async function verifyForgotPasswordOtp(request,response){
    try {
        const { email , otp }  = request.body

        if(!email || !otp){
            return response.status(400).json({
                message : "Provide required field email, otp.",
                error : true,
                success : false
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "Email not available",
                error : true,
                success : false
            })
        }

        const currentTime = new Date().toISOString()

        if(user.forgot_password_expiry < currentTime  ){
            return response.status(400).json({
                message : "Otp is expired",
                error : true,
                success : false
            })
        }

        if(otp !== user.forgot_password_otp){
            return response.status(400).json({
                message : "Invalid otp",
                error : true,
                success : false
            })
        }

        //if otp is not expired
        //otp === user.forgot_password_otp

        const updateUser = await UserModel.findByIdAndUpdate(user?._id,{
            forgot_password_otp : "",
            forgot_password_expiry : ""
        })
        
        return response.json({
            message : "Verify otp successfully",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function resetpassword(request,response){
    try {
        const { email , newPassword, confirmPassword } = request.body 

        if(!email || !newPassword || !confirmPassword){
            return response.status(400).json({
                message : "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await UserModel.findOne({ email })

        if(!user){
            return response.status(400).json({
                message : "Email is not available",
                error : true,
                success : false
            })
        }

        if(newPassword !== confirmPassword){
            return response.status(400).json({
                message : "newPassword and confirmPassword must be same.",
                error : true,
                success : false,
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(newPassword,salt)

        const update = await UserModel.findOneAndUpdate(user._id,{
            password : hashPassword
        })

        return response.json({
            message : "Password updated successfully.",
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function refreshToken(request,response){
    try {
        const refreshToken = request.cookies.refreshToken || request?.headers?.authorization?.split(" ")[1]  /// [ Bearer token]

        if(!refreshToken){
            return response.status(401).json({
                message : "Invalid token",
                error  : true,
                success : false
            })
        }

        const verifyToken = await jwt.verify(refreshToken,process.env.SECRET_KEY_REFRESH_TOKEN)

        if(!verifyToken){
            return response.status(401).json({
                message : "token is expired",
                error : true,
                success : false
            })
        }

        const userId = verifyToken?._id

        const newAccessToken = await generatedAccessToken(userId)

        const cookiesOption = {
            httpOnly : true,
            secure : true,
            sameSite : "None"
        }

        response.cookie('accessToken',newAccessToken,cookiesOption)

        return response.json({
            message : "New Access token generated",
            error : false,
            success : true,
            data : {
                accessToken : newAccessToken
            }
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export async function userDetails(request,response){
    try {
        const userId  = request.userId

        console.log(userId)

        const user = await UserModel.findById(userId).select('-password -refresh_token')

        return response.json({
            message : 'user details',
            data : user,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : "Something is wrong",
            error : true,
            success : false
        })
    }
}
export async function verifyEmailController(request,response){
    try {
        const { code } = request.body

        const user = await UserModel.findOne({ _id : code})

        if(!user){
            return response.status(400).json({
                message : "Invalid code",
                error : true,
                success : false
            })
        }

        const updateUser = await UserModel.updateOne({ _id : code },{
            verify_email : true
        })

        return response.json({
            message : "Verify email done",
            success : true,
            error : false
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : true
        })
    }
}
