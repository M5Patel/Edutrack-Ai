import supabase from '../config/supabase.js'

export const verifyToken = async (req, res, next) => {
  try {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' })
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' })
    }

    // Get profile from our profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return res.status(401).json({ success: false, message: 'User profile not found' })
    }

    if (!profile.is_active) {
      return res.status(403).json({ success: false, message: 'Account deactivated' })
    }

    // Attach user info to request
    req.user = {
      _id: profile.id,
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      avatar: profile.avatar,
      is_active: profile.is_active
    }

    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized' })
  }
}
