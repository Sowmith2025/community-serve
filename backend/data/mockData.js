const { v4: uuidv4 } = require('uuid');

// Mock database
const users = [
  {
    id: 'user-1',
    name: 'Arjun Kumar',
    email: 'arjun@college.edu',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'student',
    phone: '+91-90000-00001',
    department: 'Computer Science',
    hoursCompleted: 15,
    eventsAttended: ['event-1', 'event-2'],
    joinedAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: 'user-2',
    name: 'Priya Sharma',
    email: 'priya@college.edu',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'organizer',
    phone: '+91-90000-00002',
    department: 'Social Work',
    hoursCompleted: 8,
    eventsAttended: ['event-1'],
    joinedAt: '2024-02-01T00:00:00.000Z'
  }
];

const events = [
  {
    id: 'event-1',
    title: 'Hussain Sagar Lake Cleanup',
    description: 'Swachhata drive to remove litter along the lakeside and protect urban wildlife.',
    date: '2025-10-18',
    time: '09:00',
    location: 'Necklace Road, Hyderabad',
    maxVolunteers: 25,
    organizerId: 'user-2',
    category: 'environment',
    createdAt: '2025-09-20T00:00:00.000Z',
    status: 'upcoming'
  },
  {
    id: 'event-2',
    title: 'Annadanam Food Distribution',
    description: 'Collect, pack and distribute meal packets to underprivileged families.',
    date: '2025-11-02',
    time: '13:00',
    location: 'Community Hall, Secunderabad',
    maxVolunteers: 30,
    organizerId: 'user-1',
    category: 'community',
    createdAt: '2025-09-25T00:00:00.000Z',
    status: 'upcoming'
  },
  {
    id: 'event-3',
    title: 'Urban Tree Planting',
    description: 'Plant native trees along neighborhood streets to increase shade and biodiversity.',
    date: '2025-11-15',
    time: '10:00',
    location: 'KBR Park, Hyderabad',
    maxVolunteers: 35,
    organizerId: 'user-2',
    category: 'environment',
    createdAt: '2025-10-01T00:00:00.000Z',
    status: 'upcoming'
  },
  {
    id: 'event-4',
    title: 'Winter Coat Drive',
    description: 'Sort and distribute donated jackets to families ahead of winter.',
    date: '2025-12-06',
    time: '11:00',
    location: 'Jubilee Hills Community Center, Hyderabad',
    maxVolunteers: 20,
    organizerId: 'user-1',
    category: 'community',
    createdAt: '2025-10-05T00:00:00.000Z',
    status: 'upcoming'
  },
  {
    id: 'event-5',
    title: 'NSS Blood Donation Camp',
    description: 'Volunteer coordination for donor registration and post-donation care.',
    date: '2025-10-25',
    time: '10:00',
    location: 'College Auditorium, Hyderabad',
    maxVolunteers: 40,
    organizerId: 'user-2',
    category: 'nss',
    createdAt: '2025-10-05T00:00:00.000Z',
    status: 'upcoming'
  },
  {
    id: 'event-6',
    title: 'NSS Swachh Bharat Drive',
    description: 'Community cleanliness drive in nearby neighborhoods and public spaces.',
    date: '2025-11-08',
    time: '08:00',
    location: 'Charminar – Laad Bazaar, Hyderabad',
    maxVolunteers: 50,
    organizerId: 'user-2',
    category: 'nss',
    createdAt: '2025-10-10T00:00:00.000Z',
    status: 'upcoming'
  },
  {
    id: 'event-7',
    title: 'NSS Tree Plantation Drive',
    description: 'Plant saplings and set up watering schedule with local residents.',
    date: '2025-11-22',
    time: '09:30',
    location: 'Durgam Cheruvu Park, Hyderabad',
    maxVolunteers: 60,
    organizerId: 'user-1',
    category: 'nss',
    createdAt: '2025-10-12T00:00:00.000Z',
    status: 'upcoming'
  },
  {
    id: 'event-8',
    title: 'NSS Rural Literacy Program',
    description: 'Weekend teaching sessions and activity kits for children in nearby villages.',
    date: '2025-12-13',
    time: '10:00',
    location: 'Kondapur Village School, Hyderabad',
    maxVolunteers: 30,
    organizerId: 'user-1',
    category: 'nss',
    createdAt: '2025-10-15T00:00:00.000Z',
    status: 'upcoming'
  }
];

const registrations = [
  {
    id: 'reg-1',
    eventId: 'event-1',
    userId: 'user-1',
    registeredAt: '2025-09-25T00:00:00.000Z',
    status: 'registered'
  },
  {
    id: 'reg-2',
    eventId: 'event-2',
    userId: 'user-1',
    registeredAt: '2025-10-01T00:00:00.000Z',
    status: 'registered'
  },
  {
    id: 'reg-3',
    eventId: 'event-5',
    userId: 'user-1',
    registeredAt: '2025-10-10T00:00:00.000Z',
    status: 'registered'
  },
  {
    id: 'reg-4',
    eventId: 'event-6',
    userId: 'user-1',
    registeredAt: '2025-10-12T00:00:00.000Z',
    status: 'registered'
  }
];

const attendance = [
  {
    id: 'att-1',
    userId: 'user-1',
    eventId: 'event-3',
    checkInTime: '2025-04-15T09:00:00.000Z',
    checkOutTime: '2025-04-15T12:00:00.000Z',
    hours: 3,
    status: 'completed'
  }
];

module.exports = {
  users,
  events,
  registrations,
  attendance
};