const Meeting = require("../../models/meeting.schema");

async function createMeeting(req, res) {
  const meetingData = { ...req.body, department: req.department };
  try {
    await Meeting.create(meetingData);
    res.status(201).send("Meeting created successfully");
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).send("Internal Server Error");
  }
}
async function getMeetings(req, res) {
  try {
    const meetings = await Meeting.find({ department: req.department });
    res.status(200).json(meetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).send("Internal Server Error");
  }
}
async function getCompletedMeetings(req, res) {
  try {
    const meetings = await Meeting.find({
      completed: true,
      department: req.department,
    });
    res.status(200).json(meetings);
  } catch (error) {
    console.error("Error fetching completed meetings:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function updateActionItemStatus(req, res) {
  console.log(req.params, req.body);
  try {
    const { meetingId, itemId } = req.params;
    const { status } = req.body;

    // validate status
    const validStatuses = ["pending", "completed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const meeting = await Meeting.findOneAndUpdate(
      { _id: meetingId, "actionItems._id": itemId },
      { $set: { "actionItems.$.status": status } }, // update the specific subdoc
      { new: true, runValidators: true }
    );

    if (!meeting) {
      return res
        .status(404)
        .json({ message: "Meeting or action item not found" });
    }

    res.status(200).json(meeting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error });
  }
}

async function getAllAction(req, res) {
  try {
    const meetings = await Meeting.find({ department: req.department }).select(
      "actionItems date"
    );
    // fetch both actionItems and date

    const allActionItems = meetings.flatMap((meeting) =>
      meeting.actionItems.map((item) => ({
        ...item.toObject(),
        meetingId: meeting._id, // include parent meetingId
        meetingDate: meeting.date, // include meeting date
      }))
    );

    res.status(200).json(allActionItems);
  } catch (error) {
    console.error("Error fetching all action items:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

// Dashboard stats: totals
async function getDashboardTotals(req, res) {
  try {
    const [totalMeetings, completedMeetings, actionAgg] = await Promise.all([
      Meeting.countDocuments({ department: req.department }),
      Meeting.countDocuments({
        department: req.department,
        status: "completed",
      }),
      Meeting.aggregate([
        { $match: { department: req.department } },
        { $unwind: "$actionItems" },
        {
          $group: {
            _id: null,
            totalActions: { $sum: 1 },
            openActions: {
              $sum: {
                $cond: [{ $eq: ["$actionItems.status", "completed"] }, 0, 1],
              },
            },
          },
        },
      ]),
    ]);

    const totals = {
      totalMeetings,
      totalCompletedMeetings: completedMeetings,
      totalActionItems: actionAgg[0]?.totalActions || 0,
      totalOpenActionItems: actionAgg[0]?.openActions || 0,
    };
    res.status(200).json(totals);
  } catch (error) {
    console.error("Error fetching dashboard totals:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

// Dashboard stats: monthly meeting counts (last 6 months)
async function getMonthlyMeetings(req, res) {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const data = await Meeting.aggregate([
      { $match: { department: req.department, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching monthly meetings:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

// Dashboard stats: top owners by open actions
async function getTopOwners(req, res) {
  try {
    const data = await Meeting.aggregate([
      { $match: { department: req.department } },
      { $unwind: "$actionItems" },
      {
        $match: {
          "actionItems.status": { $ne: "completed" },
          "actionItems.owner": { $ne: null, $ne: "" },
        },
      },
      { $group: { _id: "$actionItems.owner", openActions: { $sum: 1 } } },
      { $sort: { openActions: -1 } },
      { $limit: 5 },
    ]);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching top owners:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

// Dashboard stats: overdue actions (due < now and not completed)
async function getOverdueActions(req, res) {
  try {
    const now = new Date();
    const meetings = await Meeting.aggregate([
      { $match: { department: req.department } },
      { $unwind: "$actionItems" },
      {
        $match: {
          "actionItems.status": { $ne: "completed" },
          "actionItems.due": { $lt: now },
        },
      },
      {
        $project: {
          _id: 0,
          actionItem: "$actionItems",
          meetingId: "$_id",
          meetingDate: "$date",
        },
      },
    ]);
    res.status(200).json(meetings);
  } catch (error) {
    console.error("Error fetching overdue actions:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

async function getMeetingActionItems(req, res) {
  try {
    const { id } = req.params;
    const meeting = await Meeting.findById(id).select("actionItems");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    res.status(200).json(meeting.actionItems);
  } catch (error) {
    console.error("Error fetching meeting action items:", error);
    res.status(500).json({ message: "Server error", error });
  }
}

function getMeetingById(req, res) {
  res.send(`Get meeting with ID: ${req.params.id}`);
}
function updateMeeting(req, res) {
  res.send(`Update meeting with ID: ${req.params.id}`);
}
function deleteMeeting(req, res) {
  res.send(`Delete meeting with ID: ${req.params.id}`);
}
module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateActionItemStatus,
  updateMeeting,
  deleteMeeting,
  getCompletedMeetings,
  getAllAction,
  getMeetingActionItems,
  getDashboardTotals,
  getMonthlyMeetings,
  getTopOwners,
  getOverdueActions,
};
