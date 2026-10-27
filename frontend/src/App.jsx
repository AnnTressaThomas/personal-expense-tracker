import { useState, useEffect } from 'react'

// Base URL for the backend API
const API_BASE_URL = 'http://localhost:5000/api'

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Other']

export default function App() {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(null)
  const [statusMessage, setStatusMessage] = useState(null) // { type: 'success' | 'error', text: '' }

  // Form State
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Food')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [editingId, setEditingId] = useState(null)
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Fetch expenses on initial mount
  useEffect(() => {
    fetchExpenses()
  }, [])

  const showNotification = (type, text) => {
    setStatusMessage({ type, text })
    setTimeout(() => {
      setStatusMessage(null)
    }, 4500)
  }

  // Fetch all expenses from backend
  const fetchExpenses = async () => {
    setLoading(true)
    setApiError(null)
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to fetch expenses from server')
      }

      setExpenses(result.data || [])
    } catch (err) {
      console.error('Fetch error:', err)
      setApiError(err.message || 'Cannot connect to backend server. Make sure it is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  // Frontend Form Validation
  const validateForm = () => {
    if (!title.trim()) {
      setFormError('Expense title cannot be empty.')
      return false
    }

    if (amount === '' || amount === null || amount === undefined) {
      setFormError('Amount is required.')
      return false
    }

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Amount must be a valid positive number greater than 0.')
      return false
    }

    if (!category) {
      setFormError('Please select a valid category.')
      return false
    }

    if (!date) {
      setFormError('Please select a valid date.')
      return false
    }

    setFormError('')
    return true
  }

  // Handle Add or Edit Submit
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const payload = {
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date
    }

    setSubmitting(true)
    try {
      const url = editingId
        ? `${API_BASE_URL}/expenses/${editingId}`
        : `${API_BASE_URL}/expenses`

      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save expense')
      }

      showNotification('success', editingId ? 'Expense updated successfully!' : 'Expense added successfully!')
      resetForm()
      await fetchExpenses()
    } catch (err) {
      console.error('Submit error:', err)
      showNotification('error', err.message || 'Error occurred while saving expense')
    } finally {
      setSubmitting(false)
    }
  }

  // Prepare form for editing
  const handleEditClick = (expense) => {
    setEditingId(expense._id)
    setTitle(expense.title)
    setAmount(expense.amount)
    setCategory(expense.category)
    // Format ISO date string to YYYY-MM-DD for date input
    const formattedDate = expense.date ? new Date(expense.date).toISOString().split('T')[0] : ''
    setDate(formattedDate)
    setFormError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Cancel edit mode
  const handleCancelEdit = () => {
    resetForm()
  }

  const resetForm = () => {
    setEditingId(null)
    setTitle('')
    setAmount('')
    setCategory('Food')
    setDate(new Date().toISOString().split('T')[0])
    setFormError('')
  }

  // Handle Delete with Confirmation
  const handleDelete = async (id, expenseTitle) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete "${expenseTitle}"?`)
    if (!isConfirmed) return

    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete expense')
      }

      showNotification('success', 'Expense deleted successfully!')
      // If currently editing this item, reset form
      if (editingId === id) {
        resetForm()
      }
      await fetchExpenses()
    } catch (err) {
      console.error('Delete error:', err)
      showNotification('error', err.message || 'Failed to delete expense')
    }
  }

  // Calculate total amount spent
  const totalAmount = expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(val)
  }

  // Format display date
  const formatDateDisplay = (dateString) => {
    if (!dateString) return '-'
    const d = new Date(dateString)
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="brand">
          <span className="brand-icon">💳</span>
          <h1>Personal Expense Tracker</h1>
        </div>
        <p className="subtitle">Track, budget, and manage your daily college & personal expenses</p>
      </header>

      {/* Alert / Notification banner */}
      {statusMessage && (
        <div className={`notification ${statusMessage.type}`}>
          <span>{statusMessage.type === 'success' ? '✓ ' : '⚠️ '} {statusMessage.text}</span>
          <button className="close-btn" onClick={() => setStatusMessage(null)}>×</button>
        </div>
      )}

      {apiError && (
        <div className="notification error">
          <span>⚠️ {apiError}</span>
          <button className="retry-btn" onClick={fetchExpenses}>Retry</button>
        </div>
      )}

      {/* Main Grid: Form on Left/Top, Summary + Table on Right/Bottom */}
      <div className="main-content">
        {/* Form Card */}
        <section className="card form-card">
          <div className="card-header">
            <h2>{editingId ? '✏️ Edit Expense' : '➕ Add Expense'}</h2>
            {editingId && <span className="badge editing">Editing Mode</span>}
          </div>

          {formError && <div className="inline-error">{formError}</div>}

          <form onSubmit={handleSubmit} className="expense-form" noValidate>
            <div className="form-group">
              <label htmlFor="title">Expense Title</label>
              <input
                id="title"
                type="text"
                placeholder="e.g., College Canteen Lunch, Books"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="amount">Amount (₹)</label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="e.g., 250"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting
                  ? (editingId ? 'Updating...' : 'Adding...')
                  : (editingId ? 'Update Expense' : 'Add Expense')}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        {/* Expenses List & Stats */}
        <section className="card list-card">
          {/* Summary Banner */}
          <div className="summary-banner">
            <div className="summary-stat">
              <span className="stat-label">Total Spent</span>
              <span className="stat-value">{formatCurrency(totalAmount)}</span>
            </div>
            <div className="summary-stat">
              <span className="stat-label">Total Transactions</span>
              <span className="stat-value secondary">{expenses.length}</span>
            </div>
          </div>

          <div className="table-header-row">
            <h2>Saved Expenses</h2>
            <button className="btn btn-refresh" onClick={fetchExpenses} title="Refresh list">
              🔄 Refresh
            </button>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="spinner"></div>
              <p>Loading expenses from database...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📝</span>
              <h3>No expenses found</h3>
              <p>You haven't recorded any expenses yet. Fill out the form above to add your first expense!</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="expense-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th className="actions-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense._id} className={editingId === expense._id ? 'highlight-row' : ''}>
                      <td className="expense-title-cell font-medium">{expense.title}</td>
                      <td>
                        <span className={`category-tag tag-${expense.category ? expense.category.toLowerCase() : 'other'}`}>
                          {expense.category}
                        </span>
                      </td>
                      <td className="expense-date-cell">{formatDateDisplay(expense.date)}</td>
                      <td className="expense-amount-cell font-bold">{formatCurrency(expense.amount)}</td>
                      <td className="expense-actions-cell">
                        <button
                          className="btn-action btn-edit"
                          onClick={() => handleEditClick(expense)}
                          title="Edit expense"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDelete(expense._id, expense.title)}
                          title="Delete expense"
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
