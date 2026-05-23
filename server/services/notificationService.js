import supabase from '../config/supabase.js'

export const createNotification = async (data, io) => {
  try {
    const { data: notification, error } = await supabase.from('notifications').insert({
      recipient_id: data.recipient_id,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link,
      icon: data.icon || '🔔'
    }).select().single()

    if (error) throw error

    if (io && data.recipient_id) {
      io.to(`user_${data.recipient_id}`).emit('new_notification', { ...notification, _id: notification.id })
    }
    return notification
  } catch (error) {
    console.error('Notification error:', error.message)
  }
}
