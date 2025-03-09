import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const BudgetModal = ({ budget, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    category: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If editing, populate form with budget data
  useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category,
        amount: budget.amount
      });
    }
  }, [budget]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (budget) {
        onSave({ ...budget, ...formData });
      } else {
        onSave(formData);
      }
    } catch (err) {
      setError('Error saving budget');
    } finally {
      setLoading(false);
    }
  };

  // Predefined categories
  const categories = [
    'Housing', 'Food', 'Transportation', 'Entertainment', 
    'Healthcare', 'Shopping', 'Utilities', 'Education',
    'Savings', 'Debt', 'Personal Care', 'Other'
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">
            {budget ? 'Edit Budget' : 'Add Budget'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger mb-4">{error}</div>
            )}
            
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="amount">Monthly Budget Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                className="form-control"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0.01"
                required
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : budget ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;