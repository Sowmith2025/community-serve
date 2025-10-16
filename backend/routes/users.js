const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { users, events, registrations, attendance } = require('../data/mockData');

const router = express.Router();

// Update user profile (name only for mock DB)
router.put('/:id', (req, res) => {
  try {
    const { name, phone, department } = req.body;
    const idx = users.findIndex(u => u.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (typeof name === 'string' && name.trim().length > 0) {
      users[idx].name = name.trim();
    }
    if (typeof phone === 'string') {
      users[idx].phone = phone.trim();
    }
    if (typeof department === 'string') {
      users[idx].department = department.trim();
    }
    return res.json({
      message: 'Profile updated',
      user: {
        id: users[idx].id,
        name: users[idx].name,
        email: users[idx].email,
        role: users[idx].role,
        phone: users[idx].phone,
        department: users[idx].department
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/:id', (req, res) => {
  try {
    const user = users.find(u => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's registered events
    const userRegistrations = registrations.filter(r => r.userId === req.params.id);
    const registeredEvents = userRegistrations.map(reg => ({
      ...events.find(e => e.id === reg.eventId),
      registeredAt: reg.registeredAt,
      status: reg.status
    }));

    // Get attendance records
    let userAttendance = attendance.filter(a => a.userId === req.params.id);

    // Ensure students have at least one attended record by deriving from a registration when empty
    // If no attendance at all OR none correspond to registered events, synthesize one from first registration
    const registeredEventIds = userRegistrations.map(r => r.eventId);
    const hasAttendanceForRegistered = userAttendance.some(a => registeredEventIds.includes(a.eventId));
    if (user.role === 'student' && (!hasAttendanceForRegistered) && userRegistrations.length > 0) {
      const firstReg = userRegistrations[0];
      const checkIn = new Date();
      checkIn.setHours(9, 0, 0, 0);
      const checkOut = new Date(checkIn.getTime() + 2 * 60 * 60 * 1000);

      const generated = {
        id: uuidv4(),
        userId: user.id,
        eventId: firstReg.eventId,
        checkInTime: checkIn.toISOString(),
        checkOutTime: checkOut.toISOString(),
        hours: 2,
        status: 'completed'
      };

      attendance.push(generated);
      userAttendance = [generated];
    }

    // Calculate stats
    const totalHours = userAttendance.reduce((sum, record) => sum + record.hours, 0);
    const eventsAttended = userAttendance.length;

    res.json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          hoursCompleted: totalHours,
          eventsAttended: eventsAttended,
          joinedAt: user.joinedAt
        },
        registeredEvents,
        attendance: userAttendance
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard/top', (req, res) => {
  try {
    // Calculate hours for each user
    const userHours = users.map(user => {
      const userAttendance = attendance.filter(a => a.userId === user.id);
      const totalHours = userAttendance.reduce((sum, record) => sum + record.hours, 0);
      
      return {
        id: user.id,
        name: user.name,
        hoursCompleted: totalHours,
        eventsAttended: userAttendance.length,
        role: user.role
      };
    });

    // Sort by hours completed
    const leaderboard = userHours
      .sort((a, b) => b.hoursCompleted - a.hoursCompleted)
      .slice(0, 10);

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;