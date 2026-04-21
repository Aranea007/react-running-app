import React from 'react'
import RunningSAU from './../components/RunningSAU'
import run from './../assets/run.png'
import { useState } from 'react'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  //เรียกใช้ useNavigate
  const navigate = useNavigate()
  //สร้างstate เพื่อเก็บ secure code
  const [secureCode, setSecureCode] = useState('')
  // ฟังก์ชั่นตรวจสอบ secure code แล้วไปยังหน้า showallrun
  const handleAccess = () => {
    //Validate UI
    //ตรวจว่า secure codeว่างไหม
    if (secureCode === '') {
      Swal.fire({
        icon: 'error',
        title: 'Secure codeห้ามเว้นว่าง',
        text: 'กรุณากรอก Secure code',
      })
      return
    }

    //ตรวจว่า secure code ถูกต้องไหม
    if (secureCode.toUpperCase() === 'SAU') {
      //ไปหน้า showallrun
      navigate('/showallrun')
      //secure codeไม่ถูกต้อง
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถเข้าใช้งานได้',
        text: 'Secure code ไม่ถูกต้อง',
      })
    }
}

    return (
      <>
        {/*หน้าหลัก*/}
        <div className='w-3/5 mx-auto flex flex-col items-center
    border border-gray-300 border-t-0 rounded p-10 mt-30 shadow-2xl'>
          {/*ตัวอักษร*/}
          <div>
            <p className='text-2xl mt-5 font-bold text-blue-600'>
              Running APP (Supabase)
            </p>
            <p className='flex justify-center text-2xl mt-2 font-bold text-blue-600 '>
              วิ่งกันเถอะ
            </p>
          </div>

          {/*รูปlogo*/}
          <img src={run} alt="logo" className='w-30 mt-5' />

          {/*กล่อง Secure code*/}
          <input value={secureCode}
            onChange={(e) => setSecureCode(e.target.value)}
            type="text" placeholder='Enter secure code'
            className='w-full h-[40px] border border-gray-300 rounded mt-10 p-2' />

          {/* ปุ่มกด */}
          <button onClick={handleAccess}
            className='w-full h-[40px] bg-blue-600 text-white rounded mt-5
        hover:bg-blue-700 cursor-pointer'>เข้าใช้งาน</button>
        </div>

        {/*RunningSAU*/}
        <RunningSAU />
      </>
    )
  }
