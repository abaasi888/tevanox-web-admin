import React, { useState, useEffect } from 'react'
import { ticketsApi } from '../api/tickets'
import toast from 'react-hot-toast'
import './SupportTickets.css'

const SupportTickets = () => {
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTickets()
  }, [statusFilter])

  const loadTickets = async () => {
    try {
      const response = await ticketsApi.getAll({ status: statusFilter !== 'all' ? statusFilter : undefined })
      setTickets(response.data.tickets || [])
    } catch (error) {
      toast.error('Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }

  const loadTicketDetails = async (ticketId) => {
    try {
      const response = await ticketsApi.getOne(ticketId)
      setSelectedTicket(response.data)
    } catch (error) {
      toast.error('Failed to load ticket details')
    }
  }

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedTicket) return

    try {
      await ticketsApi.reply(selectedTicket.id, replyMessage)
      toast.success('Reply sent')
      setReplyMessage('')
      loadTicketDetails(selectedTicket.id)
      loadTickets()
    } catch (error) {
      toast.error('Failed to send reply')
    }
  }

  const updateStatus = async (ticketId, status) => {
    try {
      await ticketsApi.update(ticketId, { status })
      toast.success(`Ticket marked as ${status}`)
      loadTickets()
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status })
      }
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const assignTicket = async (ticketId, employeeId) => {
    try {
      await ticketsApi.assign(ticketId, employeeId)
      toast.success('Ticket assigned')
      loadTickets()
      loadTicketDetails(ticketId)
    } catch (error) {
      toast.error('Failed to assign ticket')
    }
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      case 'low': return 'priority-low'
      default: return ''
    }
  }

  if (loading) {
    return <div className="loading-spinner">Loading tickets...</div>
  }

  return (
    <div className="support-tickets">
      <h1 className="page-title">Support Tickets</h1>

      <div className="ticket-filters">
        <button className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>
          All
        </button>
        <button className={`filter-btn ${statusFilter === 'open' ? 'active' : ''}`} onClick={() => setStatusFilter('open')}>
          Open
        </button>
        <button className={`filter-btn ${statusFilter === 'in-progress' ? 'active' : ''}`} onClick={() => setStatusFilter('in-progress')}>
          In Progress
        </button>
        <button className={`filter-btn ${statusFilter === 'closed' ? 'active' : ''}`} onClick={() => setStatusFilter('closed')}>
          Closed
        </button>
      </div>

      <div className="tickets-layout">
        <div className="tickets-list">
          {tickets.map(ticket => (
            <div
              key={ticket.id}
              className={`ticket-item ${selectedTicket?.id === ticket.id ? 'active' : ''}`}
              onClick={() => loadTicketDetails(ticket.id)}
            >
              <div className="ticket-subject">{ticket.subject}</div>
              <div className="ticket-meta">
                <span>{ticket.userName}</span>
                <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                  {ticket.priority}
                </span>
                <span className={`status-badge ${ticket.status}`}>{ticket.status}</span>
              </div>
              <div className="ticket-date">{new Date(ticket.createdAt).toLocaleDateString()}</div>
            </div>
          ))}
          {tickets.length === 0 && (
            <div className="no-tickets">No tickets found</div>
          )}
        </div>

        <div className="ticket-detail">
          {selectedTicket ? (
            <>
              <div className="ticket-detail-header">
                <h3>{selectedTicket.subject}</h3>
                <div className="ticket-actions">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => updateStatus(selectedTicket.id, e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
              <div className="ticket-info">
                <p><strong>From:</strong> {selectedTicket.userName} ({selectedTicket.userEmail})</p>
                <p><strong>Priority:</strong> <span className={`priority-badge ${getPriorityClass(selectedTicket.priority)}`}>{selectedTicket.priority}</span></p>
                <p><strong>Created:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</p>
              </div>
              <div className="ticket-messages">
                {selectedTicket.messages?.map((msg, idx) => (
                  <div key={idx} className={`message ${msg.from}`}>
                    <div className="message-bubble">
                      <strong>{msg.from === 'admin' ? 'Support Team' : selectedTicket.userName}</strong>
                      <p>{msg.message}</p>
                      <small>{new Date(msg.createdAt).toLocaleString()}</small>
                    </div>
                  </div>
                ))}
              </div>
              {selectedTicket.status !== 'closed' && (
                <div className="ticket-reply">
                  <textarea
                    placeholder="Type your reply..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows="3"
                  />
                  <button onClick={sendReply}>Send Reply</button>
                </div>
              )}
            </>
          ) : (
            <div className="no-ticket-selected">
              <p>Select a ticket to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupportTickets