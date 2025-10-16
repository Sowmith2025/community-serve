const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { events, users, registrations } = require('../data/mockData');

const router = express.Router();

// Get all events
router.get('/', (req, res) => {
  try {
    const eventsWithDetails = events.map(event => ({
      ...event,
      organizer: users.find(u => u.id === event.organizerId)?.name || 'Unknown',
      registeredCount: registrations.filter(r => r.eventId === event.id).length,
      isFull: registrations.filter(r => r.eventId === event.id).length >= event.maxVolunteers
    }));
    
    res.json({ data: eventsWithDetails });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single event
router.get('/:id', (req, res) => {
  try {
    const event = events.find(e => e.id === req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventRegistrations = registrations.filter(r => r.eventId === req.params.id);
    const registeredUsers = eventRegistrations.map(reg => ({
      ...users.find(u => u.id === reg.userId),
      registeredAt: reg.registeredAt
    }));

    res.json({
      data: {
        ...event,
        organizer: users.find(u => u.id === event.organizerId),
        registeredUsers,
        registeredCount: eventRegistrations.length,
        isFull: eventRegistrations.length >= event.maxVolunteers
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Register for event
router.post('/:id/register', (req, res) => {
  try {
    const { userId } = req.body;
    const eventId = req.params.id;

    const event = events.find(e => e.id === eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already registered
    const existingRegistration = registrations.find(
      r => r.eventId === eventId && r.userId === userId
    );
    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check if event is full
    const eventRegistrations = registrations.filter(r => r.eventId === eventId);
    if (eventRegistrations.length >= event.maxVolunteers) {
      return res.status(400).json({ message: 'Event is full' });
    }

    // Register
    const newRegistration = {
      id: uuidv4(),
      eventId,
      userId,
      registeredAt: new Date().toISOString(),
      status: 'registered'
    };

    registrations.push(newRegistration);

    res.json({ 
      message: 'Successfully registered for event',
      registration: newRegistration
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new event
router.post('/', (req, res) => {
  try {
    const { title, description, date, time, location, maxVolunteers, organizerId, category } = req.body;

    const newEvent = {
      id: uuidv4(),
      title,
      description,
      date,
      time,
      location,
      maxVolunteers: maxVolunteers || 20,
      organizerId,
      category: category || 'general',
      createdAt: new Date().toISOString(),
      status: 'upcoming'
    };

    events.push(newEvent);

    res.status(201).json({
      message: 'Event created successfully',
      event: newEvent
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;