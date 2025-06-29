// MongoDB initialization script
// This script runs when MongoDB container starts for the first time

// Create database and collections with initial indexes
db = db.getSiblingDB('adoptme-db');

// Create collections
db.createCollection('users');
db.createCollection('pets');
db.createCollection('adoptions');
db.createCollection('notifications');

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ createdAt: -1 });

db.pets.createIndex({ name: 1 });
db.pets.createIndex({ species: 1 });
db.pets.createIndex({ status: 1 });
db.pets.createIndex({ owner: 1 });
db.pets.createIndex({ createdAt: -1 });

db.adoptions.createIndex({ pet: 1 });
db.adoptions.createIndex({ adopter: 1 });
db.adoptions.createIndex({ status: 1 });
db.adoptions.createIndex({ createdAt: -1 });

db.notifications.createIndex({ user: 1 });
db.notifications.createIndex({ read: 1 });
db.notifications.createIndex({ createdAt: -1 });

print('MongoDB initialization completed successfully!');
