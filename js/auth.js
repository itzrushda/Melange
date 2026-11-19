/**
 * Melange '26 - General Secretary (GS) & Fest Admin Authentication Controller
 * Enforces exclusive college representation for GS & Fest Control Room access for Admin
 */

const AuthManager = {
  currentGS: null,

  init() {
    StorageManager.init();
    this.currentGS = StorageManager.getActiveSession();
    return this.currentGS;
  },

  isLoggedIn() {
    return !!this.currentGS;
  },

  isAdmin() {
    return StorageManager.isAdminMode();
  },

  getCurrentGS() {
    return this.currentGS;
  },

  /**
   * Authenticate GS using GS Code and Security PIN
   */
  login(gsCode, pin) {
    const colleges = StorageManager.getColleges();
    const cleanCode = (gsCode || "").trim().toUpperCase();
    const cleanPin = (pin || "").trim();

    if (!cleanCode || !cleanPin) {
      return { success: false, message: "Please provide both GS Code and Security PIN." };
    }

    // Check if user is logging into Admin with Admin credentials
    if ((cleanCode === "ADMIN" || cleanCode === "ADMIN-MELANGE") && (cleanPin === "9999" || cleanPin === MELANGE_DATA.adminCredentials.pin)) {
      StorageManager.setAdminMode(true);
      return { success: true, isAdmin: true, message: "Welcome to Central Fest Admin Dashboard!" };
    }

    const matchedCollege = colleges.find(
      c => c.gsCode.toUpperCase() === cleanCode && c.pin === cleanPin
    );

    if (matchedCollege) {
      this.currentGS = matchedCollege;
      StorageManager.setAdminMode(false);
      StorageManager.setActiveSession(matchedCollege);
      return { success: true, college: matchedCollege, message: `Welcome General Secretary ${matchedCollege.gsName} (${matchedCollege.shortCode})` };
    } else {
      return {
        success: false,
        message: "Invalid GS credentials. Only authorized College General Secretaries may access this portal."
      };
    }
  },

  loginGS(gsCode, pin) {
    return this.login(gsCode, pin);
  },

  /**
   * Admin-specific direct PIN login
   */
  loginAdmin(pin) {
    const clean = (pin || "").trim();
    if (clean === "9999" || clean === MELANGE_DATA.adminCredentials.pin) {
      StorageManager.setAdminMode(true);
      return { success: true, message: "Admin Portal unlocked." };
    }
    return { success: false, message: "Invalid Admin Passcode (Default PIN: 9999)." };
  },

  logoutAdmin() {
    StorageManager.setAdminMode(false);
  },

  /**
   * Fast 1-click Demo Login for evaluating different college perspectives
   */
  loginAsCollege(collegeId) {
    const colleges = StorageManager.getColleges();
    const target = colleges.find(c => c.id === collegeId);
    if (target) {
      this.currentGS = target;
      StorageManager.setAdminMode(false);
      StorageManager.setActiveSession(target);
      return { success: true, college: target };
    }
    return { success: false, message: "College profile not found." };
  },

  /**
   * Register a new College General Secretary credential
   */
  registerNewGS(data) {
    const colleges = StorageManager.getColleges();

    const existingCode = colleges.find(
      c => c.gsCode.toUpperCase() === data.gsCode.trim().toUpperCase()
    );
    if (existingCode) {
      return { success: false, message: "A General Secretary code already exists with this ID." };
    }

    const id = data.shortCode.toLowerCase().replace(/[^a-z0-9]/g, "") + "_" + Math.floor(Math.random() * 1000);
    const newCollege = {
      id: id,
      name: data.collegeName.trim(),
      shortCode: data.shortCode.trim().toUpperCase(),
      city: data.city.trim(),
      gsName: data.gsName.trim(),
      gsDesignation: data.gsDesignation.trim() || "General Secretary",
      gsCode: data.gsCode.trim().toUpperCase(),
      pin: data.pin.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      badgeColor: data.badgeColor || "#06b6d4",
      contingentSize: parseInt(data.contingentSize) || 25,
      basePoints: 100,
      avatar: "🎓"
    };

    colleges.push(newCollege);
    StorageManager.saveColleges(colleges);
    this.currentGS = newCollege;
    StorageManager.setAdminMode(false);
    StorageManager.setActiveSession(newCollege);

    return { success: true, college: newCollege };
  },

  logout() {
    this.currentGS = null;
    StorageManager.clearActiveSession();
    StorageManager.setAdminMode(false);
  }
};
