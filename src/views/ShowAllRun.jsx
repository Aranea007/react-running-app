import React from 'react'
import RunningSAU from './../components/RunningSAU'
import run from './../assets/run.png'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import supabase from './../services/supabaseClient'
import Swal from 'sweetalert2'

export default function Home() {
  //ตัวแปรstate ใช้ในการดึงข้อมูลในsupabase ตัวแปรประเภทstateต้องใช้ผ่าน setRunData ใข้ตรงๆไม่ได้
  const [runData, setRunData] = useState([])

  useEffect(() => {
    //ฟังก์ชั่นดึงข้อมูลในการวิ่งทั้งหมดจาก Supabase
    const fetchRun = async () => {
      //ดึงข้อมูลจาก supabase
      const { data, error } = await supabase.from('running_tb').select('*')

      //ตรวจสอบว่า errorไหม
      if (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถดึงข้อมูลการวิ่งได้ กรุณาลองใหม่อีกครั้ง',
        })

        return
      }

      //เมื่อไม่มีerror เอาข้อมูลเก็บไว้ในstate เพื่อจะดึงมาแสดงในตาราง
      setRunData(data)
    }
    //ฟังก์ชั่นเรียกใช้ข้อมูล
    fetchRun()
  }, [])


  //ฟังก์ชั่นลบข้อมูลในการวิ่ง และลบรูปที่อยู่ในrunning_bkด้วย
  const handleDeleteRun = async (id, run_image) => {
    //ถามยืนยันการลบข้อมูล
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบการวิ่งนี้?')) {
      //ลบข้อมูลในrunning_tb
      const { error: errorDelete } = await supabase.from('running_tb')
                                                    .delete()
                                                    .eq('id', id) //ลบข้อมูลในrunning_tb

      if (errorDelete) {
        alert('ไม่สามารถลบข้อมูลการวิ่งได้ กรุณาลองใหม่อีกครั้ง')
      }
      //ลบรูปในrunning_bk
      //เอาที่อยู่รูปมาตัดให้เหลือแค่ชื่อรูป
      const filename = run_image.split('/').pop()
      const { error: errorDeleteImage } = await supabase.storage.from('running_bk')
                                                        .remove([filename]) //ลบรูปในrunning_bk

      if (errorDeleteImage) {
        alert('ไม่สามารถลบรูปการวิ่งได้ กรุณาลองใหม่อีกครั้ง')
        return
      }

      //แจ้งว่าลบเรียบร้อยแล้ว
      alert('ลบข้อมูลการวิ่งเรียบร้อยแล้ว')

      //อัพเดตข้อมูล
      setRunData(runData.filter((run) => run.id !== id))
    }
  }
  return (
    <>
      {/*หน้าหลัก*/}
      <div className='w-3/5 mx-auto flex flex-col items-center
    border border-gray-300 border-t-0 rounded p-10 mt-30 shadow-2xl'>

        {/*รูปlogo*/}
        <img src={run} alt="logo" className='w-30 mt-5' />

        {/*ตัวอักษร*/}
        <div>
          <p className='text-2xl mt-5 font-bold text-blue-600'>
            Running APP (Supabase)
          </p>
          <p className='flex justify-center text-2xl mt-2 font-bold text-blue-600 '>
            วิ่งกันเถอะ
          </p>
        </div>

        {/* ปุ่มกด */}
        <div className='w-4/5 flex justify-end'>
          <Link to="/addrun" className='h-[40px] bg-blue-500 text-white rounded p-2 px-8
          hover:bg-blue-700 cursor-pointer'>เพิ่มการวิ่ง</Link>
        </div>

        {/* ดึงข้อมูลจาก supabase */}
        <div className='w-4/5 mt-5'>
          <table className='w-full border border-gray-300 text-sm'>
            <thead className='bg-gray-300'>
              <tr>
                <th className='border border-gray-500 p-2'>รูป</th>
                <th className='border border-gray-500 p-2'>วันที่วิ่ง</th>
                <th className='border border-gray-500 p-2'>สถานที่วิ่ง</th>
                <th className='border border-gray-500 p-2'>ระยะทางที่วิ่ง (เมตร)</th>
                <th className='border border-gray-500 p-2'>เวลาที่ใช้ในการวิ่ง(นาที)</th>
                <th className='border border-gray-500 p-2'>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {
                runData.map((run) => (
                  <tr key={run.id}>
                    <td className='border border-gray-500 p-2'>
                      <img src={run.run_image_url} alt="run" className='w-20 mx-auto' />
                      {/* {run.run_image_url} เขียนแบบนี้จะไม่แสดงรูป แต่เป็นurlเปล่าๆแทน
                      ใช้text-centerไม่ได้เพราะเป็นรูป*/}
                    </td>
                    <td className='border border-gray-500 p-2 text-center'>{run.run_date}</td>
                    <td className='border border-gray-500 p-2 text-center'>{run.run_location}</td>
                    <td className='border border-gray-500 p-2 text-center'>{run.run_distance}</td>
                    <td className='border border-gray-500 p-2 text-center'>{run.run_time}</td>
                    <td className='border border-gray-500 p-2 text-center '>
                      <Link to={`/updaterun/${run.id}`} className='text-blue-500 hover:text-blue-600 px-2'>[แก้ไข]</Link>
                      {''} {''}
                      <button onClick={() => handleDeleteRun(run.id, run.run_image_url)}//ส่งidกับ urlของ run
                        className='text-red-500 hover:text-red-600 cursor-pointer px-2'>
                        [ลบ]
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
        {/* ออกจากการใช้งาน */}
        <Link to="/" className='mt-4 text-blue-500 hover:text-blue-600'
        >ออกจากการใช้งาน</Link>
      </div>



      {/*RunningSAU*/}
      <RunningSAU />
    </>
  )
}