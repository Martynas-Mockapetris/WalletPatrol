import API from './api';

// Transaction API calls (mirrors your backend routes)
const transactionService = {
  // Get transactions for a given month/year (optional filters)
  getByMonth: (month, year) => API.get('/transactions', { params: { month, year } }),

  // Create a new transaction
  create: (date, amount, type, comment) => API.post('/transactions', { date, amount, type, comment }),

  // Update an existing transaction
  update: (id, data) => API.put(`/transactions/${id}`, data),

  // Delete a transaction
  remove: (id) => API.delete(`/transactions/${id}`)
};

export default transactionService;
