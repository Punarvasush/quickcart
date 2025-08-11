const verifyEmailTemplate=({name,url})=>{
    return `
    <p>Dear ${name},</p>
    <p>Thank you for registering quickcart.</p>
    <p><a href="${url}">Verify Email</a></p>
    verify Email
    </a>
    `
}
export default verifyEmailTemplate