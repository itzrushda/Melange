/**
 * Melange Event Management Portal - Frontend API Client
 * Manages JWT tokens, Session Persistence, and REST Endpoints
 */

const API_BASE = '';

const MelangeAPI = {
  // Token Storage Helpers
  getToken() {
    return localStorage.getItem('melange_jwt_token') || sessionStorage.getItem('melange_jwt_token');
  },

  setToken(token, remember = false) {
    if (remember) {
      localStorage.setItem('melange_jwt_token', token);
      sessionStorage.removeItem('melange_jwt_token');
    } else {
      sessionStorage.setItem('melange_jwt_token', token);
      localStorage.removeItem('melange_jwt_token');
    }
  },

  clearToken() {
    localStorage.removeItem('melange_jwt_token');
    sessionStorage.removeItem('melange_jwt_token');
    localStorage.removeItem('melange_user_cache');
  },

  // Base Request Handler
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Special handling for binary/file downloads (e.g. Excel/CSV)
      if (options.responseType === 'blob') {
        if (!response.ok) throw new Error('Download failed');
        return await response.blob();
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (err) {
      console.error(`API Error [${endpoint}]:`, err.message);
      throw err;
    }
  },

  // ===========================================================
  // MODULE 1: AUTHENTICATION & ROLE MANAGEMENT
  // ===========================================================
  async login(username, password, role, rememberMe = false) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, role, rememberMe })
    });
    if (res.success && res.token) {
      this.setToken(res.token, rememberMe);
      localStorage.setItem('melange_user_cache', JSON.stringify(res.user));
    }
    return res;
  },

  async getMe() {
    return await this.request('/api/auth/me');
  },

  async forgotPassword(identifier) {
    return await this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier })
    });
  },

  async resetPassword(resetToken, newPassword) {
    return await this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword })
    });
  },

  async changePassword(currentPassword, newPassword) {
    return await this.request('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  },

  async logout() {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      this.clearToken();
    }
  },

  // ===========================================================
  // MODULE 2: ADMIN DASHBOARD
  // ===========================================================
  async getAdminDashboard() {
    return await this.request('/api/admin/dashboard');
  },

  async getColleges() {
    return await this.request('/api/admin/colleges');
  },

  async createCollege(collegeData) {
    return await this.request('/api/admin/colleges', {
      method: 'POST',
      body: JSON.stringify(collegeData)
    });
  },

  async updateCollege(id, collegeData) {
    return await this.request(`/api/admin/colleges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(collegeData)
    });
  },

  async deleteCollege(id) {
    return await this.request(`/api/admin/colleges/${id}`, {
      method: 'DELETE'
    });
  },

  async getCollegeWiseReport() {
    return await this.request('/api/admin/reports/college-wise');
  },

  async getEventWiseReport() {
    return await this.request('/api/admin/reports/event-wise');
  },

  async downloadExcelReport() {
    const blob = await this.request('/api/admin/reports/export-excel', { responseType: 'blob' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `melange_master_roster_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
    return true;
  },

  // ===========================================================
  // MODULE 3: COLLEGE GS DASHBOARD
  // ===========================================================
  async getGSDashboard() {
    return await this.request('/api/gs/dashboard');
  },

  async getGSProfile() {
    return await this.request('/api/gs/profile');
  },

  async updateGSProfile(profileData) {
    return await this.request('/api/gs/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  },

  async getGSParticipants(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await this.request(`/api/gs/participants${params ? '?' + params : ''}`);
  },

  async addGSParticipant(participantData) {
    return await this.request('/api/gs/participants', {
      method: 'POST',
      body: JSON.stringify(participantData)
    });
  },

  async updateGSParticipant(id, participantData) {
    return await this.request(`/api/gs/participants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(participantData)
    });
  },

  async deleteGSParticipant(id) {
    return await this.request(`/api/gs/participants/${id}`, {
      method: 'DELETE'
    });
  },

  // ===========================================================
  // MODULE 4: EVENT MANAGEMENT
  // ===========================================================
  async getEvents(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await this.request(`/api/events${params ? '?' + params : ''}`);
  },

  async getEvent(id) {
    return await this.request(`/api/events/${id}`);
  },

  async createEvent(eventData) {
    return await this.request('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData)
    });
  },

  async updateEvent(id, eventData) {
    return await this.request(`/api/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData)
    });
  },

  async deleteEvent(id) {
    return await this.request(`/api/events/${id}`, {
      method: 'DELETE'
    });
  },

  // ===========================================================
  // MODULE 5: REGISTRATION MANAGEMENT
  // ===========================================================
  async getRegistrationStats() {
    return await this.request('/api/registrations/stats');
  },

  async getRegistrations(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return await this.request(`/api/registrations${params ? '?' + params : ''}`);
  },

  async getRegistration(id) {
    return await this.request(`/api/registrations/${id}`);
  },

  async createRegistration(data) {
    return await this.request('/api/registrations', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateRegistration(id, data) {
    return await this.request(`/api/registrations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async updateRegistrationStatus(id, status) {
    return await this.request(`/api/registrations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async bulkUpdateRegistrationStatus(ids, status) {
    return await this.request('/api/registrations/bulk-status', {
      method: 'POST',
      body: JSON.stringify({ ids, status })
    });
  },

  async deleteRegistration(id) {
    return await this.request(`/api/registrations/${id}`, {
      method: 'DELETE'
    });
  },

  // ===========================================================
  // MODULE 6: REPORT MANAGEMENT
  // ===========================================================
  async getReportAnalytics() {
    return await this.request('/api/reports/analytics');
  },

  async generateReport(type, filters = {}) {
    const params = new URLSearchParams({ type, ...filters }).toString();
    return await this.request(`/api/reports/generate?${params}`);
  },

  async exportPDFReport() {
    return await this.request('/api/reports/export-pdf');
  },

  // Notifications & Announcements
  async getNotifications() {
    return await this.request('/api/notifications');
  },

  async getAnnouncements() {
    return await this.request('/api/announcements');
  }
};

window.MelangeAPI = MelangeAPI;
