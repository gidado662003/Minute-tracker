const express = require("express");
const router = express.Router();

// Controller functions (to be implemented)
const {
  createMeeting,
  getMeetings,
  getCompletedMeetings,
  getMeetingById,
  updateActionItemStatus,
  updateMeeting,
  deleteMeeting,
  getAllAction,
  getMeetingActionItems,
  getDashboardTotals,
  getMonthlyMeetings,
  getTopOwners,
  getOverdueActions,
} = require("./meeting.controller");
// Middleware for handling file uploads (to be implemented)
router.post("/", createMeeting);
router.get("/", getMeetings);
router.get("/completed", getCompletedMeetings);
router.patch("/:meetingId/action-item/:itemId/status", updateActionItemStatus);
router.get("/action-items", getAllAction);
router.get("/stats/totals", getDashboardTotals);
router.get("/stats/monthly", getMonthlyMeetings);
router.get("/stats/top-owners", getTopOwners);
router.get("/stats/overdue-actions", getOverdueActions);
router.get("/:id/action-items", getMeetingActionItems);
router.get("/:id", getMeetingById);
router.put("/:id", updateMeeting);
router.delete("/:id", deleteMeeting);
module.exports = router;
