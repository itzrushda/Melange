/**
 * Melange '26 - Mobile Event Management Main Controller
 * Handles UI interactions, tab routing, modals, audio synthesis, and confetti
 */

const App = {
  activeTab: 'home',
  activeZoneId: 'creative',
  selectedEvent: null,
  contingentSubView: 'students', // 'students' or 'squads'
  soundEnabled: true,
  audioCtx: null,

  init() {
    // 1. Initialize Auth and Storage
    AuthManager.init();

    // 2. Set up real-time clock in mobile status bar
    this.startClock();

    // 3. Render initial views
    this.renderHeaderGS();
    this.renderHomeTab();
    this.renderZonesTab();
    this.renderLeaderboardTab();
    this.renderContingentTab();
    this.renderGSProfileTab();
    this.renderAnnouncements();
    this.updateContingentBadge();

    // 4. Bind event listeners
    this.bindEvents();

    // 5. If not logged in, prompt GS Login
    if (!AuthManager.isLoggedIn()) {
      // Auto-login with COEP as default or show login prompt
      setTimeout(() => {
        this.openModal('loginModal');
      }, 400);
    } else {
      this.showToast(`Welcome back, GS ${AuthManager.getCurrentGS().gsName}!`, 'success');
    }
  },

  /* -------------------------------------------------------------
     Audio Synthesizer (Web Audio API - Zero dependencies)
     ------------------------------------------------------------- */
  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  },

  playSound(type = 'click') {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const now = this.audioCtx.currentTime;

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(480, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'success') {
        // High celebratory chime
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const noteOsc = this.audioCtx.createOscillator();
          const noteGain = this.audioCtx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(this.audioCtx.destination);

          const startTime = now + i * 0.08;
          noteOsc.type = 'triangle';
          noteOsc.frequency.setValueAtTime(freq, startTime);
          noteGain.gain.setValueAtTime(0.15, startTime);
          noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

          noteOsc.start(startTime);
          noteOsc.stop(startTime + 0.25);
        });
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  },

  /* -------------------------------------------------------------
     Mobile Status Bar Real-time Clock
     ------------------------------------------------------------- */
  startClock() {
    const update = () => {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      const timeStr = `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
      const elem = document.getElementById('mobileTime');
      if (elem) elem.textContent = timeStr;
    };
    update();
    setInterval(update, 10000);
  },

  /* -------------------------------------------------------------
     Header GS Pill & State
     ------------------------------------------------------------- */
  renderHeaderGS() {
    const pill = document.getElementById('headerGSPill');
    const gs = AuthManager.getCurrentGS();

    if (!pill) return;

    if (gs) {
      pill.innerHTML = `
        <span style="font-size:0.9rem">${gs.avatar}</span>
        <span>${gs.shortCode} GS</span>
        <i class="fa-solid fa-circle-check" style="color:#10b981;font-size:0.65rem;"></i>
      `;
      pill.onclick = () => {
        this.switchTab('gs');
      };
    } else {
      pill.innerHTML = `
        <i class="fa-solid fa-lock" style="color:#f59e0b;"></i>
        <span>GS Login</span>
      `;
      pill.onclick = () => {
        this.openModal('loginModal');
      };
    }
  },

  updateContingentBadge() {
    const badge = document.getElementById('navContingentBadge');
    if (!badge) return;

    const gs = AuthManager.getCurrentGS();
    if (gs) {
      const regs = ContingentManager.getCollegeRegistrations(gs.id);
      badge.textContent = regs.length;
      badge.style.display = regs.length > 0 ? 'inline-block' : 'none';
    } else {
      badge.style.display = 'none';
    }
  },

  /* -------------------------------------------------------------
     Tab Switching Navigation
     ------------------------------------------------------------- */
  switchTab(tabName) {
    this.playSound('click');
    this.activeTab = tabName;

    // Update bottom nav active state
    document.querySelectorAll('.nav-item').forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Toggle panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });

    const targetPane = document.getElementById(`tab-${tabName}`);
    if (targetPane) {
      targetPane.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Refresh data in view if needed
    if (tabName === 'home') this.renderHomeTab();
    if (tabName === 'zones') this.renderZonesTab();
    if (tabName === 'standings') this.renderLeaderboardTab();
    if (tabName === 'contingent') this.renderContingentTab();
    if (tabName === 'gs') this.renderGSProfileTab();
    if (tabName === 'admin') this.renderAdminDashboard();
  },

  /* -------------------------------------------------------------
     Home Tab Rendering
     ------------------------------------------------------------- */
  renderHomeTab() {
    const gs = AuthManager.getCurrentGS();
    const gsStatusContainer = document.getElementById('homeGSStatusWrap');
    
    if (gsStatusContainer) {
      if (gs) {
        const regs = ContingentManager.getCollegeRegistrations(gs.id);
        const myRankData = ContingentManager.getLeaderboard().find(c => c.id === gs.id);
        const rank = ContingentManager.getLeaderboard().findIndex(c => c.id === gs.id) + 1;

        gsStatusContainer.innerHTML = `
          <div class="gs-status-card authorized">
            <div class="gs-status-header">
              <div class="gs-title-wrap">
                <span class="gs-avatar-badge">${gs.avatar}</span>
                <div>
                  <div class="gs-college-name">${gs.name}</div>
                  <div class="gs-officer-name">GS: ${gs.gsName} • ${gs.gsCode}</div>
                </div>
              </div>
              <span class="badge-auth-lock"><i class="fa-solid fa-shield-halved"></i> Verified GS</span>
            </div>
            <div class="metrics-grid">
              <div class="metric-box">
                <div class="metric-val" style="color:#10b981;">#${rank}</div>
                <div class="metric-label">Fest Rank</div>
              </div>
              <div class="metric-box">
                <div class="metric-val" style="color:#38bdf8;">${regs.length}/16</div>
                <div class="metric-label">Events Booked</div>
              </div>
              <div class="metric-box">
                <div class="metric-val" style="color:#f59e0b;">${myRankData ? myRankData.totalScore : gs.basePoints}</div>
                <div class="metric-label">Contingent Pts</div>
              </div>
            </div>
            <button class="btn-primary" style="margin-top:10px; padding:10px 14px; font-size:0.82rem; font-weight:800; background:linear-gradient(135deg, #10b981, #059669);" onclick="App.openAddStudentModal()">
              <i class="fa-solid fa-list-check"></i> Select Event & Enter Students (GS Desk)
            </button>
          </div>
        `;
      } else {
        gsStatusContainer.innerHTML = `
          <div class="gs-status-card" style="border-left: 4px solid #f59e0b; cursor:pointer;" onclick="App.openModal('loginModal')">
            <div class="gs-status-header" style="margin-bottom:4px;">
              <div class="gs-title-wrap">
                <span style="font-size:1.3rem;">🔐</span>
                <div>
                  <div class="gs-college-name">General Secretary Portal Restricted</div>
                  <div class="gs-officer-name" style="color:#cbd5e1;">Only verified college GS can register squads</div>
                </div>
              </div>
            </div>
            <button class="btn-primary" style="margin-top:8px; padding:8px 12px; font-size:0.75rem;">
              <i class="fa-solid fa-right-to-bracket"></i> Login as College GS
            </button>
          </div>
        `;
      }
    }

    // Render Pinned GS Event Participation Desk (Dropdown-first)
    this.renderGSEventParticipationDesk();

    // Render Quick Zone Highlights
    const quickZonesWrap = document.getElementById('homeQuickZones');
    if (quickZonesWrap) {
      quickZonesWrap.innerHTML = MELANGE_DATA.zones.map(z => {
        const zoneEvents = MELANGE_DATA.events.filter(e => e.zoneId === z.id);
        return `
          <div class="zone-spotlight-card" style="background: linear-gradient(135deg, rgba(10,15,27,0.85) 0%, rgba(13,20,36,0.92) 100%), url('${z.image}') center/cover; cursor:pointer;" onclick="App.selectZoneAndNavigate('${z.id}')">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
              <span class="zone-spotlight-badge" style="border-left: 3px solid ${z.themeColor}; color:${z.themeColor};">
                ${z.number} • ${zoneEvents.length} Events
              </span>
              <span style="font-size:1.1rem; color:${z.themeColor}; background:rgba(0,0,0,0.5); width:34px; height:34px; display:inline-flex; align-items:center; justify-content:center; border-radius:var(--radius-full);">
                <i class="fa-solid fa-${z.icon}"></i>
              </span>
            </div>
            <h3 class="zone-spotlight-title" style="font-size:1.15rem;">${z.name}</h3>
            <p class="zone-spotlight-desc" style="margin-bottom:8px;">${z.subtitle}</p>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.78rem; color:#cbd5e1;">
              <span><i class="fa-solid fa-location-dot" style="color:${z.themeColor};"></i> ${z.venue}</span>
              <span style="color:#fff; font-weight:700; background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:12px;">Explore <i class="fa-solid fa-arrow-right"></i></span>
            </div>
          </div>
        `;
      }).join('');
    }

    // Render Featured Schedule / Day Highlights
    const featuredWrap = document.getElementById('homeFeaturedEvents');
    if (featuredWrap) {
      // Pick 3 high-profile events
      const featured = [MELANGE_DATA.events[0], MELANGE_DATA.events[4], MELANGE_DATA.events[7]];
      featuredWrap.innerHTML = featured.map(e => this.renderEventCardHtml(e)).join('');
    }
  },

  renderAnnouncements() {
    const listWrap = document.getElementById('announcementsListWrap');
    if (!listWrap) return;
    const announcements = MELANGE_DATA.announcements;
    listWrap.innerHTML = announcements.map(ann => `
      <div style="background:rgba(255,255,255,0.04); border:1px solid ${ann.urgent ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}; border-radius:var(--radius-sm); padding:12px 14px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <span style="font-size:0.72rem; font-weight:800; color:${ann.urgent ? '#f59e0b' : '#38bdf8'}; text-transform:uppercase;">
            ${ann.zone}
          </span>
          <span style="font-size:0.7rem; color:var(--text-sub);">${ann.time}</span>
        </div>
        <h4 style="font-size:0.9rem; font-weight:700; color:#fff; margin-bottom:4px;">${ann.title}</h4>
        <p style="font-size:0.82rem; color:var(--text-muted); line-height:1.45;">${ann.body}</p>
      </div>
    `).join('');
  },

  selectZoneAndNavigate(zoneId) {
    this.activeZoneId = zoneId;
    this.switchTab('zones');
  },

  /* -------------------------------------------------------------
     Zones Tab Rendering
     ------------------------------------------------------------- */
  renderZonesTab() {
    // 1. Render Zone Switcher Pills
    const pillsWrap = document.getElementById('zonesPillsScroll');
    if (pillsWrap) {
      pillsWrap.innerHTML = MELANGE_DATA.zones.map(z => `
        <div class="zone-mini-pill ${z.id === this.activeZoneId ? 'active' : ''}" onclick="App.changeActiveZone('${z.id}')">
          <div class="zone-pill-icon" style="background:${z.themeColor}22; color:${z.themeColor};">
            <i class="fa-solid fa-${z.icon}"></i>
          </div>
          <span class="zone-pill-name">${z.name.replace(/Zone \d+: /, '')}</span>
        </div>
      `).join('');
    }

    // 2. Render Zone Spotlight Details
    const curZone = MELANGE_DATA.zones.find(z => z.id === this.activeZoneId) || MELANGE_DATA.zones[0];
    const spotlightWrap = document.getElementById('zoneSpotlightDetails');
    if (spotlightWrap) {
      spotlightWrap.innerHTML = `
        <div class="zone-spotlight-card" style="background: linear-gradient(135deg, rgba(10,15,27,0.85) 0%, rgba(13,20,36,0.92) 100%), url('${curZone.image}') center/cover; border-color:${curZone.themeColor}55;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span class="zone-spotlight-badge" style="border-left: 3px solid ${curZone.themeColor}; color:${curZone.themeColor};">
              ${curZone.number}
            </span>
            <span style="font-size:0.75rem; color:#cbd5e1; background:rgba(0,0,0,0.5); padding:3px 8px; border-radius:10px;"><i class="fa-solid fa-location-dot" style="color:${curZone.themeColor};"></i> ${curZone.venue}</span>
          </div>
          <h2 class="zone-spotlight-title">${curZone.name}</h2>
          <p class="zone-spotlight-desc">${curZone.description}</p>
          <div class="zone-coord-info">
            <i class="fa-solid fa-phone" style="color:${curZone.themeColor};"></i>
            <span><strong>Coordinator:</strong> ${curZone.headCoordinator}</span>
          </div>
        </div>
      `;
    }

    // 3. Render Zone Events List (3-4 events)
    const eventsListWrap = document.getElementById('zoneEventsList');
    if (eventsListWrap) {
      const zoneEvents = MELANGE_DATA.events.filter(e => e.zoneId === this.activeZoneId);
      eventsListWrap.innerHTML = zoneEvents.map(e => this.renderEventCardHtml(e)).join('');
    }
  },

  changeActiveZone(zoneId) {
    this.playSound('click');
    this.activeZoneId = zoneId;
    this.renderZonesTab();
  },

  /**
   * Helper to generate Event Card HTML with Cover Photography
   */
  renderEventCardHtml(event) {
    const gs = AuthManager.getCurrentGS();
    const isRegistered = gs ? ContingentManager.isRegistered(gs.id, event.id) : null;
    const zone = MELANGE_DATA.zones.find(z => z.id === event.zoneId);

    return `
      <div class="event-card ${isRegistered ? 'registered-by-us' : ''}" onclick="App.openEventDetails('${event.id}')">
        <!-- Event Cover Photography Media -->
        <div class="event-card-media">
          <img src="${event.image}" alt="${event.title}" class="event-media-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80'" />
          <div class="event-media-overlay"></div>
          
          <div class="event-media-top">
            <span class="event-badge-tag" style="border-left: 2px solid ${zone ? zone.themeColor : '#6366f1'};">
              ${event.badge}
            </span>
            ${isRegistered ? `
              <span class="event-reg-badge confirmed">
                <i class="fa-solid fa-circle-check"></i> ${isRegistered.slotNumber}
              </span>
            ` : `
              <span class="event-reg-badge open">
                <i class="fa-solid fa-circle-dot" style="font-size:0.55rem;"></i> Slot Open
              </span>
            `}
          </div>

          <div class="event-media-bottom">
            <span class="event-prize-chip">
              <i class="fa-solid fa-trophy"></i> 1st: ${event.pointsFirst} pts • ${event.prizePool}
            </span>
          </div>
        </div>

        <!-- Event Details Body -->
        <div class="event-card-body">
          <h3 class="event-title">
            <span>${event.title}</span>
            <span class="event-subtitle">${event.tag}</span>
          </h3>
          <p class="event-tagline">${event.description.substring(0, 85)}...</p>

          <div class="event-details-row">
            <div class="detail-chip">
              <i class="fa-regular fa-clock" style="color:#38bdf8;"></i>
              <span>${event.schedule.split('-')[0].trim()}</span>
            </div>
            <div class="detail-chip">
              <i class="fa-solid fa-location-dot" style="color:#f43f5e;"></i>
              <span>${event.venue.split('(')[0].trim()}</span>
            </div>
            <div class="detail-chip">
              <i class="fa-solid fa-users" style="color:#10b981;"></i>
              <span>${event.minMembers === event.maxMembers ? `${event.minMembers} Pers` : `${event.minMembers}-${event.maxMembers} Pers`}</span>
            </div>
          </div>

          <div class="event-footer-action">
            <span style="font-size:0.75rem; color:#94a3b8; font-weight:600;">
              <i class="fa-solid fa-calendar-day" style="color:var(--accent-primary); margin-right:4px;"></i>${event.day}
            </span>
            <div>
              ${isRegistered ? `
                <button class="btn-card-action btn-view-pass" onclick="event.stopPropagation(); App.viewPass('${isRegistered.registrationId}')">
                  <i class="fa-solid fa-qrcode"></i> Digital Pass
                </button>
              ` : `
                <button class="btn-card-action btn-register" onclick="event.stopPropagation(); App.openRegisterModal('${event.id}')">
                  <i class="fa-solid fa-plus"></i> Register Squad
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  /* -------------------------------------------------------------
     Leaderboard / Standings Tab Rendering
     ------------------------------------------------------------- */
  renderLeaderboardTab() {
    const list = ContingentManager.getLeaderboard();
    const currentGS = AuthManager.getCurrentGS();

    // Podium (Top 3)
    const podiumWrap = document.getElementById('leaderboardPodiumWrap');
    if (podiumWrap && list.length >= 3) {
      podiumWrap.innerHTML = `
        <!-- Rank 2: Silver -->
        <div class="podium-slot rank-2">
          <div class="podium-avatar">${list[1].avatar}</div>
          <div class="podium-name">${list[1].shortCode}</div>
          <div class="podium-score">${list[1].totalScore} pts</div>
          <div class="podium-block">2nd</div>
        </div>

        <!-- Rank 1: Gold -->
        <div class="podium-slot rank-1">
          <div style="color:#f59e0b; font-size:1.1rem; margin-bottom:2px;"><i class="fa-solid fa-crown"></i></div>
          <div class="podium-avatar">${list[0].avatar}</div>
          <div class="podium-name">${list[0].shortCode}</div>
          <div class="podium-score">${list[0].totalScore} pts</div>
          <div class="podium-block">1st</div>
        </div>

        <!-- Rank 3: Bronze -->
        <div class="podium-slot rank-3">
          <div class="podium-avatar">${list[2].avatar}</div>
          <div class="podium-name">${list[2].shortCode}</div>
          <div class="podium-score">${list[2].totalScore} pts</div>
          <div class="podium-block">3rd</div>
        </div>
      `;
    }

    // Complete Standings Table
    const standingsListWrap = document.getElementById('standingsListWrap');
    if (standingsListWrap) {
      standingsListWrap.innerHTML = list.map((col, idx) => {
        const isCurrent = currentGS && currentGS.id === col.id;
        let rankClass = '';
        if (idx === 0) rankClass = 'gold';
        if (idx === 1) rankClass = 'silver';
        if (idx === 2) rankClass = 'bronze';

        return `
          <div class="standing-card ${isCurrent ? 'is-current-college' : ''}">
            <div class="standing-left">
              <span class="standing-rank ${rankClass}">#${idx + 1}</span>
              <span style="font-size:1.3rem;">${col.avatar}</span>
              <div class="standing-info">
                <h4>
                  ${col.shortCode}
                  ${isCurrent ? '<span style="font-size:0.6rem; background:rgba(99,102,241,0.3); color:#fff; padding:1px 5px; border-radius:4px;">YOU</span>' : ''}
                </h4>
                <span>${col.name.length > 25 ? col.name.substring(0, 25) + '...' : col.name} • ${col.city}</span>
              </div>
            </div>

            <div class="standing-score-wrap">
              <div class="standing-points">${col.totalScore}</div>
              <div class="standing-pts-sub">${col.registeredEventsCount} events • ${col.totalParticipantsCount} delegates</div>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  /* -------------------------------------------------------------
     Contingent (My Contingent) Tab Rendering
     ------------------------------------------------------------- */
  renderContingentTab() {
    const gs = AuthManager.getCurrentGS();
    const contingentView = document.getElementById('contingentViewWrap');
    if (!contingentView) return;

    if (!gs) {
      contingentView.innerHTML = `
        <div class="contingent-empty-state">
          <div class="empty-state-icon">🛡️</div>
          <h3 style="font-size:1rem; color:#fff; margin-bottom:6px;">GS Authentication Required</h3>
          <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:16px;">
            Only the General Secretary of your college can access the official contingent roster and digital event entry passes.
          </p>
          <button class="btn-primary" onclick="App.openModal('loginModal')">
            <i class="fa-solid fa-lock"></i> Login with GS Credentials
          </button>
        </div>
      `;
      return;
    }

    const regs = ContingentManager.getCollegeRegistrations(gs.id);
    const students = ContingentManager.getCollegeStudents(gs.id);

    let html = `
      <!-- GS Contingent Header Banner -->
      <div class="hero-banner" style="margin-bottom:14px; background:linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.15)), #131b2e;">
        <div class="hero-tag" style="color:#10b981; border-color:rgba(16,185,129,0.3);">
          <i class="fa-solid fa-shield-halved"></i> GS Data Entry Desk
        </div>
        <h2 class="hero-title">${gs.name}</h2>
        <div class="hero-sub">Authorizing GS: <strong>${gs.gsName}</strong> (${gs.gsCode})</div>
        
        <div class="hero-meta-row">
          <div class="meta-item">
            <span class="meta-label">Total Students Entered</span>
            <span class="meta-val" style="color:#10b981;">${students.length} Students</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Events Booked</span>
            <span class="meta-val" style="color:#38bdf8;">${regs.length}/16</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Contingent Code</span>
            <span class="meta-val" style="color:#f59e0b;">${gs.shortCode}-DELEGATE</span>
          </div>
        </div>
      </div>

      <!-- Prominent Student Entry CTA for GS -->
      <div style="display:flex; gap:8px; margin-bottom:14px;">
        <button class="btn-primary" style="flex:1; padding:10px 14px; font-size:0.78rem;" onclick="App.openAddStudentModal()">
          <i class="fa-solid fa-user-plus"></i> + Enter New Student Data (GS Only)
        </button>
        <button class="btn-secondary" style="margin-top:0; width:auto; padding:10px 14px; font-size:0.78rem;" onclick="App.exportContingentSummary()" title="Export Student Roster">
          <i class="fa-solid fa-file-arrow-down"></i>
        </button>
      </div>

      <!-- Sub-view Switcher: Students vs Squads -->
      <div style="display:flex; gap:8px; margin-bottom:14px; background:rgba(255,255,255,0.04); padding:4px; border-radius:var(--radius-full); border:1px solid var(--border-glass);">
        <button class="tool-btn ${this.contingentSubView === 'students' ? 'active' : ''}" style="flex:1; justify-content:center; padding:6px 10px;" onclick="App.switchContingentSubView('students')">
          <i class="fa-solid fa-users"></i> Enrolled Students (${students.length})
        </button>
        <button class="tool-btn ${this.contingentSubView === 'squads' ? 'active' : ''}" style="flex:1; justify-content:center; padding:6px 10px;" onclick="App.switchContingentSubView('squads')">
          <i class="fa-solid fa-ticket"></i> Event Squads (${regs.length})
        </button>
      </div>
    `;

    if (this.contingentSubView === 'students') {
      // -------------------------------------------------------------
      // SUB-VIEW 1: INDIVIDUAL STUDENTS ROSTER ENTERED BY GS
      // -------------------------------------------------------------
      if (students.length === 0) {
        html += `
          <div class="contingent-empty-state">
            <div class="empty-state-icon">📝</div>
            <h3 style="font-size:0.95rem; color:#fff; margin-bottom:4px;">No Students Entered Yet</h3>
            <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:14px;">
              As the General Secretary, enter your college student participants who want to compete in Creative, Thinking, Entertainment, or Discover zones.
            </p>
            <button class="btn-primary" onclick="App.openAddStudentModal()">
              <i class="fa-solid fa-user-plus"></i> Enter Student Data Now
            </button>
          </div>
        `;
      } else {
        html += `
          <div class="section-header">
            <span class="section-title"><i class="fa-solid fa-id-card"></i> College Student Participants (${students.length})</span>
            <span style="font-size:0.75rem; color:#10b981; font-weight:700;"><i class="fa-solid fa-shield"></i> GS Verified</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px;">
        `;

        students.forEach((stu, idx) => {
          const ev = MELANGE_DATA.events.find(e => e.id === stu.assignedEventId);
          const zone = ev ? MELANGE_DATA.zones.find(z => z.id === ev.zoneId) : null;

          html += `
            <div class="contingent-entry-card" style="padding:12px 14px;">
              <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
                <div>
                  <span style="font-size:0.95rem; font-weight:800; color:#fff;">${stu.name}</span>
                  <span style="font-size:0.78rem; font-family:var(--font-mono); color:var(--accent-cyan); margin-left:6px;">(${stu.rollNo})</span>
                </div>
                <span class="member-chip" style="background:${zone ? zone.themeColor : '#6366f1'}22; color:${zone ? zone.themeColor : '#38bdf8'}; font-weight:700; font-size:0.75rem;">
                  ${stu.role}
                </span>
              </div>

              <div style="font-size:0.8rem; color:#cbd5e1; margin-bottom:8px;">
                <span style="color:#94a3b8;">${stu.dept} • ${stu.year}</span> • <span>📞 ${stu.phone}</span>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:8px; font-size:0.78rem;">
                <span style="color:#e2e8f0;">
                  <i class="fa-solid fa-${zone ? zone.icon : 'star'}" style="color:${zone ? zone.themeColor : '#f59e0b'}; margin-right:4px;"></i>
                  <strong>${ev ? ev.title : stu.assignedEventId}</strong> (${zone ? zone.name : ''})
                </span>
                <button class="btn-card-action" style="padding:4px 10px; font-size:0.72rem; background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3);" onclick="App.deleteStudentEntry('${stu.studentId}', '${stu.name}')">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          `;
        });

        html += `</div>`;
      }
    } else {
      // -------------------------------------------------------------
      // SUB-VIEW 2: CONFIRMED EVENT SQUADS & PASSES
      // -------------------------------------------------------------
      if (regs.length === 0) {
        html += `
          <div class="contingent-empty-state">
            <div class="empty-state-icon">📋</div>
            <h3 style="font-size:0.95rem; color:#fff; margin-bottom:4px;">No Squads Registered Yet</h3>
            <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:14px;">
              Enter students or explore the 4 festival zones to lock slots for your college teams.
            </p>
            <button class="btn-primary" onclick="App.switchTab('zones')">
              <i class="fa-solid fa-compass"></i> Explore Zones
            </button>
          </div>
        `;
      } else {
        html += `
          <div class="section-header">
            <span class="section-title"><i class="fa-solid fa-id-badge"></i> Confirmed Event Squads (${regs.length})</span>
            <span class="section-link" onclick="App.exportContingentSummary()"><i class="fa-solid fa-file-arrow-down"></i> Export Roster</span>
          </div>
          <div class="contingent-entries-list">
        `;

        regs.forEach(reg => {
          const ev = MELANGE_DATA.events.find(e => e.id === reg.eventId);
          const zone = ev ? MELANGE_DATA.zones.find(z => z.id === ev.zoneId) : null;

          html += `
            <div class="contingent-entry-card">
              <div class="entry-card-top">
                <span class="entry-slot-tag">${reg.slotNumber}</span>
                <span style="font-size:0.75rem; color:#10b981; font-weight:700;"><i class="fa-solid fa-circle-check"></i> ${reg.status}</span>
              </div>

              <div class="entry-team-name">${reg.teamName}</div>
              <div class="entry-event-name">
                <i class="fa-solid fa-${zone ? zone.icon : 'star'}" style="color:${zone ? zone.themeColor : '#f59e0b'};"></i>
                ${ev ? ev.title : reg.eventId} (${zone ? zone.name : ''})
              </div>

              <div style="font-size:0.8rem; color:#94a3b8; margin-bottom:8px;">
                <strong>Team Captain:</strong> ${reg.teamLeader} • ${reg.contactPhone}
              </div>

              <div class="entry-members-list">
                ${(reg.members || []).map(m => `<span class="member-chip"><i class="fa-solid fa-user" style="font-size:0.65rem;"></i> ${m}</span>`).join('')}
              </div>

              <div class="entry-card-actions">
                <button class="btn-card-action btn-view-pass" onclick="App.viewPass('${reg.registrationId}')">
                  <i class="fa-solid fa-qrcode"></i> Digital Pass & QR
                </button>
                <button class="btn-card-action" style="background:rgba(239,68,68,0.15); color:#ef4444; border:1px solid rgba(239,68,68,0.3);" onclick="App.promptCancelRegistration('${reg.registrationId}', '${reg.teamName}')">
                  <i class="fa-solid fa-trash-can"></i> Withdraw
                </button>
              </div>
            </div>
          `;
        });

        html += `</div>`;
      }
    }

    contingentView.innerHTML = html;
  },

  switchContingentSubView(subView) {
    this.playSound('click');
    this.contingentSubView = subView;
    this.renderContingentTab();
  },

  /* -------------------------------------------------------------
     GS Event Participation Desk & Student Data Entry Methods
     Flow: Dropdown First -> Event Details -> Fill Student Data
     ------------------------------------------------------------- */
  modalSelectedEventId: 'creative-editing',
  modalStudentSlots: 1,
  homeDeskSelectedEventId: 'creative-editing',

  openAddStudentModal(preSelectedEventId = null) {
    this.playSound('click');
    const gs = AuthManager.getCurrentGS();
    if (!gs) {
      this.showToast('Please log in as General Secretary to enter student data.', 'error');
      this.openModal('loginModal');
      return;
    }

    let targetEvent = MELANGE_DATA.events.find(e => e.id === preSelectedEventId);
    if (!targetEvent) {
      targetEvent = MELANGE_DATA.events.find(e => e.id === this.modalSelectedEventId) || MELANGE_DATA.events[0];
    }
    this.modalSelectedEventId = targetEvent.id;
    this.populateModalEventDropdown(this.modalSelectedEventId);
    this.onModalEventDropdownChange(this.modalSelectedEventId);
    this.openModal('addStudentModal');
  },

  populateModalEventDropdown(selectedId) {
    const select = document.getElementById('modalEventSelectDropdown');
    if (!select) return;

    let html = '';
    MELANGE_DATA.zones.forEach(zone => {
      const zEvents = MELANGE_DATA.events.filter(e => e.zoneId === zone.id);
      html += `<optgroup label="${zone.name} (${zEvents.length} Events)">`;
      zEvents.forEach(ev => {
        const isSel = ev.id === selectedId ? 'selected' : '';
        html += `<option value="${ev.id}" ${isSel}>${ev.title} — [${ev.tag}]</option>`;
      });
      html += `</optgroup>`;
    });

    select.innerHTML = html;
  },

  onModalEventDropdownChange(eventId) {
    const event = MELANGE_DATA.events.find(e => e.id === eventId) || MELANGE_DATA.events[0];
    this.modalSelectedEventId = event.id;

    const zone = MELANGE_DATA.zones.find(z => z.id === event.zoneId);
    const gs = AuthManager.getCurrentGS();
    const isReg = gs ? ContingentManager.isRegistered(gs.id, event.id) : null;

    // Render Event Snapshot Preview
    const previewWrap = document.getElementById('modalEventSnapshot');
    if (previewWrap) {
      previewWrap.innerHTML = `
        <div style="background:var(--bg-card); border:1px solid ${zone ? zone.themeColor : '#6366f1'}55; border-radius:var(--radius-md); overflow:hidden; display:flex; gap:10px; align-items:center; padding:10px;">
          <img src="${event.image}" alt="${event.title}" style="width:72px; height:72px; border-radius:6px; object-fit:cover; flex-shrink:0;" onerror="this.src='https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80'" />
          <div style="flex:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:2px;">
              <span style="font-size:0.68rem; font-weight:800; color:${zone ? zone.themeColor : '#38bdf8'}; text-transform:uppercase;">${zone ? zone.name : ''} • ${event.badge}</span>
              ${isReg ? `<span style="font-size:0.68rem; font-weight:800; color:#10b981; background:rgba(16,185,129,0.2); padding:2px 6px; border-radius:4px;"><i class="fa-solid fa-check"></i> Already Registered</span>` : `<span style="font-size:0.68rem; font-weight:700; color:#38bdf8; background:rgba(56,189,248,0.15); padding:2px 6px; border-radius:4px;">Slot Open</span>`}
            </div>
            <div style="font-size:0.95rem; font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${event.title}</div>
            <div style="font-size:0.75rem; color:#cbd5e1; margin-top:2px;">
              <span><i class="fa-solid fa-users" style="color:#10b981;"></i> Required: ${event.minMembers === event.maxMembers ? `${event.minMembers} Student(s)` : `${event.minMembers} to ${event.maxMembers} Students`}</span>
            </div>
            <div style="font-size:0.72rem; color:#94a3b8; margin-top:2px;">
              <span><i class="fa-regular fa-clock" style="color:#38bdf8;"></i> ${event.schedule.split('-')[0].trim()}</span> • 
              <span><i class="fa-solid fa-trophy" style="color:#f59e0b;"></i> 1st: ${event.pointsFirst} pts</span>
            </div>
          </div>
        </div>
      `;
    }

    const badge = document.getElementById('modalSquadSizeBadge');
    if (badge) {
      badge.textContent = `Req: ${event.minMembers === event.maxMembers ? event.minMembers : `${event.minMembers}-${event.maxMembers}`} Students`;
    }

    // Reset slot count to minMembers (at least 1)
    this.modalStudentSlots = Math.max(1, event.minMembers);
    this.renderModalStudentSlots();
  },

  renderModalStudentSlots() {
    const wrap = document.getElementById('modalStudentsListWrap');
    if (!wrap) return;

    const event = MELANGE_DATA.events.find(e => e.id === this.modalSelectedEventId) || MELANGE_DATA.events[0];
    let html = '';

    for (let i = 1; i <= this.modalStudentSlots; i++) {
      const isLead = i === 1;
      const isMandatory = i <= event.minMembers;

      html += `
        <div class="modal-student-slot-box" style="background:rgba(255,255,255,0.03); border:1px solid ${isLead ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}; border-radius:var(--radius-sm); padding:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:0.78rem; font-weight:800; color:${isLead ? 'var(--accent-primary)' : '#cbd5e1'};">
              <i class="fa-solid fa-user"></i> Student #${i} ${isLead ? '(Lead Participant)' : ''} ${isMandatory ? '<span style="color:#ef4444;">*</span>' : '(Optional)'}
            </span>
            ${!isMandatory ? `
              <button type="button" style="background:none; border:none; color:#ef4444; font-size:0.75rem; cursor:pointer;" onclick="App.removeModalStudentSlot(${i})">
                <i class="fa-solid fa-trash"></i> Remove
              </button>
            ` : ''}
          </div>

          <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:8px; margin-bottom:8px;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:0.7rem;">Full Name ${isMandatory ? '<span style="color:#ef4444;">*</span>' : ''}</label>
              <input type="text" class="form-input modal-stu-name" placeholder="Student Full Name" ${isMandatory ? 'required' : ''} />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:0.7rem;">Roll No / PRN ${isMandatory ? '<span style="color:#ef4444;">*</span>' : ''}</label>
              <input type="text" class="form-input modal-stu-roll" placeholder="e.g. 112104052" ${isMandatory ? 'required' : ''} />
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-bottom:8px;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:0.7rem;">Department</label>
              <input type="text" class="form-input modal-stu-dept" placeholder="e.g. Computer Science" />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:0.7rem;">Academic Year</label>
              <select class="form-select modal-stu-year" style="font-size:14px; min-height:42px;">
                <option value="1st Year">1st Year</option>
                <option value="2nd Year" selected>2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1.2fr 1fr; gap:8px;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:0.7rem;">WhatsApp Phone ${isMandatory ? '<span style="color:#ef4444;">*</span>' : ''}</label>
              <input type="tel" class="form-input modal-stu-phone" placeholder="+91 98765 43210" ${isMandatory ? 'required' : ''} />
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label" style="font-size:0.7rem;">Role / Specialization</label>
              <input type="text" class="form-input modal-stu-role" placeholder="${isLead ? 'Team Leader' : 'Participant'}" value="${isLead ? 'Team Leader' : 'Squad Member'}" />
            </div>
          </div>
        </div>
      `;
    }

    wrap.innerHTML = html;

    // Toggle "+ Add Another Student" button
    const addBtn = document.getElementById('modalBtnAddSlot');
    if (addBtn) {
      if (this.modalStudentSlots < event.maxMembers) {
        addBtn.style.display = 'block';
        addBtn.innerHTML = `<i class="fa-solid fa-user-plus"></i> + Add Student #${this.modalStudentSlots + 1} (Allowed: up to ${event.maxMembers})`;
      } else {
        addBtn.style.display = 'none';
      }
    }
  },

  addAdditionalStudentSlot() {
    this.playSound('click');
    const event = MELANGE_DATA.events.find(e => e.id === this.modalSelectedEventId);
    if (!event) return;

    if (this.modalStudentSlots < event.maxMembers) {
      this.modalStudentSlots++;
      this.renderModalStudentSlots();
    } else {
      this.showToast(`Maximum ${event.maxMembers} students allowed for ${event.title}.`, 'error');
    }
  },

  removeModalStudentSlot(slotIndex) {
    this.playSound('click');
    if (this.modalStudentSlots > 1) {
      this.modalStudentSlots--;
      this.renderModalStudentSlots();
    }
  },

  handleModalStudentBatchSubmit() {
    const gs = AuthManager.getCurrentGS();
    if (!gs) {
      this.showToast('GS session expired. Please log in again.', 'error');
      this.openModal('loginModal');
      return;
    }

    const eventId = this.modalSelectedEventId;
    const teamName = (document.getElementById('modalSquadAlias')?.value || '').trim();

    const nameInputs = document.querySelectorAll('.modal-stu-name');
    const rollInputs = document.querySelectorAll('.modal-stu-roll');
    const deptInputs = document.querySelectorAll('.modal-stu-dept');
    const yearInputs = document.querySelectorAll('.modal-stu-year');
    const phoneInputs = document.querySelectorAll('.modal-stu-phone');
    const roleInputs = document.querySelectorAll('.modal-stu-role');

    const studentsList = [];
    for (let i = 0; i < nameInputs.length; i++) {
      const name = (nameInputs[i]?.value || '').trim();
      const rollNo = (rollInputs[i]?.value || '').trim();
      const dept = (deptInputs[i]?.value || '').trim();
      const year = (yearInputs[i]?.value || '2nd Year').trim();
      const phone = (phoneInputs[i]?.value || '').trim();
      const role = (roleInputs[i]?.value || '').trim();

      if (name && rollNo && phone) {
        studentsList.push({ name, rollNo, dept, year, phone, role });
      }
    }

    if (studentsList.length === 0) {
      this.showToast('Please provide details for at least one student.', 'error');
      return;
    }

    const res = ContingentManager.addMultipleStudentsForEvent(gs.id, eventId, teamName, studentsList);

    if (res.success) {
      this.closeModal('addStudentModal');
      this.playSound('success');
      this.triggerConfetti();
      this.showToast(`✅ ${res.message}`, 'success');

      // Refresh all tabs
      this.renderHomeTab();
      this.renderZonesTab();
      this.renderContingentTab();
      this.renderLeaderboardTab();
      this.updateContingentBadge();

      // Show digital pass
      if (res.registration) {
        setTimeout(() => {
          this.viewPass(res.registration.registrationId);
        }, 400);
      }
    } else {
      this.showToast(res.message, 'error');
    }
  },

  /* -------------------------------------------------------------
     Home Tab GS Event Participation Desk Component
     ------------------------------------------------------------- */
  renderGSEventParticipationDesk() {
    const wrap = document.getElementById('homeGSEventEntryDesk');
    if (!wrap) return;

    const gs = AuthManager.getCurrentGS();
    if (!gs) {
      wrap.innerHTML = '';
      return;
    }

    const curEvent = MELANGE_DATA.events.find(e => e.id === this.homeDeskSelectedEventId) || MELANGE_DATA.events[0];
    const zone = MELANGE_DATA.zones.find(z => z.id === curEvent.zoneId);
    const isReg = ContingentManager.isRegistered(gs.id, curEvent.id);

    let selectOptionsHtml = '';
    MELANGE_DATA.zones.forEach(z => {
      const zEvents = MELANGE_DATA.events.filter(e => e.zoneId === z.id);
      selectOptionsHtml += `<optgroup label="${z.name} (${zEvents.length} Events)">`;
      zEvents.forEach(ev => {
        const isSel = ev.id === curEvent.id ? 'selected' : '';
        selectOptionsHtml += `<option value="${ev.id}" ${isSel}>${ev.title} (${ev.tag})</option>`;
      });
      selectOptionsHtml += `</optgroup>`;
    });

    wrap.innerHTML = `
      <div style="background:var(--bg-card); border:1px solid rgba(99,102,241,0.35); border-radius:var(--radius-md); padding:16px; box-shadow:0 6px 20px rgba(0,0,0,0.35); position:relative; overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="font-size:0.75rem; font-weight:800; text-transform:uppercase; color:#38bdf8; display:flex; align-items:center; gap:6px;">
            <i class="fa-solid fa-id-card-clip"></i> GS Event Participation Desk
          </span>
          <span style="font-size:0.7rem; color:#10b981; font-weight:700;">
            <i class="fa-solid fa-circle-check"></i> ${gs.shortCode} Authorized
          </span>
        </div>

        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label" style="font-size:0.85rem; font-weight:800; color:#fff; display:flex; align-items:center; gap:6px;">
            <i class="fa-solid fa-list-check" style="color:var(--accent-primary);"></i> Step 1: Select Event to Participate:
          </label>
          <select id="homeDeskEventSelect" class="form-select" style="font-size:16px; padding:12px 14px; font-weight:700; border-color:var(--accent-primary); background:rgba(30,41,59,0.9);" onchange="App.onHomeDeskEventChange(this.value)">
            ${selectOptionsHtml}
          </select>
        </div>

        <!-- Selected Event Snapshot Preview -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:var(--radius-sm); padding:10px; display:flex; gap:10px; align-items:center; margin-bottom:12px;">
          <img src="${curEvent.image}" alt="${curEvent.title}" style="width:68px; height:68px; border-radius:6px; object-fit:cover; flex-shrink:0;" onerror="this.src='https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=300&q=80'" />
          <div style="flex:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:2px;">
              <span style="font-size:0.68rem; font-weight:800; color:${zone ? zone.themeColor : '#38bdf8'}; text-transform:uppercase;">${zone ? zone.name : ''} • ${curEvent.badge}</span>
              ${isReg ? `<span style="font-size:0.68rem; font-weight:800; color:#10b981; background:rgba(16,185,129,0.2); padding:2px 6px; border-radius:4px;"><i class="fa-solid fa-check"></i> Registered</span>` : `<span style="font-size:0.68rem; font-weight:700; color:#38bdf8; background:rgba(56,189,248,0.15); padding:2px 6px; border-radius:4px;">Slot Open</span>`}
            </div>
            <div style="font-size:0.92rem; font-weight:800; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${curEvent.title}</div>
            <div style="font-size:0.75rem; color:#94a3b8; margin:2px 0;">${curEvent.tag}</div>
            <div style="font-size:0.72rem; color:#cbd5e1; display:flex; gap:8px;">
              <span><i class="fa-solid fa-users" style="color:#10b981;"></i> Required: ${curEvent.minMembers === curEvent.maxMembers ? `${curEvent.minMembers} Pers` : `${curEvent.minMembers}-${curEvent.maxMembers} Pers`}</span>
              <span><i class="fa-solid fa-trophy" style="color:#f59e0b;"></i> 1st: ${curEvent.pointsFirst} pts</span>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <button class="btn-primary" style="width:100%; padding:13px; font-size:0.88rem; font-weight:800; background:linear-gradient(135deg, #10b981, #059669); display:flex; justify-content:center; align-items:center; gap:8px; box-shadow:0 4px 16px rgba(16,185,129,0.3);" onclick="App.openAddStudentModal('${curEvent.id}')">
          <i class="fa-solid fa-user-pen"></i> Step 2: Fill Student Details & Confirm Entry <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    `;
  },

  onHomeDeskEventChange(eventId) {
    this.homeDeskSelectedEventId = eventId;
    this.renderGSEventParticipationDesk();
  },

  deleteStudentEntry(studentId, name) {
    if (confirm(`Remove student ${name} from contingent?`)) {
      const res = ContingentManager.deleteStudentEntry(studentId);
      if (res.success) {
        this.showToast(res.message, 'success');
        this.renderContingentTab();
        this.renderHomeTab();
        this.renderLeaderboardTab();
        this.updateContingentBadge();
      }
    }
  },

  /* -------------------------------------------------------------
     GS Profile & Account Tab Rendering
     ------------------------------------------------------------- */
  renderGSProfileTab() {
    const gs = AuthManager.getCurrentGS();
    const gsPortalView = document.getElementById('gsPortalViewWrap');
    if (!gsPortalView) return;

    if (!gs) {
      gsPortalView.innerHTML = `
        <div class="contingent-empty-state">
          <div class="empty-state-icon">🏛️</div>
          <h3 style="font-size:1rem; color:#fff; margin-bottom:6px;">General Secretary Login</h3>
          <p style="font-size:0.75rem; color:var(--text-muted); margin-bottom:14px;">
            Please log in with your college GS identification code and security PIN.
          </p>
          <button class="btn-primary" onclick="App.openModal('loginModal')">
            <i class="fa-solid fa-key"></i> Open GS Login Form
          </button>
        </div>
      `;
      return;
    }

    const colleges = StorageManager.getColleges();

    gsPortalView.innerHTML = `
      <!-- Official GS Digital ID Card -->
      <div class="digital-pass-ticket" style="margin-bottom:16px;">
        <div class="ticket-header">
          <div class="ticket-fest-brand">
            <span style="color:#6366f1;">MELANGE '26</span>
            <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">COLLEGE GENERAL SECRETARY CREDENTIAL</div>
          </div>
          <span class="ticket-badge-access">OFFICIAL GS</span>
        </div>

        <div style="display:flex; align-items:center; gap:12px; margin-bottom:12px;">
          <div style="font-size:2.2rem; width:52px; height:52px; background:rgba(255,255,255,0.08); border-radius:50%; display:flex; align-items:center; justify-content:center;">
            ${gs.avatar}
          </div>
          <div>
            <h3 style="font-size:1.1rem; color:#fff; font-weight:800;">${gs.gsName}</h3>
            <div style="font-size:0.8rem; color:var(--accent-cyan); font-weight:600;">${gs.gsDesignation}</div>
            <div style="font-size:0.85rem; font-weight:700; color:#e2e8f0; margin-top:2px;">${gs.name}</div>
          </div>
        </div>

        <div class="ticket-grid">
          <div class="ticket-grid-item">
            <span>GS Authorization Code</span>
            <strong style="color:#38bdf8; font-family:var(--font-mono);">${gs.gsCode}</strong>
          </div>
          <div class="ticket-grid-item">
            <span>Security PIN</span>
            <strong style="font-family:var(--font-mono);">${gs.pin}</strong>
          </div>
          <div class="ticket-grid-item">
            <span>Official Email</span>
            <strong>${gs.email}</strong>
          </div>
          <div class="ticket-grid-item">
            <span>Official Contact</span>
            <strong>${gs.phone}</strong>
          </div>
        </div>
      </div>

      <!-- Quick Switcher for Demo testing -->
      <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:14px; margin-bottom:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span style="font-size:0.8rem; font-weight:800; text-transform:uppercase; color:#cbd5e1;">
            <i class="fa-solid fa-repeat" style="color:var(--accent-primary);"></i> Switch College GS Account
          </span>
          <span style="font-size:0.75rem; color:var(--text-sub);">Test other colleges</span>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
          ${colleges.map(c => `
            <button class="tool-btn ${c.id === gs.id ? 'active' : ''}" style="width:100%; justify-content:flex-start; padding:6px 10px;" onclick="App.fastSwitchGS('${c.id}')">
              <span>${c.avatar}</span>
              <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${c.shortCode}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Action Buttons -->
      <div style="display:flex; flex-direction:column; gap:8px;">
        <button class="btn-secondary" onclick="App.openModal('registerGSModal')">
          <i class="fa-solid fa-school"></i> Register New College & GS
        </button>

        <button class="btn-secondary" onclick="App.openSOSModal()">
          <i class="fa-solid fa-triangle-exclamation" style="color:#f59e0b;"></i> GS Emergency Helpdesk & SOS
        </button>

        <button class="btn-secondary" style="color:#ef4444; border-color:rgba(239,68,68,0.3);" onclick="App.logoutGS()">
          <i class="fa-solid fa-arrow-right-from-bracket"></i> Logout GS Session
        </button>

        <button class="btn-secondary" style="color:var(--accent-cyan); border-color:rgba(6,182,212,0.3);" onclick="App.openAdminMode()">
          <i class="fa-solid fa-shield-halved"></i> Access Fest Admin Dashboard
        </button>

        <button class="btn-secondary" style="color:var(--text-muted); font-size:0.75rem; border-color:rgba(255,255,255,0.06);" onclick="App.resetData()">
          <i class="fa-solid fa-arrow-rotate-left"></i> Reset Demo Fest Data
        </button>
      </div>
    `;
  },

  /* -------------------------------------------------------------
     Admin Dashboard (Central Directorate Control Room)
     ------------------------------------------------------------- */
  adminSubTab: 'overview', // 'overview', 'results', 'students', 'broadcast'

  openAdminMode() {
    this.playSound('click');
    if (AuthManager.isAdmin()) {
      this.switchTab('admin');
    } else {
      this.openModal('adminLoginModal');
    }
  },

  directAdminLogin() {
    AuthManager.loginAdmin('9999');
    this.closeModal('adminLoginModal');
    this.playSound('success');
    this.showToast('Unlocked Central Fest Admin Portal!', 'success');
    this.renderHeaderGS();
    this.switchTab('admin');
  },

  handleAdminLoginSubmit() {
    const pin = document.getElementById('adminPinInput')?.value;
    const res = AuthManager.loginAdmin(pin);
    if (res.success) {
      this.closeModal('adminLoginModal');
      this.playSound('success');
      this.showToast(res.message, 'success');
      this.renderHeaderGS();
      this.switchTab('admin');
    } else {
      this.showToast(res.message, 'error');
    }
  },

  switchAdminSubTab(subTab) {
    this.playSound('click');
    this.adminSubTab = subTab;
    this.renderAdminDashboard();
  },

  renderAdminDashboard() {
    const wrap = document.getElementById('adminDashboardViewWrap');
    if (!wrap) return;

    if (!AuthManager.isAdmin()) {
      wrap.innerHTML = `
        <div class="contingent-empty-state">
          <div class="empty-state-icon">🛡️</div>
          <h3 style="font-size:1.05rem; color:#fff; margin-bottom:6px;">Admin Access Restricted</h3>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:14px;">
            The Admin Dashboard is strictly reserved for the Central Fest Directorate to oversee all colleges.
          </p>
          <button class="btn-primary" onclick="App.directAdminLogin()">
            <i class="fa-solid fa-bolt"></i> Unlock Admin Dashboard (1-Click)
          </button>
        </div>
      `;
      return;
    }

    const colleges = StorageManager.getColleges();
    const allStudents = ContingentManager.getAllStudentsAcrossColleges();
    const allRegs = StorageManager.getRegistrations();
    const leaderboard = ContingentManager.getLeaderboard();
    const topCollege = leaderboard[0] || colleges[0];

    // Compute zone stats
    const zoneCounts = { creative: 0, thinking: 0, entertainment: 0, discover: 0 };
    allRegs.forEach(r => {
      const ev = MELANGE_DATA.events.find(e => e.id === r.eventId);
      if (ev && zoneCounts[ev.zoneId] !== undefined) {
        zoneCounts[ev.zoneId]++;
      }
    });

    let html = `
      <!-- Admin Top Banner -->
      <div class="hero-banner" style="margin-bottom:14px; background:linear-gradient(135deg, rgba(6,182,212,0.25), rgba(99,102,241,0.2)), #131b2e; border-color:rgba(6,182,212,0.3);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div class="hero-tag" style="color:#06b6d4; border-color:rgba(6,182,212,0.4); margin-bottom:0;">
            <i class="fa-solid fa-crown"></i> Directorate Control Room
          </div>
          <button class="tool-btn" style="padding:4px 10px; font-size:0.72rem;" onclick="App.switchTab('home')">
            <i class="fa-solid fa-arrow-left"></i> Exit to App
          </button>
        </div>

        <h2 class="hero-title" style="font-size:1.25rem;">Melange '26 Central Admin</h2>
        <p class="hero-sub" style="margin-bottom:12px;">Real-time multi-college monitoring, result declarations & student registers</p>

        <!-- 4-Grid Master KPI Box -->
        <div class="metrics-grid" style="grid-template-columns: repeat(2, 1fr); gap:8px;">
          <div class="metric-box">
            <div class="metric-val" style="color:#10b981;">${allStudents.length}</div>
            <div class="metric-label">All Colleges Students</div>
          </div>
          <div class="metric-box">
            <div class="metric-val" style="color:#38bdf8;">${allRegs.length}</div>
            <div class="metric-label">Total Squads Booked</div>
          </div>
          <div class="metric-box">
            <div class="metric-val" style="color:#ec4899;">${colleges.length}</div>
            <div class="metric-label">Active Institutions</div>
          </div>
          <div class="metric-box">
            <div class="metric-val" style="color:#f59e0b;">${topCollege.shortCode} (#1)</div>
            <div class="metric-label">Trophy Leader (${topCollege.totalScore} pts)</div>
          </div>
        </div>
      </div>

      <!-- Segmented Admin Navigation -->
      <div style="display:flex; gap:6px; overflow-x:auto; padding-bottom:6px; margin-bottom:14px; scrollbar-width:none;">
        <button class="tool-btn ${this.adminSubTab === 'overview' ? 'active' : ''}" style="flex:0 0 auto; padding:8px 14px;" onclick="App.switchAdminSubTab('overview')">
          <i class="fa-solid fa-chart-pie"></i> Overview
        </button>
        <button class="tool-btn ${this.adminSubTab === 'results' ? 'active' : ''}" style="flex:0 0 auto; padding:8px 14px;" onclick="App.switchAdminSubTab('results')">
          <i class="fa-solid fa-trophy"></i> Declare Results
        </button>
        <button class="tool-btn ${this.adminSubTab === 'students' ? 'active' : ''}" style="flex:0 0 auto; padding:8px 14px;" onclick="App.switchAdminSubTab('students')">
          <i class="fa-solid fa-users"></i> All Students (${allStudents.length})
        </button>
        <button class="tool-btn ${this.adminSubTab === 'broadcast' ? 'active' : ''}" style="flex:0 0 auto; padding:8px 14px;" onclick="App.switchAdminSubTab('broadcast')">
          <i class="fa-solid fa-bullhorn"></i> Flash Broadcast
        </button>
      </div>
    `;

    // -------------------------------------------------------------
    // SUB-TAB 1: OVERVIEW & ZONE PROGRESS
    // -------------------------------------------------------------
    if (this.adminSubTab === 'overview') {
      html += `
        <div class="section-header">
          <span class="section-title"><i class="fa-solid fa-layer-group"></i> Zone Participation Analytics</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:16px;">
          ${MELANGE_DATA.zones.map(z => {
            const zEvents = MELANGE_DATA.events.filter(e => e.zoneId === z.id);
            const count = zoneCounts[z.id] || 0;
            const pct = Math.min(100, Math.round((count / (zEvents.length * colleges.length)) * 100));

            return `
              <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:12px 14px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                  <span style="font-weight:800; font-size:0.9rem; color:#fff;">
                    <i class="fa-solid fa-${z.icon}" style="color:${z.themeColor}; margin-right:6px;"></i>
                    ${z.name}
                  </span>
                  <span style="font-size:0.78rem; font-weight:800; color:${z.themeColor};">
                    ${count} Squads Enrolled
                  </span>
                </div>
                <div style="font-size:0.75rem; color:#94a3b8; margin-bottom:8px;">${z.subtitle}</div>
                <div style="width:100%; height:6px; background:rgba(255,255,255,0.06); border-radius:4px; overflow:hidden;">
                  <div style="width:${pct}%; height:100%; background:${z.themeColor}; border-radius:4px;"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- College Contingent Strength Matrix -->
        <div class="section-header">
          <span class="section-title"><i class="fa-solid fa-building-columns"></i> College Contingent Roster Health</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          ${colleges.map(c => {
            const cStudents = allStudents.filter(s => s.collegeId === c.id);
            const cRegs = allRegs.filter(r => r.collegeId === c.id);
            const rankData = leaderboard.find(l => l.id === c.id);

            return `
              <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:12px 14px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <span style="font-size:1.4rem;">${c.avatar}</span>
                  <div>
                    <div style="font-weight:800; font-size:0.88rem; color:#fff;">${c.shortCode}</div>
                    <div style="font-size:0.72rem; color:#94a3b8;">GS: ${c.gsName} • ${c.phone}</div>
                  </div>
                </div>
                <div style="text-align:right;">
                  <div style="font-weight:800; font-size:0.95rem; color:#f59e0b; font-family:var(--font-mono);">${rankData ? rankData.totalScore : c.basePoints} pts</div>
                  <div style="font-size:0.7rem; color:#10b981;">${cStudents.length} Students • ${cRegs.length} Events</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // -------------------------------------------------------------
    // SUB-TAB 2: RESULT DECLARATION & POINTS AWARDING
    // -------------------------------------------------------------
    else if (this.adminSubTab === 'results') {
      html += `
        <div class="section-header">
          <span class="section-title"><i class="fa-solid fa-award"></i> Declare Event Results & Trophy Points</span>
        </div>

        <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:16px; margin-bottom:16px;">
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:14px;">
            Select any competition to award 1st, 2nd, and 3rd place podium spots. Points are instantly credited to the college's live trophy standings!
          </p>

          <form onsubmit="event.preventDefault(); App.adminAwardPointsSubmit();">
            <div class="form-group">
              <label class="form-label">Select Competition / Activity</label>
              <select id="awardEventSelect" class="form-select" required>
                ${MELANGE_DATA.events.map(e => `
                  <option value="${e.id}">${e.title} (${e.tag})</option>
                `).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" style="color:#f59e0b;">🥇 1st Place Winner (+100 Pts)</label>
              <select id="awardFirstCollege" class="form-select" required>
                ${colleges.map(c => `<option value="${c.id}">${c.name} (${c.shortCode})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" style="color:#94a3b8;">🥈 2nd Place Runner-Up (+65 Pts)</label>
              <select id="awardSecondCollege" class="form-select" required>
                ${colleges.map((c, i) => `<option value="${c.id}" ${i === 1 ? 'selected' : ''}>${c.name} (${c.shortCode})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" style="color:#b45309;">🥉 3rd Place (+35 Pts)</label>
              <select id="awardThirdCollege" class="form-select" required>
                ${colleges.map((c, i) => `<option value="${c.id}" ${i === 2 ? 'selected' : ''}>${c.name} (${c.shortCode})</option>`).join('')}
              </select>
            </div>

            <button type="submit" class="btn-primary" style="background:linear-gradient(135deg, #f59e0b, #d97706); margin-top:12px;">
              <i class="fa-solid fa-crown"></i> Publish Results & Update Trophy Leaderboard
            </button>
          </form>
        </div>
      `;
    }

    // -------------------------------------------------------------
    // SUB-TAB 3: ALL STUDENTS MASTER DIRECTORY (ACROSS ALL COLLEGES)
    // -------------------------------------------------------------
    else if (this.adminSubTab === 'students') {
      html += `
        <div class="section-header">
          <span class="section-title"><i class="fa-solid fa-address-book"></i> Central Student Database (${allStudents.length})</span>
          <span class="section-link" onclick="App.exportAllCollegesMasterRoster()"><i class="fa-solid fa-download"></i> Export All</span>
        </div>

        <div class="form-group" style="margin-bottom:12px;">
          <input type="text" id="adminStudentFilterInput" class="form-input" placeholder="🔍 Search by student name, roll no, or college..." oninput="App.filterAdminStudents()" />
        </div>

        <div id="adminStudentsListWrap" style="display:flex; flex-direction:column; gap:8px;">
          ${this.generateAdminStudentsListHtml(allStudents)}
        </div>
      `;
    }

    // -------------------------------------------------------------
    // SUB-TAB 4: FLASH BROADCAST DISPATCH
    // -------------------------------------------------------------
    else if (this.adminSubTab === 'broadcast') {
      const announcements = StorageManager.getAnnouncements();

      html += `
        <div class="section-header">
          <span class="section-title"><i class="fa-solid fa-bullhorn"></i> Send Live Alert to All GS Phones</span>
        </div>

        <div style="background:var(--bg-card); border:1px solid var(--border-glass); border-radius:var(--radius-md); padding:16px; margin-bottom:16px;">
          <form onsubmit="event.preventDefault(); App.adminBroadcastSubmit();">
            <div class="form-group">
              <label class="form-label">Alert Headline / Title <span style="color:#ef4444;">*</span></label>
              <input type="text" id="broadcastTitle" class="form-input" placeholder="e.g. Debate motions drawn at 2 PM sharp" required />
            </div>

            <div class="form-group">
              <label class="form-label">Target Zone / Category</label>
              <select id="broadcastZone" class="form-select">
                <option value="Central Desk">Central Desk (All Colleges)</option>
                <option value="Creative Zone">Creative Zone (Editing & VFX)</option>
                <option value="Thinking Zone">Thinking Zone (On-the-spot Debate)</option>
                <option value="Entertainment Zone">Entertainment Zone (Dance & Singing)</option>
                <option value="Discover Zone">Discover Zone (Treasure Hunt)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Broadcast Message Details <span style="color:#ef4444;">*</span></label>
              <textarea id="broadcastBody" class="form-textarea" rows="3" placeholder="Type official notice to display on all GS screens..." required></textarea>
            </div>

            <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
              <input type="checkbox" id="broadcastUrgent" style="width:18px; height:18px; accent-color:#f59e0b;" />
              <label for="broadcastUrgent" style="font-size:0.8rem; font-weight:700; color:#fbbf24; cursor:pointer;">
                Mark as High Priority Flash Alert (Gold Glow)
              </label>
            </div>

            <button type="submit" class="btn-primary" style="background:#06b6d4;">
              <i class="fa-solid fa-paper-plane"></i> Transmit Broadcast Notice
            </button>
          </form>
        </div>

        <div class="section-header">
          <span class="section-title"><i class="fa-solid fa-clock-rotate-left"></i> Sent Broadcast History</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:8px;">
          ${announcements.map(a => `
            <div style="background:rgba(255,255,255,0.03); border:1px solid ${a.urgent ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}; border-radius:var(--radius-sm); padding:10px 12px;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <span style="font-size:0.72rem; font-weight:800; color:${a.urgent ? '#f59e0b' : '#38bdf8'}; text-transform:uppercase;">${a.zone}</span>
                <span style="font-size:0.7rem; color:var(--text-sub);">${a.time}</span>
              </div>
              <div style="font-weight:700; font-size:0.88rem; color:#fff; margin-bottom:2px;">${a.title}</div>
              <div style="font-size:0.8rem; color:#94a3b8; line-height:1.4;">${a.body}</div>
            </div>
          `).join('')}
        </div>
      `;
    }

    wrap.innerHTML = html;
  },

  generateAdminStudentsListHtml(students) {
    if (!students || students.length === 0) {
      return `<div style="text-align:center; padding:20px; color:#94a3b8; font-size:0.85rem;">No students found matching query.</div>`;
    }

    const colleges = StorageManager.getColleges();

    return students.map(s => {
      const col = colleges.find(c => c.id === s.collegeId);
      const ev = MELANGE_DATA.events.find(e => e.id === s.assignedEventId);
      const zone = ev ? MELANGE_DATA.zones.find(z => z.id === ev.zoneId) : null;

      return `
        <div class="contingent-entry-card" style="padding:12px 14px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
            <div>
              <span style="font-size:0.95rem; font-weight:800; color:#fff;">${s.name}</span>
              <span style="font-size:0.75rem; font-family:var(--font-mono); color:var(--accent-cyan); margin-left:6px;">(${s.rollNo})</span>
            </div>
            <span class="member-chip" style="background:rgba(99,102,241,0.25); color:#a5b4fc; font-weight:700;">
              ${col ? col.shortCode : s.collegeId.toUpperCase()}
            </span>
          </div>

          <div style="font-size:0.78rem; color:#cbd5e1; margin-bottom:6px;">
            <span style="color:#94a3b8;">${s.dept} • ${s.year}</span> • <span>📞 ${s.phone}</span>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:8px 10px; border-radius:6px; font-size:0.75rem;">
            <span style="color:#e2e8f0;">
              <i class="fa-solid fa-${zone ? zone.icon : 'star'}" style="color:${zone ? zone.themeColor : '#f59e0b'}; margin-right:4px;"></i>
              <strong>${ev ? ev.title : s.assignedEventId}</strong>
            </span>
            <span style="font-size:0.7rem; color:#10b981; font-weight:700;">${s.role}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  filterAdminStudents() {
    const query = (document.getElementById('adminStudentFilterInput')?.value || '').toLowerCase();
    const allStudents = ContingentManager.getAllStudentsAcrossColleges();
    const colleges = StorageManager.getColleges();

    const filtered = allStudents.filter(s => {
      const col = colleges.find(c => c.id === s.collegeId);
      const ev = MELANGE_DATA.events.find(e => e.id === s.assignedEventId);
      const str = `${s.name} ${s.rollNo} ${s.dept} ${col ? col.shortCode : ''} ${ev ? ev.title : ''}`.toLowerCase();
      return str.includes(query);
    });

    const wrap = document.getElementById('adminStudentsListWrap');
    if (wrap) {
      wrap.innerHTML = this.generateAdminStudentsListHtml(filtered);
    }
  },

  adminAwardPointsSubmit() {
    const eventId = document.getElementById('awardEventSelect')?.value;
    const firstCol = document.getElementById('awardFirstCollege')?.value;
    const secondCol = document.getElementById('awardSecondCollege')?.value;
    const thirdCol = document.getElementById('awardThirdCollege')?.value;

    if (!eventId || !firstCol || !secondCol || !thirdCol) {
      this.showToast('Please select the competition and podium winners.', 'error');
      return;
    }

    // Award Points
    ContingentManager.awardEventPoints(eventId, firstCol, "1st Place", 100);
    ContingentManager.awardEventPoints(eventId, secondCol, "2nd Place", 65);
    ContingentManager.awardEventPoints(eventId, thirdCol, "3rd Place", 35);

    const ev = MELANGE_DATA.events.find(e => e.id === eventId);
    this.playSound('success');
    this.triggerConfetti();
    this.showToast(`🏆 Official results published for ${ev ? ev.title : eventId}! Trophy standings recalculated.`, 'success');

    // Refresh views
    this.renderAdminDashboard();
    this.renderLeaderboardTab();
    this.renderHomeTab();
  },

  adminBroadcastSubmit() {
    const title = document.getElementById('broadcastTitle')?.value;
    const body = document.getElementById('broadcastBody')?.value;
    const zone = document.getElementById('broadcastZone')?.value || "Central Desk";
    const urgent = document.getElementById('broadcastUrgent')?.checked;

    if (!title || !body) {
      this.showToast('Please enter both title and broadcast message.', 'error');
      return;
    }

    ContingentManager.broadcastNotice(title, body, zone, urgent);
    this.playSound('success');
    this.showToast('📢 Flash alert dispatched to all College GS phones!', 'success');
    this.renderAdminDashboard();
    this.renderAnnouncements();
  },

  exportAllCollegesMasterRoster() {
    const allStudents = ContingentManager.getAllStudentsAcrossColleges();
    const colleges = StorageManager.getColleges();

    let csvContent = `MELANGE '26 - ALL COLLEGES MASTER PARTICIPANT DIRECTORY\n`;
    csvContent += `Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `========================================================================\n\n`;

    allStudents.forEach((s, idx) => {
      const col = colleges.find(c => c.id === s.collegeId);
      const ev = MELANGE_DATA.events.find(e => e.id === s.assignedEventId);
      csvContent += `[${idx + 1}] College: ${col ? col.shortCode : s.collegeId} | Student: ${s.name} (${s.rollNo})\n`;
      csvContent += `    Department: ${s.dept} (${s.year}) | Phone: ${s.phone}\n`;
      csvContent += `    Event: ${ev ? ev.title : s.assignedEventId} | Role: ${s.role}\n\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MELANGE26_Master_AllColleges_Directory.txt`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Master directory exported successfully!', 'success');
  },

  /* -------------------------------------------------------------
     Modals Management
     ------------------------------------------------------------- */
  openModal(modalId) {
    this.playSound('click');
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
    }
  },

  closeModal(modalId) {
    this.playSound('click');
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
    }
  },

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  },

  /* Event Details Modal */
  openEventDetails(eventId) {
    this.playSound('click');
    const event = MELANGE_DATA.events.find(e => e.id === eventId);
    if (!event) return;

    this.selectedEvent = event;
    const zone = MELANGE_DATA.zones.find(z => z.id === event.zoneId);
    const gs = AuthManager.getCurrentGS();
    const isRegistered = gs ? ContingentManager.isRegistered(gs.id, event.id) : null;

    const modalBody = document.getElementById('eventDetailsBody');
    const modalFooter = document.getElementById('eventDetailsFooter');

    if (modalBody) {
      modalBody.innerHTML = `
        <!-- Event Cover Photo Banner -->
        <div style="position:relative; width:100%; height:160px; overflow:hidden; border-radius:var(--radius-sm); margin-bottom:14px; background:#101626;">
          <img src="${event.image}" alt="${event.title}" style="width:100%; height:100%; object-fit:cover; display:block;" onerror="this.src='https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=700&q=80'" />
          <div style="position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(13,20,36,0.92) 100%);"></div>
          <div style="position:absolute; bottom:10px; left:12px; right:12px; display:flex; justify-content:space-between; align-items:center;">
            <span class="event-badge-tag" style="background:rgba(10,15,27,0.75); backdrop-filter:blur(8px); border-left:3px solid ${zone ? zone.themeColor : '#6366f1'}; font-size:0.72rem; color:#fff;">
              ${zone ? zone.name : ''} • ${event.badge}
            </span>
            <span style="font-size:0.75rem; color:#f59e0b; font-weight:800; background:rgba(10,15,27,0.75); padding:4px 10px; border-radius:12px; backdrop-filter:blur(8px); border:1px solid rgba(245,158,11,0.35);">
              <i class="fa-solid fa-trophy"></i> 1st: ${event.pointsFirst} pts
            </span>
          </div>
        </div>

        <h2 style="font-size:1.25rem; font-weight:800; color:#fff; margin-bottom:4px;">${event.title}</h2>
        <div style="font-size:0.78rem; color:var(--accent-cyan); font-weight:600; margin-bottom:12px;">${event.tag}</div>

        <div class="event-details-row" style="margin-bottom:16px;">
          <div class="detail-chip"><i class="fa-regular fa-clock" style="color:#38bdf8;"></i> <span>${event.schedule}</span></div>
          <div class="detail-chip"><i class="fa-solid fa-location-dot" style="color:#f43f5e;"></i> <span>${event.venue}</span></div>
          <div class="detail-chip"><i class="fa-solid fa-users" style="color:#10b981;"></i> <span>Team Size: ${event.minMembers === event.maxMembers ? event.minMembers : `${event.minMembers} - ${event.maxMembers}`} Participants</span></div>
          <div class="detail-chip"><i class="fa-solid fa-sack-dollar" style="color:#f59e0b;"></i> <span>Prizes: ${event.prizePool}</span></div>
        </div>

        <div style="margin-bottom:14px;">
          <h4 style="font-size:0.78rem; font-weight:800; text-transform:uppercase; color:#cbd5e1; margin-bottom:6px;">Event Brief</h4>
          <p style="font-size:0.75rem; color:var(--text-muted); line-height:1.45;">${event.description}</p>
        </div>

        <div style="margin-bottom:14px;">
          <h4 style="font-size:0.78rem; font-weight:800; text-transform:uppercase; color:#cbd5e1; margin-bottom:6px;">Official Rules & Regulations</h4>
          <ul style="padding-left:18px; font-size:0.73rem; color:var(--text-muted); line-height:1.4;">
            ${event.rules.map(r => `<li style="margin-bottom:4px;">${r}</li>`).join('')}
          </ul>
        </div>

        <div style="margin-bottom:14px;">
          <h4 style="font-size:0.78rem; font-weight:800; text-transform:uppercase; color:#cbd5e1; margin-bottom:6px;">Scoring & Judging Matrix</h4>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${event.judgingCriteria.map(c => `
              <span style="background:rgba(255,255,255,0.06); font-size:0.68rem; color:#cbd5e1; padding:3px 8px; border-radius:4px;">${c}</span>
            `).join('')}
          </div>
        </div>

        <div class="zone-coord-info">
          <i class="fa-solid fa-headset" style="color:var(--accent-primary);"></i>
          <span><strong>Event Coordinator:</strong> ${event.coordinator}</span>
        </div>
      `;
    }

    if (modalFooter) {
      if (isRegistered) {
        modalFooter.innerHTML = `
          <button class="btn-primary" style="background:#10b981;" onclick="App.viewPass('${isRegistered.registrationId}')">
            <i class="fa-solid fa-qrcode"></i> View Confirmed Pass (${isRegistered.slotNumber})
          </button>
        `;
      } else {
        modalFooter.innerHTML = `
          <button class="btn-primary" onclick="App.openRegisterModal('${event.id}')">
            <i class="fa-solid fa-user-plus"></i> Register ${gs ? gs.shortCode : 'College'} Squad
          </button>
        `;
      }
    }

    this.openModal('eventDetailsModal');
  },

  /* Squad / Event Registration Modal (Directly delegates to Dropdown-first Student Desk) */
  openRegisterModal(eventId) {
    this.closeModal('eventDetailsModal');
    this.openAddStudentModal(eventId);
  },

  submitSquadRegistration() {
    const gs = AuthManager.getCurrentGS();
    if (!gs || !this.selectedEvent) return;

    const teamName = (document.getElementById('regTeamName')?.value || '').trim();
    const teamLeader = (document.getElementById('regTeamLeader')?.value || '').trim();
    const contactPhone = (document.getElementById('regContactPhone')?.value || '').trim();
    const notes = (document.getElementById('regNotes')?.value || '').trim();

    if (!teamName || !teamLeader || !contactPhone) {
      this.showToast('Please fill out all mandatory fields marked with *', 'error');
      return;
    }

    const memberInputs = document.querySelectorAll('.squad-member-input');
    const members = [];
    memberInputs.forEach(input => {
      const val = input.value.trim();
      if (val) members.push(val);
    });

    if (members.length < this.selectedEvent.minMembers) {
      this.showToast(`Minimum ${this.selectedEvent.minMembers} members required for this event.`, 'error');
      return;
    }

    const result = ContingentManager.registerSquad(gs.id, this.selectedEvent.id, {
      teamName,
      teamLeader,
      contactPhone,
      members,
      notes
    });

    if (result.success) {
      this.closeModal('registerSquadModal');
      this.playSound('success');
      this.triggerConfetti();
      this.showToast(`🎉 ${teamName} registered for ${this.selectedEvent.title}!`, 'success');

      // Update badge and views
      this.updateContingentBadge();
      this.renderHomeTab();
      this.renderZonesTab();
      this.renderLeaderboardTab();

      // Open Pass directly
      setTimeout(() => {
        this.viewPass(result.registration.registrationId);
      }, 500);
    } else {
      this.showToast(result.message, 'error');
    }
  },

  /* View Digital Pass */
  viewPass(registrationId) {
    this.closeAllModals();
    const regs = StorageManager.getRegistrations();
    const reg = regs.find(r => r.registrationId === registrationId);
    if (!reg) {
      this.showToast('Registration record not found.', 'error');
      return;
    }

    const event = MELANGE_DATA.events.find(e => e.id === reg.eventId);
    const colleges = StorageManager.getColleges();
    const college = colleges.find(c => c.id === reg.collegeId);
    const zone = event ? MELANGE_DATA.zones.find(z => z.id === event.zoneId) : null;

    const passContent = document.getElementById('digitalPassContent');
    if (passContent) {
      const qrSvg = ContingentManager.generatePassQRCodeSvg(reg.registrationId, 160);

      passContent.innerHTML = `
        <div class="digital-pass-ticket">
          <div class="ticket-header">
            <div>
              <div class="ticket-fest-brand">MELANGE '26</div>
              <div style="font-size:0.75rem; color:#38bdf8; font-weight:700;">OFFICIAL ENTRY BADGE</div>
            </div>
            <span class="ticket-badge-access">${reg.slotNumber}</span>
          </div>

          <div class="ticket-body">
            <h3 style="font-size:1.15rem; color:#fff; font-weight:800; margin-bottom:4px;">${event ? event.title : reg.eventId}</h3>
            <div style="font-size:0.82rem; color:var(--text-muted);">${zone ? zone.name : ''} • ${event ? event.venue : ''}</div>

            <div class="ticket-qr-container">
              ${qrSvg}
            </div>

            <div class="ticket-id-tag">${reg.registrationId}</div>
            <div style="font-size:0.75rem; color:#94a3b8; margin-top:4px;">Scan at Zone Security Gate for Access</div>
          </div>

          <div class="ticket-grid">
            <div class="ticket-grid-item">
              <span>College Contingent</span>
              <strong>${college ? college.shortCode : reg.collegeId}</strong>
            </div>
            <div class="ticket-grid-item">
              <span>Team Alias</span>
              <strong>${reg.teamName}</strong>
            </div>
            <div class="ticket-grid-item">
              <span>Team Captain</span>
              <strong>${reg.teamLeader}</strong>
            </div>
            <div class="ticket-grid-item">
              <span>Schedule Timing</span>
              <strong>${event ? event.schedule : 'TBA'}</strong>
            </div>
          </div>

          <div style="margin-top:12px; background:rgba(0,0,0,0.3); padding:10px; border-radius:8px; font-size:0.78rem; color:#cbd5e1;">
            <strong>Squad Members:</strong> ${(reg.members || []).join(', ')}
          </div>
        </div>
      `;
    }

    this.openModal('digitalPassModal');
  },

  promptCancelRegistration(registrationId, teamName) {
    if (confirm(`Are you sure you want to withdraw squad '${teamName}' from this event? Slot will be released.`)) {
      const res = ContingentManager.cancelRegistration(registrationId);
      if (res.success) {
        this.showToast(res.message, 'success');
        this.renderContingentTab();
        this.renderZonesTab();
        this.renderHomeTab();
        this.updateContingentBadge();
      }
    }
  },

  exportContingentSummary() {
    const gs = AuthManager.getCurrentGS();
    if (!gs) return;
    const regs = ContingentManager.getCollegeRegistrations(gs.id);
    
    let summaryText = `MELANGE '26 - OFFICIAL CONTINGENT ROSTER\n`;
    summaryText += `Institution: ${gs.name} (${gs.shortCode})\n`;
    summaryText += `General Secretary: ${gs.gsName} | Code: ${gs.gsCode}\n`;
    summaryText += `Date Generated: ${new Date().toLocaleString()}\n`;
    summaryText += `====================================================\n\n`;

    regs.forEach((r, idx) => {
      const ev = MELANGE_DATA.events.find(e => e.id === r.eventId);
      summaryText += `[${idx + 1}] Event: ${ev ? ev.title : r.eventId} (${r.slotNumber})\n`;
      summaryText += `    Team: ${r.teamName} | Captain: ${r.teamLeader} (${r.contactPhone})\n`;
      summaryText += `    Roster: ${(r.members || []).join(', ')}\n\n`;
    });

    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MELANGE26_${gs.shortCode}_Contingent_Roster.txt`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Contingent roster exported to text file!', 'success');
  },

  /* -------------------------------------------------------------
     GS Authentication Actions
     ------------------------------------------------------------- */
  handleLoginSubmit() {
    const gsCode = document.getElementById('loginGsCode')?.value;
    const pin = document.getElementById('loginPin')?.value;

    const res = AuthManager.login(gsCode, pin);
    if (res.isAdmin) {
      this.closeModal('loginModal');
      this.playSound('success');
      this.showToast('Unlocked Central Fest Admin Control Room!', 'success');
      this.renderHeaderGS();
      this.switchTab('admin');
      return;
    }

    if (res.success) {
      this.closeModal('loginModal');
      this.playSound('success');
      this.showToast(`Logged in as GS, ${res.college.name}!`, 'success');
      this.renderHeaderGS();
      this.renderHomeTab();
      this.renderZonesTab();
      this.renderLeaderboardTab();
      this.renderContingentTab();
      this.renderGSProfileTab();
      this.updateContingentBadge();

      // Automatically launch dropdown-first event & student entry desk!
      setTimeout(() => {
        this.openAddStudentModal();
      }, 400);
    } else {
      this.showToast(res.message, 'error');
    }
  },

  fastSwitchGS(collegeId) {
    const res = AuthManager.loginAsCollege(collegeId);
    if (res.success) {
      this.playSound('success');
      this.showToast(`Logged in as GS, ${res.college.name}`, 'success');
      this.closeAllModals();
      this.renderHeaderGS();
      this.renderHomeTab();
      this.renderZonesTab();
      this.renderLeaderboardTab();
      this.renderContingentTab();
      this.renderGSProfileTab();
      this.updateContingentBadge();

      // Automatically launch dropdown-first event & student entry desk!
      setTimeout(() => {
        this.openAddStudentModal();
      }, 400);
    }
  },

  handleRegisterGSSubmit() {
    const collegeName = document.getElementById('newCollegeName')?.value;
    const shortCode = document.getElementById('newShortCode')?.value;
    const city = document.getElementById('newCity')?.value;
    const gsName = document.getElementById('newGsName')?.value;
    const gsDesignation = document.getElementById('newGsDesignation')?.value;
    const gsCode = document.getElementById('newGsCode')?.value;
    const pin = document.getElementById('newPin')?.value;
    const email = document.getElementById('newEmail')?.value;
    const phone = document.getElementById('newPhone')?.value;

    if (!collegeName || !shortCode || !gsName || !gsCode || !pin) {
      this.showToast('Please fill all required college and GS fields.', 'error');
      return;
    }

    const res = AuthManager.registerNewGS({
      collegeName,
      shortCode,
      city,
      gsName,
      gsDesignation,
      gsCode,
      pin,
      email,
      phone
    });

    if (res.success) {
      this.closeModal('registerGSModal');
      this.playSound('success');
      this.showToast(`College ${res.college.shortCode} registered with GS ${res.college.gsName}!`, 'success');
      this.renderHeaderGS();
      this.renderHomeTab();
      this.renderZonesTab();
      this.renderLeaderboardTab();
      this.renderContingentTab();
      this.renderGSProfileTab();
      this.updateContingentBadge();
    } else {
      this.showToast(res.message, 'error');
    }
  },

  logoutGS() {
    AuthManager.logout();
    this.playSound('click');
    this.showToast('Logged out of GS session.', 'success');
    this.renderHeaderGS();
    this.renderHomeTab();
    this.renderZonesTab();
    this.renderLeaderboardTab();
    this.renderContingentTab();
    this.renderGSProfileTab();
    this.renderAnnouncements();
    this.updateContingentBadge();
    this.switchTab('home');
  },

  openSOSModal() {
    this.openModal('sosModal');
  },

  /* -------------------------------------------------------------
     Toast Banner
     ------------------------------------------------------------- */
  showToast(message, type = 'success') {
    const toast = document.getElementById('appToast');
    const msgElem = document.getElementById('toastMessage');
    const iconElem = document.getElementById('toastIcon');

    if (!toast || !msgElem) return;

    msgElem.textContent = message;
    toast.className = `toast-box show ${type}`;

    if (iconElem) {
      if (type === 'success') {
        iconElem.innerHTML = '<i class="fa-solid fa-circle-check" style="color:#10b981;"></i>';
      } else {
        iconElem.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color:#ef4444;"></i>';
      }
    }

    clearTimeout(this._toastTimeout);
    this._toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  },

  /* -------------------------------------------------------------
     Confetti Canvas Animation
     ------------------------------------------------------------- */
  triggerConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas || typeof canvas.getContext !== 'function') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
    canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;

    const particles = [];
    const colors = ['#6366f1', '#ec4899', '#38bdf8', '#10b981', '#f59e0b', '#fff'];

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.4,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.7) * 14,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        spin: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let frame = 0;
    const animate = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.rotation += p.spin;
        p.opacity -= 0.015;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive && frame < 120) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    animate();
  },

  /* -------------------------------------------------------------
     Event Bindings & Toolbar Controls
     ------------------------------------------------------------- */
  bindEvents() {
    // Bottom Nav Tabs
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        if (tab) this.switchTab(tab);
      });
    });

    // Close buttons on sheets
    document.querySelectorAll('.sheet-close-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-overlay');
        if (modal) modal.classList.remove('open');
      });
    });

    // Close when clicking modal backdrop
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('open');
        }
      });
    });

    // Sound toggle button in header
    const soundBtn = document.getElementById('toolSoundBtn');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        this.soundEnabled = !this.soundEnabled;
        soundBtn.innerHTML = this.soundEnabled
          ? '<i class="fa-solid fa-volume-high"></i>'
          : '<i class="fa-solid fa-volume-xmark"></i>';
        soundBtn.classList.toggle('active', this.soundEnabled);
        if (this.soundEnabled) {
          this.playSound('click');
          this.showToast('Sound feedback enabled', 'success');
        } else {
          this.showToast('Sound muted', 'success');
        }
      });
    }
  },

  resetData() {
    if (confirm('Reset all registrations and return to initial festival state?')) {
      StorageManager.resetAllData();
      AuthManager.init();
      this.init();
      this.showToast('Data reset to default festival state.', 'success');
    }
  }
};

// Launch when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
