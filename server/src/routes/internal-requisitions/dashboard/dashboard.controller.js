const InternalRequisition = require("../../../models/internal-requsitions-schema");

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

    const statusMatch = (status) => ({ ...dateFilter, status });

    const [
      totalCount,
      pendingCount,
      approvedCount,
      rejectedCount,
      totalAmountAgg,
      departmentStats,
      recentRequisitions,
      monthlyTrends,
      approvalsForDuration,
    ] = await Promise.all([
      InternalRequisition.countDocuments(dateFilter),
      InternalRequisition.countDocuments(statusMatch("pending")),
      InternalRequisition.countDocuments(statusMatch("approved")),
      InternalRequisition.countDocuments(statusMatch("rejected")),
      InternalRequisition.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ["$totalAmount", 0] } },
          },
        },
      ]),
      InternalRequisition.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$department",
            count: { $sum: 1 },
            totalAmount: { $sum: { $ifNull: ["$totalAmount", 0] } },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            approved: {
              $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
            },
            rejected: {
              $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
            },
          },
        },
        { $sort: { count: -1 } },
      ]),
      InternalRequisition.find(dateFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "requisitionNumber title department status totalAmount createdAt"
        ),
      InternalRequisition.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
            totalAmount: { $sum: { $ifNull: ["$totalAmount", 0] } },
            approved: {
              $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            rejected: {
              $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
            },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
      // For average processing days, only consider approved items with approvedOn set
      InternalRequisition.aggregate([
        {
          $match: {
            ...dateFilter,
            status: "approved",
            approvedOn: { $ne: null },
          },
        },
        {
          $project: {
            diffDays: {
              $divide: [
                { $subtract: ["$approvedOn", "$createdAt"] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
        { $group: { _id: null, avgDays: { $avg: "$diffDays" } } },
      ]),
    ]);

    const totalAmount = totalAmountAgg[0]?.total || 0;

    // Compute insights
    const approvalRate = totalCount
      ? Number(((approvedCount / totalCount) * 100).toFixed(1))
      : 0;
    const avgProcessingDays = approvalsForDuration[0]?.avgDays
      ? Number(approvalsForDuration[0].avgDays.toFixed(1))
      : 0;

    // Month-over-month growth based on total count per month
    let monthOverMonthGrowth = 0;
    if (monthlyTrends.length >= 2) {
      const last = monthlyTrends[monthlyTrends.length - 1].count || 0;
      const prev = monthlyTrends[monthlyTrends.length - 2].count || 0;
      if (prev > 0) {
        monthOverMonthGrowth = Number(
          (((last - prev) / prev) * 100).toFixed(1)
        );
      } else if (last > 0) {
        monthOverMonthGrowth = 100;
      }
    }

    res.json({
      overview: {
        total: totalCount,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        totalAmount,
      },
      departmentStats,
      recentRequisitions,
      monthlyTrends,
      insights: {
        approvalRate,
        avgProcessingDays,
        topDepartment: departmentStats[0]?._id || "N/A",
        monthOverMonthGrowth,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    res.status(500).json({ error: "Failed to fetch dashboard metrics" });
  }
};
