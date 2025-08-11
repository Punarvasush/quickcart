import React from 'react'
import { FaFacebook } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaLinkedin } from "react-icons/fa";
const Footer = () => {
  return (
    <footer className='border-t'>
        <div className='container mx-auto p-4 justify-center flex flex-col gap-2 lg:flex-row lg:justify-between'>
            <p>©all right reserved 2025</p>
        </div>
        <div className='flex justify-center gap-4 p-4'>
         <a href='' className='hover:text-primary-100'>
            <FaFacebook />
        </a>
         <a href='' className='hover:text-primary-100'>
            <FaInstagram />
         </a>
         <a href='' className='hover:text-primary-100'>    
             <FaLinkedin />
         </a>
      </div>
    </footer>
  )
}

export default Footer
