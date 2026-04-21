//ไฟท์เชื่อมต่อกับsupabase
import { createClient } from '@supabase/supabase-js'

//ตั้งค่าการเชื่อมต่อกับ supabase ใช้ key ใน .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

//สร้าง instance ของ supabase client จะได้เชื่อมไปยัง supabase
const supabase = createClient(supabaseUrl, supabaseKey)

//ส่งออก instance ของ supabase client เพื่อให้สามารถนำไปใช้ในไฟล์อื่นๆได้
export default supabase