const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'melange_db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const initialUsers = [
  {
    _id: 'usr_admin',
    username: 'admin',
    email: 'admin@melange.edu',
    password: 'admin123',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    passwordSalt: 'melange_salt_2026',
    name: 'Alex Carter',
    role: 'admin',
    title: 'Event Administrator',
    collegeId: null,
    collegeName: 'Melange Central Directorate',
    lastLogin: 'Nov 18, 2026, 09:15 AM'
  },
  {
    _id: 'usr_gs_aec',
    username: 'AEC04-GS',
    email: 'gs.aec@gmail.com',
    password: 'password123',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    passwordSalt: 'melange_salt_2026',
    name: 'Rohit Sharma',
    role: 'college_gs',
    title: 'General Secretary',
    collegeId: 'AEC04',
    collegeName: 'AEC Metro College',
    lastLogin: 'Nov 18, 2026, 08:45 AM'
  },
  {
    _id: 'usr_gs_coep',
    username: 'COEP01-GS',
    email: 'gs.gymkhana@coeptech.ac.in',
    password: 'password123',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    passwordSalt: 'melange_salt_2026',
    name: 'Priya Deshmukh',
    role: 'college_gs',
    title: 'General Secretary',
    collegeId: 'COEP01',
    collegeName: 'COEP Technological University',
    lastLogin: 'Nov 17, 2026, 06:20 PM'
  },
  {
    _id: 'usr_gs_mit',
    username: 'MIT02-GS',
    email: 'gs.council@mitwpu.edu.in',
    password: 'password123',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    passwordSalt: 'melange_salt_2026',
    name: 'Aryan Sharma',
    role: 'college_gs',
    title: 'General Secretary',
    collegeId: 'MIT02',
    collegeName: 'MIT World Peace University',
    lastLogin: 'Nov 17, 2026, 05:10 PM'
  },
  {
    _id: 'usr_gs_sx',
    username: 'SX01-GS',
    email: 'rahul.gs@stxaviers.edu',
    password: 'password123',
    passwordHash: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
    passwordSalt: 'melange_salt_2026',
    name: 'Rahul Sharma',
    role: 'college_gs',
    title: 'General Secretary',
    collegeId: 'SX01',
    collegeName: "St. Xavier's College",
    lastLogin: 'Nov 16, 2026, 02:30 PM'
  }
];

initialUsers.forEach(u => {
  const existing = db.users.find(x => x.username.toLowerCase() === u.username.toLowerCase());
  if (!existing) {
    db.users.push(u);
  } else {
    Object.assign(existing, u);
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Successfully synchronized melange_db.json! Total stored users in DB:', db.users.length);
