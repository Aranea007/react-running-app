import React from 'react'
import RunningSAU from './../components/RunningSAU'
import run from './../assets/run.png'
import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import supabase from '../services/supabaseClient'

export default function AddRun() {
  //สร้างstate เพื่อเก็บข้อมูล
  const [runDate, setRunDate] = useState('')
  const [runTime, setRunTime] = useState('')
  const [runDistance, setRunDistance] = useState('')
  const [runLocation, setRunLocation] = useState('')
  const [runImageUrl, setRunImageUrl] = useState('')//สร้างเพื่อเก็บที่อยู่ของรูป
  const [runImageFile, setRunImageFile] = useState('')//สร้างเพื่อเก็บไฟล์รูป

  //ดึงข้อมูลรายการวิ่งมาแสดงเพื่อแก้ไข
  const { id } = useParams()
  useEffect(() => {
    //ดึงข้อมูลจาก supabase
    const fetchRun = async () => {
      const { data, error } = await supabase.from('running_tb')
        .select('*')
        .eq('id', id)//เงื่อนไขในการดึงข้อมูล ซึ่งดึงมาจาก run.id
        .single()
      if (error) {
        alert('พบปัญหาในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง')
        return
      }

      //เก็บข้อมูลที่ดึงมาไว้ในตัวแปร
      setRunDate(data.run_date)
      setRunTime(data.run_time)
      setRunDistance(data.run_distance)
      setRunLocation(data.run_location)
      setRunImageUrl(data.run_image_url)
    }

    fetchRun()
  }, [])

  //สร้างฟังก์ชั่นสำหรับจัดการเลือกไฟล์รูปภาพ
  //เมื่อเลือกรูป จะถูกส่งมาเก็บไว้ที่ e 
  const handleImageChange = (e) => {
    const file = e.target.files[0] // ดึงไฟล์รูปที่เลือกมาเก็บไว้ใน file
    //แล้วเอาข้อมูลใน e มาเก็บไว้ในตัวแปรที่ชื่อ file แล้วค่อยส่งให้กับstate ที่สร้างไว้ทั้ง runImageFile,runImageUrl
    if (file) {
      setRunImageFile(file) //เก็บไฟล์รูปที่เลือกไว้ใน state
      const imageUrl = URL.createObjectURL(file) //สร้าง URL จากไฟล์รูปที่เลือกเอาไว้
      setRunImageUrl(imageUrl) // เก็บ URL ของไฟล์รูปที่เลือกไว้ใน state
    }
  }

  //สร้างฟังก์ชั่นสําหรับเพิ่มข้อมูล
  const handleSaveClick = async () => {
    //validate UI - ตรวจสอบว่ามีข้อมูลในช่องว่างไหม
    if (!runDate || !runTime || !runDistance || !runLocation) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน')
      return //ต้องมีเพราะอันนี้มันถือว่าเป็นerror จะได้หยุดการทำงาน 
    }

    //ตรวจสอบว่ามีการแก้ไขรูปหรือไม่
    if (runImageFile) {
      //ถ้ามีการแก้ไขรูป จะต้องลบรูปเก่าก่อน ซึ่งอยู่ใน food_bk
      //ลบโดยดูจากที่อยู่ของไฟท์แล้วลบ ให้เหลทอแค่ชื่อรูป
      const filename = runImageUrl.split('/').pop()
      const { error: deleteError } = await supabase.storage.from('running_bk')
        .remove([filename])

      if (deleteError) {
        alert('พบปัญหาในการลบไฟท์ข้อมูล กรุณาลองอีกครั้ง')
        return
      }

      //upload ไฟล์ไปยัง uspabase
      //ชื่อรูปต้องตั้งใหม่ด้วย และเพื่อกันไม่ให้ซ้ำเลยเอาผูกกับ date.now จะการันตีว่าชื่อไม่ซ้ำแน่นอน 
      const ImangeNameWithDate = `${Date.now()}_${runImageFile.name}` //``ใช้เพราะใช้ค่าที่ต่างกันสองตัว
      const { error: uploadError } = await supabase.storage
                                                    .from('running_bk')
                                                    .upload(ImangeNameWithDate, runImageFile) //อัพชื่อรูป / อัพไฟล์รูป

      //ดึงที่อยู่ของรูปมาเก็บไว้ในตัวแปร เพื่อบันทึกไปยังฐานข้อมูลsupabase เหมือนตอนที่เราcopy urlมาใส่เอง
      //ตัวแปรที่อยู่รูป
      let run_image_url = ''
      const { data } = supabase.storage.from('running_bk')
        .getPublicUrl(ImangeNameWithDate)//ดึงที่อยู่ของไฟท์มาไว้ในตัวแปรที่ชื่อว่า data
      run_image_url = data.publicUrl //เอาข้อมูลที่ดึงมาไว้ในตัวแปรที่ชื่อว่า run_image_url

      //บันทึกข้อมูลไปยัง supabase
      const { error: updateError } = await supabase.from('running_tb')
        //แก้จากinsertเป็นupdate
                                                    .update({
                                                    run_date: runDate,
                                                    run_time: runTime,
                                                    run_distance: runDistance,
                                                    run_location: runLocation,
                                                    run_image_url: run_image_url
        })
        //แล้วเพิ่มเงื่อนไขคือ id เพื่อบอกตำแหน่งที่จะบันทึกแก้ไข
                                                    .eq('id', id)//เงื่อนไขในการดึงข้อมูล ซึ่งดึงมาจาก run.id

      if(updateError) {
        alert('พบปัญหาในการบันทึกข้อมูล กรุณาลองอีกครั้ง')
        return
      }       

    } else {
      //ถ้าไม่มีการแก้ไขรูป ไม่ต้องลบรูปแล้วอัปโหลดรูปใหม่ไปเลย
      const { error: updateError } = await supabase.from('running_tb')
        //แก้จากinsertเป็นupdate
                                                    .update({
                                                    run_date: runDate,
                                                    run_time: runTime,
                                                    run_distance: runDistance,
                                                    run_location: runLocation,
        })
        //แล้วเพิ่มเงื่อนไขคือ id เพื่อบอกตำแหน่งที่จะบันทึกแก้ไข
                                                    .eq('id', id)//เงื่อนไขในการดึงข้อมูล ซึ่งดึงมาจาก run.id

      if(updateError) {
        alert('พบปัญหาในการบันทึกข้อมูล กรุณาลองอีกครั้ง')
        return
      }       
                   
    }
    //แสดงข้อความว่าบันทึกสำเร็จ
    alert('บันทึกข้อมูลเรียบร้อย')
    //ย้อนกลับไปหน้าแสดงการวิ่ง
    window.location.href = '/showallrun'  
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
            วิ่งกันเถอะ (แก้ไข)
          </p>
        </div>

        {/* ส่วนการเพิ่มข้อมูล */}
        <div className='mt-10 w-3/5 mx-auto border border-gray-300 rounded p-10'>

          {/* วันที่วิ่ง */}
          <label>วันที่วิ่ง</label>
          <input value={runDate} onChange={(e) => setRunDate(e.target.value)}
            type="text" className='w-full border border-gray-500 rounded p-2 mt-2 mb-2' placeholder=' เช่น 1 มกราคม 2569, 10 พฤษภาคม 2569' />

          {/*สถานที่วิ่ง*/}
          <label>สถานที่วิ่ง</label>
          <input value={runLocation} onChange={(e) => setRunLocation(e.target.value)}
            type="text" className='w-full border border-gray-500 rounded p-2 mt-2 mb-2' placeholder='เช่น สวนลุม,สวนจตุจักร' />

          {/* ระยะเวลาที่วิ่ง */}
          <label>ระยะที่วิ่ง(เมตร)</label>
          <input value={runDistance} onChange={(e) => setRunDistance(e.target.value)}
            type="number" className='w-full border border-gray-500 rounded p-2 mt-2 mb-2' placeholder=' เช่น 2000,5000' />

          {/* เวลาที่ใช้ในการวิ่ง */}
          <label>เวลาที่ใช้ในการวิ่ง(นาที)</label>
          <input value={runTime} onChange={(e) => setRunTime(e.target.value)}
            type="number" className='w-full border border-gray-500 rounded p-2 mt-2 mb-2' placeholder=' เช่น 30,60' />

          {/* เพิ่มรูป */}
          <div className='mt-2'>
            <label className='pr-4'>อัปโหลดรูป</label>
            <input onChange={handleImageChange}
              type='file' accept='image/*' id="select-image"
              className='w-full border border-gray-500 rounded p-2 mt-2 mb-2 hidden' />
            <label htmlFor="select-image" className='px-4 py-2 bg-blue-500 rounded text-white hover:bg-blue-600 cursor-pointer'>เลือกรูป</label>
          </div>

          {/* แสดงรูปที่เลือก */}
          {runImageUrl && (
            <img src={runImageUrl} alt="Selected" className='mt-4 h-30 border border-gray-500 rounded p-2 mt-2 mb-2' />
          )}

          {/* ปุ่มบันทึกแก้ไข */}
          <button onClick={handleSaveClick}
            className='w-full border border-gray-500 rounded p-2 mt-5 mb-2 bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'>
            บันทึกการวิ่ง</button>
        </div>

        {/* กลับไปหน้าการวิ่งทั้งหมด */}
        <Link to="/showallrun" className='mt-4 text-green-500 hover:text-green-600'
        >กลับไปหน้าการวิ่งทั้งหมด</Link>

      </div>

      {/*RunningSAU*/}
      <RunningSAU />
    </>
  )
}
