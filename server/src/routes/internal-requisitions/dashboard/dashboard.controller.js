const Meeting = require('../../../models/meeting.schema');

// Get dashboard metrics
exports.getDashboardMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    // Get basic metrics
    const [
      totalCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      totalAmount,
      departmentStats,
      recentRequisitions,
      monthlyTrends
    ] = await Promise.all([
      Meeting.countDocuments(dateFilter),
      Meeting.countDocuments({ ...dateFilter, status: 'pending' }),
      Meeting.countDocuments({ ...dateFilter, status: 'approved' }),
      Meeting.countDocuments({ ...dateFilter, status: 'rejected' }),
      Meeting.aggregate([
        { $match: dateFilter },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      Meeting.aggregate([
        { $match: dateFilter },
        { 
          $group: {
            _id: '$department',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            approved: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Meeting.find(dateFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('requisitionNumber title department status totalAmount createdAt'),
      Meeting.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            approved: {
              $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
            },
            pending: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            rejected: {
              $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
            }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    res.json({
      overview: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        totalAmount: totalAmount[0]?.total || 0
      },
      departmentStats,
      recentRequisitions,
      monthlyTrends,
      // Add high-value insights
      insights: {
        approvalRate: totalCount ? (approvedCount / totalCount * 100).toFixed(1) : 0,
        avgProcessingDays: 2.5, // You can calculate this from actual data
        topDepartment: departmentStats[0]?._id || 'N/A',
        monthOverMonthGrowth: 0 // Calculate from monthlyTrends
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard metrics' });
  }
};