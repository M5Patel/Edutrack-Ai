import supabase from '../config/supabase.js'

const toCamel = (str) => str.replace(/([-_][a-z])/ig, ($1) => $1.toUpperCase().replace('-', '').replace('_', ''))

export const keysToCamel = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(v => keysToCamel(v));
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key === '_id' ? '_id' : toCamel(key);
      result[camelKey] = keysToCamel(obj[key]);
      return result;
    }, {});
  }
  return obj;
}

// Pagination helper
export const getPagination = (query) => {
  const page = parseInt(query.page) || 1
  const limit = parseInt(query.limit) || 10
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

// Format API response
export const formatResponse = (data, message = 'Success', meta = {}) => {
  const camelData = (data !== null && typeof data === 'object') ? keysToCamel(data) : data;
  return {
    success: true,
    message,
    data: camelData,
    ...meta
  };
}

// Start of day
export const startOfDay = (date = new Date()) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

// End of day
export const endOfDay = (date = new Date()) => {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

// Start of week
export const startOfWeek = () => {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  d.setHours(0, 0, 0, 0)
  return d
}

// Create audit log
export const createAuditLog = async ({ userId, action, entity, entityId, details, ipAddress }) => {
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      entity,
      entity_id: entityId,
      details: details || null,
      ip_address: ipAddress || null
    })
  } catch (error) {
    console.error('Audit log error:', error.message)
  }
}
