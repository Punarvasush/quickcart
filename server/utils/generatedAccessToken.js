import  jwt from "jsonwebtoken";
const geratedAccessToken = async(userId) => {
    const token=await jwt.sign({id:userId},
        process.env.SECRET_KEY_ACCESS_TOKEN,
        {expiresIn:'5h'}
    )
    return token
}
export default geratedAccessToken