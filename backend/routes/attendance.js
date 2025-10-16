import express from "express";
import { v4 as uuidv4 } from "uuid";
import { attendance, events, users } from "../data/mockData.js";

const router = express.Router();

// Check in to event
router.post("/check-in", (req, res) => {
  try {
    const { userId, eventId, checkInTime = new Date().toISOString() } = req.body;

    const event = events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const existingCheckin = attendance.find(
      a => a.eventId === eventId && a.userId === userId && !a.checkOutTime
    );
    if (existingCheckin) {
      return res.status(400).json({ message: "Already checked in to this event" });
    }

    const newAttendance = {
      id: uuidv4(),
      userId,
      eventId,
      checkInTime,
      checkOutTime: null,
      hours: 0,
      status: "checked-in"
    };

    attendance.push(newAttendance);

    res.json({
      message: "Successfully checked in",
      attendance: newAttendance
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Check out from event
router.post("/check-out", (req, res) => {
  try {
    const { userId, eventId, checkOutTime = new Date().toISOString() } = req.body;

    const checkinRecord = attendance.find(
      a => a.eventId === eventId && a.userId === userId && !a.checkOutTime
    );

    if (!checkinRecord) {
      return res.status(400).json({ message: "No active check-in found" });
    }

    const checkInTime = new Date(checkinRecord.checkInTime);
    const checkoutTime = new Date(checkOutTime);
    const hours = (checkoutTime - checkInTime) / (1000 * 60 * 60);
    const roundedHours = Math.round(hours * 100) / 100;

    checkinRecord.checkOutTime = checkOutTime;
    checkinRecord.hours = roundedHours;
    checkinRecord.status = "completed";

    res.json({
      message: "Successfully checked out",
      hours: roundedHours,
      attendance: checkinRecord
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
