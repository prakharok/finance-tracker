const Transaction = require('../models/Transaction');

// POST /api/transactions  (protected)
exports.addTransaction = async (req, res) => {
  try {
    const { type, description, amount, date } = req.body;
    if (!type || !['Income', 'Expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be Income or Expense' });
    }
    if (!description || amount === undefined || amount === null || isNaN(Number(amount))) {
      return res.status(400).json({ message: 'Description and a numeric amount are required' });
    }

    const tx = await Transaction.create({
      user: req.userId,
      type,
      description,
      amount: Number(amount),
      date: date || Date.now(),
    });
    res.status(201).json(tx);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add transaction', error: err.message });
  }
};

// GET /api/transactions  (protected)
// Query params: type, dateFrom, dateTo, minAmount, maxAmount, sortBy, order, page, limit
exports.getTransactions = async (req, res) => {
  try {
    const {
      type,
      dateFrom,
      dateTo,
      minAmount,
      maxAmount,
      sortBy = 'date',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const filter = { user: req.userId };
    if (type && ['Income', 'Expense'].includes(type)) filter.type = type;

    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      if (dateTo) filter.date.$lte = new Date(dateTo);
    }
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }

    const sortField = ['date', 'amount', 'type'].includes(sortBy) ? sortBy : 'date';
    const sortOrder = order === 'asc' ? 1 : -1;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.max(1, Math.ceil(total / limitNum)),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch transactions', error: err.message });
  }
};

// DELETE /api/transactions/:id  (protected)
exports.deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!tx) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
};
