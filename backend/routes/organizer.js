import express from "express";
import { v4 as uuidv4 } from "uuid";
import { events, registrations } from "../data/mockData.js";

const router = express.Router();

// Get events created by organizer
router.get("/my-events/:organizerId", (req, res) => {
  try {
    const organizerEvents = events.filter(event => event.organizerId === req.params.organizerId);
    
    const eventsWithStats = organizerEvents.map(event => {
      const eventRegistrations = registrations.filter(r => r.eventId === event.id);
      return {
        ...event,
        registeredCount: eventRegistrations.length,
        attendanceRate: eventRegistrations.length > 0 ? 
          (eventRegistrations.filter(r => r.status === "attended").length / eventRegistrations.length * 100).toFixed(1) : 0
      };
    });

    res.json(eventsWithStats);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create new event
router.post("/events", (req, res) => {
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
      category: category || "general",
      createdAt: new Date().toISOString(),
      status: "upcoming"
    };

    events.push(newEvent);

    res.status(201).json({
      message: "Event created successfully",
      event: newEvent
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get event analytics
router.get("/analytics/:organizerId", (req, res) => {
  try {
    const organizerEvents = events.filter(event => event.organizerId === req.params.organizerId);
    
    const analytics = {
      totalEvents: organizerEvents.length,
      totalVolunteers: registrations.filter(reg => 
        organizerEvents.some(event => event.id === reg.eventId)
      ).length,
      upcomingEvents: organizerEvents.filter(event => event.status === "upcoming").length,
      completedEvents: organizerEvents.filter(event => event.status === "completed").length,
      popularCategory: getPopularCategory(organizerEvents)
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

function getPopularCategory(events) {
  const categories = {};
  events.forEach(event => {
    categories[event.category] = (categories[event.category] || 0) + 1;
  });
  return Object.keys(categories).reduce((a, b) => categories[a] > categories[b] ? a : b, "general");
}

export default router;
