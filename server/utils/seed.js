import dotenv from 'dotenv'
dotenv.config()
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const streams = [
  { name: 'Computer Science', code: 'CS', color: '#6366F1', icon: '💻', description: 'Computer Science & Engineering' },
  { name: 'Information Technology', code: 'IT', color: '#8B5CF6', icon: '🌐', description: 'Information Technology' },
  { name: 'Mechanical', code: 'ME', color: '#EC4899', icon: '⚙️', description: 'Mechanical Engineering' },
  { name: 'Electronics', code: 'EC', color: '#10B981', icon: '🔌', description: 'Electronics & Communication' },
  { name: 'Civil', code: 'CE', color: '#F59E0B', icon: '🏗️', description: 'Civil Engineering' }
]

const seed = async () => {
  console.log('🌱 Seeding Supabase database...')

  try {
    // 1. Create streams
    console.log('Creating streams...')
    const { data: createdStreams, error: streamErr } = await supabase.from('streams').upsert(streams, { onConflict: 'code' }).select()
    if (streamErr) throw streamErr
    console.log(`  ✅ ${createdStreams.length} streams`)

    // 2. Create admin user
    console.log('Creating admin...')
    const { data: adminAuth, error: adminErr } = await supabase.auth.admin.createUser({
      email: 'admin@edutrack.com', password: 'Admin@123', email_confirm: true,
      user_metadata: { name: 'Admin', role: 'admin' }
    })
    if (adminErr && !adminErr.message.includes('already')) throw adminErr
    if (adminAuth?.user) {
      await supabase.from('profiles').update({ name: 'Admin', role: 'admin' }).eq('id', adminAuth.user.id)
      console.log('  ✅ Admin: admin@edutrack.com / Admin@123')
    }

    // 3. Create faculty
    console.log('Creating faculty...')
    const facultyData = [
      { name: 'Dr. Sharma', email: 'faculty1@edutrack.com', dept: 'Computer Science' },
      { name: 'Prof. Patel', email: 'faculty2@edutrack.com', dept: 'Information Technology' },
      { name: 'Dr. Kumar', email: 'faculty3@edutrack.com', dept: 'Electronics' }
    ]

    const facultyIds = []
    for (const f of facultyData) {
      const { data: authData, error: fErr } = await supabase.auth.admin.createUser({
        email: f.email, password: 'Faculty@123', email_confirm: true,
        user_metadata: { name: f.name, role: 'faculty' }
      })
      if (fErr && !fErr.message.includes('already')) { console.log(`  ⚠️ ${f.email}: ${fErr.message}`); continue }
      if (authData?.user) {
        await supabase.from('profiles').update({ name: f.name, role: 'faculty' }).eq('id', authData.user.id)
        const { data: fac } = await supabase.from('faculty').insert({ user_id: authData.user.id, department: f.dept }).select().single()
        if (fac) facultyIds.push(fac.id)
      }
    }
    console.log(`  ✅ ${facultyIds.length} faculty members`)

    // 4. Assign faculty to streams
    if (facultyIds.length > 0 && createdStreams.length > 0) {
      const sfPairs = createdStreams.slice(0, facultyIds.length).map((s, i) => ({
        stream_id: s.id, faculty_id: facultyIds[i]
      }))
      await supabase.from('stream_faculty').upsert(sfPairs, { onConflict: 'stream_id,faculty_id' })
    }

    // 5. Create students
    console.log('Creating students...')
    const studentNames = [
      'Aarav Mehta', 'Priya Singh', 'Rohan Desai', 'Ananya Iyer', 'Karan Gupta',
      'Sneha Reddy', 'Arjun Nair', 'Divya Sharma', 'Rahul Verma', 'Meera Joshi',
      'Varun Kapoor', 'Ishita Rao', 'Aditya Pandey', 'Kavya Mishra', 'Nikhil Soni'
    ]

    const studentIds = []
    for (let i = 0; i < studentNames.length; i++) {
      const email = `student${i + 1}@edutrack.com`
      const rollNo = `S${String(2024001 + i)}`
      const streamIdx = i % createdStreams.length

      const { data: authData, error: sErr } = await supabase.auth.admin.createUser({
        email, password: 'Student@123', email_confirm: true,
        user_metadata: { name: studentNames[i], role: 'student' }
      })
      if (sErr && !sErr.message.includes('already')) { console.log(`  ⚠️ ${email}: ${sErr.message}`); continue }
      if (authData?.user) {
        await supabase.from('profiles').update({ name: studentNames[i], role: 'student' }).eq('id', authData.user.id)
        const { data: stu } = await supabase.from('students').insert({
          user_id: authData.user.id,
          roll_number: rollNo,
          stream_id: createdStreams[streamIdx].id,
          batch: '2024',
          current_streak: Math.floor(Math.random() * 15),
          total_submissions: Math.floor(Math.random() * 30) + 5
        }).select().single()
        if (stu) studentIds.push(stu)
      }
    }
    console.log(`  ✅ ${studentIds.length} students`)

    // 6. Create submissions
    console.log('Creating submissions...')
    const titles = [
      'Daily coding practice — arrays', 'Data structures assignment', 'React component library',
      'Machine learning research paper', 'Database normalization exercise', 'API integration project',
      'Operating systems — process scheduling', 'Web development portfolio', 'Network security analysis',
      'Mobile app UI mockup', 'Algorithms optimization', 'Cloud computing setup'
    ]
    const statuses = ['submitted', 'reviewed', 'approved', 'needs_improvement']

    let subCount = 0
    for (const stu of studentIds) {
      const numSubs = Math.floor(Math.random() * 5) + 2
      for (let j = 0; j < numSubs; j++) {
        const daysAgo = Math.floor(Math.random() * 30)
        const subDate = new Date()
        subDate.setDate(subDate.getDate() - daysAgo)

        await supabase.from('submissions').insert({
          student_id: stu.id,
          stream_id: stu.stream_id,
          title: titles[Math.floor(Math.random() * titles.length)],
          description: 'Completed as per today\'s assignment requirements.',
          status: statuses[Math.floor(Math.random() * statuses.length)],
          ai_score: Math.floor(Math.random() * 40) + 60,
          ai_analyzed: Math.random() > 0.3,
          submission_date: subDate.toISOString(),
          files: []
        })
        subCount++
      }
    }
    console.log(`  ✅ ${subCount} submissions`)

    console.log('\n🎉 Seed complete!')
    console.log('Login credentials:')
    console.log('  Admin:   admin@edutrack.com / Admin@123')
    console.log('  Faculty: faculty1@edutrack.com / Faculty@123')
    console.log('  Student: student1@edutrack.com / Student@123')
  } catch (error) {
    console.error('❌ Seed error:', error.message)
  }
  process.exit(0)
}

seed()
