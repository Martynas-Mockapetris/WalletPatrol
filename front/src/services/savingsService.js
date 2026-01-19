import api from './api';

const savingsService = {
  getAll() {
    return api.get('/savings');
  },
  create({ name, goalAmount }) {
    return api.post('/savings', { name, goalAmount });
  },
  addAmount(id, amount) {
    return api.put(`/savings/${id}/add`, { amount });
  },
  removeAmount(id, amount) {
    return api.put(`/savings/${id}/remove`, { amount });
  },
  delete(id) {
    return api.delete(`/savings/${id}`);
  }
};

export default savingsService;
