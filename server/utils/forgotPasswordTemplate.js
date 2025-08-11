const forgotPasswordTemplate=({name,otp})=>{
    return`
    <div>
    <p> Dear,${name}</p>
    <p>you're  requested a password reset.Please use the following OTP code to reset your password.</p>
    <div style=background-color:yellow;font-size:20px>
    ${otp}
    </div>
    <p>This otp is valid for 1 hour only.Enter this otp in the quickacart website to proceed with resetting your password.</p>
    <br/>
    </br>
    <p>Thank you for using quickcart</p>
    </div>
    `
}

export default forgotPasswordTemplate