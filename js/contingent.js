/**
 * Melange '26 - Contingent & Squad Management Controller
 * Handles student data entry by College GS, official event entries, and scoring
 * Zones: Creative, Thinking, Entertainment, Discover
 */

const ContingentManager = {
  /**
   * Get all registered squads for a specific college
   */
  getCollegeRegistrations(collegeId) {
    const all = StorageManager.getRegistrations();
    if (!collegeId) return [];
    return all.filter(r => r.collegeId === collegeId);
  },

  /**
   * Get all individual students enrolled by this College GS
   */
  getCollegeStudents(collegeId) {
    const all = StorageManager.getStudents();
    if (!collegeId) return [];
    return all.filter(s => s.collegeId === collegeId);
  },

  /**
   * Student Entry: Only College GS can add students and assign their events
   */
  addStudentEntry(collegeId, data) {
    if (!collegeId) return { success: false, message: "GS authentication required." };

    if (!data.name || !data.rollNo || !data.phone || !data.assignedEventId) {
      return { success: false, message: "Please fill out all required student details." };
    }

    const students = StorageManager.getStudents();
    
    // Check if student with same Roll No already enrolled in this college
    const existing = students.find(
      s => s.collegeId === collegeId && s.rollNo.trim().toUpperCase() === data.rollNo.trim().toUpperCase() && s.assignedEventId === data.assignedEventId
    );

    if (existing) {
      return { success: false, message: `Student (${data.rollNo}) is already registered for this event.` };
    }

    const event = MELANGE_DATA.events.find(e => e.id === data.assignedEventId);
    const newStudent = {
      studentId: `STU-${collegeId.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      collegeId: collegeId,
      name: data.name.trim(),
      rollNo: data.rollNo.trim().toUpperCase(),
      dept: data.dept ? data.dept.trim() : "General",
      year: data.year ? data.year.trim() : "1st Year",
      phone: data.phone.trim(),
      email: data.email ? data.email.trim() : "",
      assignedEventId: data.assignedEventId,
      teamName: data.teamName ? data.teamName.trim() : `${data.name}'s Squad`,
      role: data.role || "Participant",
      enrolledAt: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    students.push(newStudent);
    StorageManager.saveStudents(students);

    // Also ensure the event is registered under the college contingent
    let registrations = StorageManager.getRegistrations();
    let reg = registrations.find(r => r.collegeId === collegeId && r.eventId === data.assignedEventId);

    if (!reg) {
      const regId = `MEL26-${collegeId.toUpperCase()}-${data.assignedEventId.replace("-", "").toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const slotNum = `SLOT-${String(Math.floor(1 + Math.random() * 14)).padStart(2, '0')}`;
      reg = {
        registrationId: regId,
        collegeId: collegeId,
        eventId: data.assignedEventId,
        teamName: newStudent.teamName,
        teamLeader: newStudent.name,
        contactPhone: newStudent.phone,
        members: [`${newStudent.name} (${newStudent.rollNo})`],
        registeredAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        status: "CONFIRMED",
        slotNumber: slotNum,
        pointsAwarded: 15
      };
      registrations.push(reg);
    } else {
      // Append to squad members list
      const memberEntry = `${newStudent.name} (${newStudent.rollNo})`;
      if (!reg.members.includes(memberEntry)) {
        reg.members.push(memberEntry);
      }
    }
    StorageManager.saveRegistrations(registrations);

    return {
      success: true,
      student: newStudent,
      message: `${newStudent.name} successfully registered for ${event ? event.title : 'the event'} by GS!`
    };
  },

  /**
   * Enroll Multiple Students for an Event in a Single Batch by GS
   */
  addMultipleStudentsForEvent(collegeId, eventId, teamName, studentsList) {
    if (!collegeId) return { success: false, message: "GS authentication required." };
    if (!eventId) return { success: false, message: "Please select an event from the dropdown." };
    if (!studentsList || studentsList.length === 0) {
      return { success: false, message: "Please provide details for at least one student." };
    }

    const event = MELANGE_DATA.events.find(e => e.id === eventId);
    if (!event) return { success: false, message: "Event not found." };

    if (studentsList.length < event.minMembers) {
      return { success: false, message: `${event.title} requires at least ${event.minMembers} student(s). You provided ${studentsList.length}.` };
    }
    if (studentsList.length > event.maxMembers) {
      return { success: false, message: `${event.title} allows at most ${event.maxMembers} student(s). You provided ${studentsList.length}.` };
    }

    const allStudents = StorageManager.getStudents();
    const enrolledStudents = [];

    for (let i = 0; i < studentsList.length; i++) {
      const s = studentsList[i];
      if (!s.name || !s.rollNo || !s.phone) {
        return { success: false, message: `Student #${i+1} details are incomplete (Name, Roll No, and Phone are required).` };
      }

      // Check duplicates
      const dup = allStudents.find(
        st => st.collegeId === collegeId && st.rollNo.trim().toUpperCase() === s.rollNo.trim().toUpperCase() && st.assignedEventId === eventId
      );
      if (dup) {
        return { success: false, message: `Student (${s.rollNo}) is already registered for ${event.title}.` };
      }

      const newStudent = {
        studentId: `STU-${collegeId.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        collegeId: collegeId,
        name: s.name.trim(),
        rollNo: s.rollNo.trim().toUpperCase(),
        dept: s.dept ? s.dept.trim() : "General",
        year: s.year ? s.year.trim() : "2nd Year",
        phone: s.phone.trim(),
        email: s.email ? s.email.trim() : "",
        assignedEventId: eventId,
        teamName: teamName ? teamName.trim() : `${studentsList[0].name}'s Squad`,
        role: s.role || (i === 0 ? "Team Leader" : "Squad Member"),
        enrolledAt: new Date().toISOString().replace("T", " ").substring(0, 16)
      };

      allStudents.push(newStudent);
      enrolledStudents.push(newStudent);
    }

    StorageManager.saveStudents(allStudents);

    // Register or update squad
    let registrations = StorageManager.getRegistrations();
    let reg = registrations.find(r => r.collegeId === collegeId && r.eventId === eventId);
    const primaryStudent = enrolledStudents[0];

    if (!reg) {
      const regId = `MEL26-${collegeId.toUpperCase()}-${eventId.replace("-", "").toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const slotNum = `SLOT-${String(Math.floor(1 + Math.random() * 14)).padStart(2, '0')}`;
      reg = {
        registrationId: regId,
        collegeId: collegeId,
        eventId: eventId,
        teamName: teamName ? teamName.trim() : `${primaryStudent.name}'s Squad`,
        teamLeader: primaryStudent.name,
        contactPhone: primaryStudent.phone,
        members: enrolledStudents.map(st => `${st.name} (${st.rollNo})`),
        registeredAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        status: "CONFIRMED",
        slotNumber: slotNum,
        pointsAwarded: 15
      };
      registrations.push(reg);
    } else {
      enrolledStudents.forEach(st => {
        const memStr = `${st.name} (${st.rollNo})`;
        if (!reg.members.includes(memStr)) {
          reg.members.push(memStr);
        }
      });
    }

    StorageManager.saveRegistrations(registrations);

    return {
      success: true,
      students: enrolledStudents,
      registration: reg,
      message: `Enrolled ${enrolledStudents.length} student(s) for ${event.title}!`
    };
  },

  /**
   * Remove a student entry
   */
  deleteStudentEntry(studentId) {
    let students = StorageManager.getStudents();
    const target = students.find(s => s.studentId === studentId);
    if (!target) return { success: false, message: "Student record not found." };

    students = students.filter(s => s.studentId !== studentId);
    StorageManager.saveStudents(students);
    return { success: true, message: `Student entry removed.` };
  },

  /**
   * Check if college is registered for an event
   */
  isRegistered(collegeId, eventId) {
    const regs = this.getCollegeRegistrations(collegeId);
    return regs.find(r => r.eventId === eventId);
  },

  /**
   * Register a new squad for an event under the logged-in GS
   */
  registerSquad(collegeId, eventId, squadData) {
    const event = MELANGE_DATA.events.find(e => e.id === eventId);
    if (!event) return { success: false, message: "Invalid event selected." };

    const existing = this.isRegistered(collegeId, eventId);
    if (existing) {
      return { success: false, message: "Your college has already registered a contingent squad for this event." };
    }

    // Validation
    const members = (squadData.members || []).map(m => m.trim()).filter(Boolean);
    if (members.length < event.minMembers || members.length > event.maxMembers) {
      return {
        success: false,
        message: `Squad size must be between ${event.minMembers} and ${event.maxMembers} members (Provided: ${members.length}).`
      };
    }

    if (!squadData.teamName || !squadData.teamLeader || !squadData.contactPhone) {
      return { success: false, message: "Please fill out all required team details." };
    }

    const regId = `MEL26-${collegeId.toUpperCase()}-${event.id.replace("-", "").toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const slotNum = `SLOT-${String(Math.floor(1 + Math.random() * 14)).padStart(2, '0')}`;

    const newReg = {
      registrationId: regId,
      collegeId: collegeId,
      eventId: eventId,
      teamName: squadData.teamName.trim(),
      teamLeader: squadData.teamLeader.trim(),
      contactPhone: squadData.contactPhone.trim(),
      members: members,
      registeredAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "CONFIRMED",
      slotNumber: slotNum,
      notes: squadData.notes || "",
      pointsAwarded: 15 // +15 participation points automatically awarded to the college contingent!
    };

    const all = StorageManager.getRegistrations();
    all.push(newReg);
    StorageManager.saveRegistrations(all);

    // Also auto-add members to the College GS Students directory
    const students = StorageManager.getStudents();
    members.forEach((memStr, idx) => {
      students.push({
        studentId: `STU-${collegeId.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        collegeId: collegeId,
        name: memStr.split('(')[0].trim(),
        rollNo: memStr.includes('(') ? memStr.split('(')[1].replace(')', '').trim() : `ROLL-${idx + 1}`,
        dept: "Contingent Squad",
        year: "Student",
        phone: squadData.contactPhone,
        email: "",
        assignedEventId: eventId,
        teamName: squadData.teamName.trim(),
        role: idx === 0 ? "Team Leader" : "Member",
        enrolledAt: newReg.registeredAt
      });
    });
    StorageManager.saveStudents(students);

    return { success: true, registration: newReg, message: "Contingent squad registered successfully by GS!" };
  },

  /**
   * Cancel / withdraw squad entry
   */
  cancelRegistration(registrationId) {
    let all = StorageManager.getRegistrations();
    const target = all.find(r => r.registrationId === registrationId);
    if (!target) return { success: false, message: "Registration not found." };

    all = all.filter(r => r.registrationId !== registrationId);
    StorageManager.saveRegistrations(all);
    return { success: true, message: "Squad entry withdrawn successfully." };
  },

  /**
   * Calculate live leaderboard points for all colleges across the 4 zones
   */
  getLeaderboard() {
    const colleges = StorageManager.getColleges();
    const allRegs = StorageManager.getRegistrations();

    return colleges.map(col => {
      const colRegs = allRegs.filter(r => r.collegeId === col.id);
      
      // Calculate 4 zone breakdown: creative, thinking, entertainment, discover
      const zoneBreakdown = {
        creative: 0,
        thinking: 0,
        entertainment: 0,
        discover: 0
      };

      let earnedPoints = 0;
      let totalParticipantsCount = 0;

      colRegs.forEach(reg => {
        const ev = MELANGE_DATA.events.find(e => e.id === reg.eventId);
        const pts = (reg.pointsAwarded || 15);
        earnedPoints += pts;
        totalParticipantsCount += (reg.members ? reg.members.length : 1);
        if (ev && zoneBreakdown[ev.zoneId] !== undefined) {
          zoneBreakdown[ev.zoneId] += pts;
        }
      });

      const totalScore = (col.basePoints || 100) + earnedPoints;

      return {
        ...col,
        registeredEventsCount: colRegs.length,
        totalParticipantsCount: totalParticipantsCount,
        earnedPoints: earnedPoints,
        totalScore: totalScore,
        zoneBreakdown: zoneBreakdown
      };
    }).sort((a, b) => b.totalScore - a.totalScore);
  },

  /**
   * Get all students across all colleges (for Admin Dashboard)
   */
  getAllStudentsAcrossColleges() {
    return StorageManager.getStudents();
  },

  /**
   * Admin declares results and awards trophy points to a college
   */
  awardEventPoints(eventId, collegeId, rank, points) {
    const registrations = StorageManager.getRegistrations();
    let targetReg = registrations.find(r => r.eventId === eventId && r.collegeId === collegeId);
    
    if (targetReg) {
      targetReg.pointsAwarded = points;
      targetReg.rankAwarded = rank;
      StorageManager.saveRegistrations(registrations);
    } else {
      // If not yet registered in mock, create confirmed result record
      const colleges = StorageManager.getColleges();
      const col = colleges.find(c => c.id === collegeId);
      const ev = MELANGE_DATA.events.find(e => e.id === eventId);
      
      const newReg = {
        registrationId: `MEL26-${collegeId.toUpperCase()}-${eventId.replace("-", "").toUpperCase()}-AWARD`,
        collegeId: collegeId,
        eventId: eventId,
        teamName: `${col ? col.shortCode : collegeId} Winners`,
        teamLeader: "Official Delegation",
        contactPhone: col ? col.phone : "+91 98000 00000",
        members: ["Official College Squad"],
        registeredAt: new Date().toISOString().replace("T", " ").substring(0, 16),
        status: "CONFIRMED",
        slotNumber: "PODIUM",
        pointsAwarded: points,
        rankAwarded: rank
      };
      registrations.push(newReg);
      StorageManager.saveRegistrations(registrations);
    }

    return { success: true, message: `Awarded ${points} pts to ${collegeId.toUpperCase()} (${rank})!` };
  },

  /**
   * Admin broadcasts announcement to all college GS
   */
  broadcastNotice(title, body, zone = "Central Desk", urgent = false) {
    const ann = StorageManager.getAnnouncements();
    const newNotice = {
      id: "ann-" + Date.now(),
      time: "Just now",
      zone: zone,
      title: title.trim(),
      body: body.trim(),
      urgent: !!urgent
    };
    ann.unshift(newNotice);
    StorageManager.saveAnnouncements(ann);
    return { success: true, announcement: newNotice };
  },

  /**
   * Generates a deterministic SVG QR Code matrix for digital pass verification
   */
  generatePassQRCodeSvg(text, size = 160) {
    const matrixSize = 21;
    const grid = Array(matrixSize).fill(0).map(() => Array(matrixSize).fill(false));

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    const drawFinder = (top, left) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
          const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          grid[top + r][left + c] = isBorder || isInner;
        }
      }
    };

    drawFinder(0, 0);
    drawFinder(0, matrixSize - 7);
    drawFinder(matrixSize - 7, 0);

    for (let i = 8; i < matrixSize - 8; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    let seed = Math.abs(hash) + 12345;
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if ((r < 8 && c < 8) || (r < 8 && c >= matrixSize - 8) || (r >= matrixSize - 8 && c < 8)) {
          continue;
        }
        if (r === 6 || c === 6) continue;

        seed = (seed * 9301 + 49297) % 233280;
        grid[r][c] = (seed / 233280) > 0.48;
      }
    }

    const cellSize = (size / matrixSize).toFixed(2);
    let rects = "";
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (grid[r][c]) {
          const x = (c * cellSize).toFixed(2);
          const y = (r * cellSize).toFixed(2);
          rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="#0f172a" rx="1" />`;
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="qr-code-svg">
      <rect width="${size}" height="${size}" fill="#ffffff" rx="10" />
      <g transform="translate(4,4) scale(${((size - 8) / size).toFixed(3)})">
        ${rects}
      </g>
    </svg>`;
  }
};
