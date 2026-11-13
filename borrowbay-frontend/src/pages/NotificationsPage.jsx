import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'
import { useAuth } from '../context/AuthContext'

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { isLoggedIn, user } = useAuth()

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications/user/${user.id}`)
      // Sort newest first
      const sorted = res.data.sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt))
      setNotifications(sorted)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkRead = async (notifId) => {
    try {
      await api.patch(`/notifications/${notifId}/mark-read`)
      setNotifications(prev =>
        prev.map(n => n.id === notifId ? {...n, isRead: true} : n)
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.isRead)
      await Promise.all(
        unread.map(n => api.patch(`/notifications/${n.id}/mark-read`))
      )
      setNotifications(prev => prev.map(n => ({...n, isRead: true})))
    } catch (err) {
      console.error(err)
    }
  }

  const handleClear = async () => {
    try {
      await api.delete(`/notifications/user/${user.id}/clear`)
      setNotifications([])
    } catch (err) {
      console.error(err)
    }
  }

  const getNotifIcon = (type) => {
    const icons = {
      ORDER_CONFIRMED:   '✅',
      DELIVERY_ASSIGNED: '🚚',
      ITEM_DELIVERED:    '📦',
      RETURN_INITIATED:  '↩️',
      REFUND_PROCESSED:  '💰',
      OFFER:             '🎁',
      GENERAL:           '🔔',
    }
    return icons[type] || '🔔'
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) return (
    <div className="page-container">
      <div className="animate-pulse space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="page-container animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">🔔 Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-gray-500 mt-1 text-sm">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="btn-secondary text-sm py-2">
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClear}
              className="text-red-500 text-sm hover:text-red-600
                         transition-colors px-3 py-2">
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔔</p>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No notifications yet
          </h3>
          <p className="text-gray-400">
            We'll notify you about orders, deliveries and more
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif, i) => (
            <div
              key={notif.id}
              onClick={() => !notif.isRead && handleMarkRead(notif.id)}
              className={`card p-4 flex items-start gap-4 cursor-pointer
                          animate-slide-up transition-all
                          ${!notif.isRead
                            ? 'border-l-4 border-primary-400 bg-primary-50/30'
                            : 'opacity-75'}`}
              style={{ animationDelay: `${i * 0.05}s` }}>

              {/* Icon */}
              <div className={`w-10 h-10 rounded-full flex items-center
                               justify-center text-xl flex-shrink-0
                               ${!notif.isRead
                                 ? 'bg-primary-100'
                                 : 'bg-gray-100'}`}>
                {getNotifIcon(notif.type)}
              </div>

              {/* Content */}
              <div className="flex-1">
                <p className={`text-sm leading-relaxed
                               ${!notif.isRead
                                 ? 'text-gray-900 font-medium'
                                 : 'text-gray-600'}`}>
                  {notif.message}
                </p>
                {notif.createdAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                )}
              </div>

              {/* Unread dot */}
              {!notif.isRead && (
                <div className="w-2.5 h-2.5 bg-primary-500 rounded-full
                                flex-shrink-0 mt-1" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}