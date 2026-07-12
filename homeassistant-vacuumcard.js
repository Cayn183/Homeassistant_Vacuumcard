/**
 * Vacuum Control Card
 * A custom Lovelace card for Home Assistant that provides
 * a full-featured vacuum control panel inspired by the
 * built-in more-info vacuum dialog.
 *
 * Author: Custom component
 * Version: 1.0.0
 */

import { LitElement, html, css } from 'https://unpkg.com/lit-element@2.4.0/lit-element.js?module';

/* ---------- SVG Icons ---------- */
const ICONS = {
  play: 'M8,5.14V19.14L19,12.14L8,5.14Z',
  stop: 'M18,18H6V6H18V18Z',
  dock: 'M15 13L11 17V14H2V12H11V9L15 13M5 20V16H7V18H17V10.19L12 5.69L7.21 10H4.22L12 3L22 12H19V20H5Z',
  locate: 'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z',
  spot: 'M22.08,11.04H20.08V4H13.05V2H11.04V4H4V11.04H2V13.05H4V20.08H11.04V22.08H13.05V20.08H20.08V13.05H22.08V11.04M18.07,18.07H13.05V16.06H11.04V18.07H6V13.05H8.03V11.04H6V6H11.04V8.03H13.05V6H18.07V11.04H16.06V13.05H18.07V18.07M13.05,12.05A1,1 0 0,1 12.05,13.05C11.5,13.05 11.04,12.6 11.04,12.05C11.04,11.5 11.5,11.04 12.05,11.04C12.6,11.04 13.05,11.5 13.05,12.05Z',
  fan: 'M12,11A1,1 0 0,0 11,12A1,1 0 0,0 12,13A1,1 0 0,0 13,12A1,1 0 0,0 12,11M12.5,2C17,2 17.11,5.57 14.75,6.75C13.76,7.24 13.32,8.29 13.13,9.22C13.61,9.42 14.03,9.73 14.35,10.13C18.05,8.13 22.03,8.92 22.03,12.5C22.03,17 18.46,17.1 17.28,14.73C16.78,13.74 15.72,13.3 14.79,13.11C14.59,13.59 14.28,14 13.88,14.34C15.87,18.03 15.08,22 11.5,22C7,22 6.91,18.42 9.27,17.24C10.25,16.75 10.69,15.71 10.89,14.79C10.4,14.59 9.97,14.27 9.65,13.87C5.96,15.85 2,15.07 2,11.5C2,7 5.56,6.89 6.74,9.26C7.24,10.25 8.29,10.68 9.22,10.87C9.41,10.39 9.73,9.97 10.14,9.65C8.15,5.96 8.94,2 12.5,2Z',
  'arrow-right': 'M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z',
  battery: 'M16.67,4H15V2H9V4H7.33A1.33,1.33 0 0,0 6,5.33V20.66C6,21.4 6.6,22 7.33,22H16.66C17.4,22 18,21.4 18,20.67V5.33C18,4.6 17.4,4 16.67,4M11,20V14.5H9L13,7V12.5H15',
  cleanAreas: 'M20 2H4C2.9 2 2 2.9 2 4V20C2 21.11 2.9 22 4 22H20C21.11 22 22 21.11 22 20V4C22 2.9 21.11 2 20 2M4 6L6 4H10.9L4 10.9V6M4 13.7L13.7 4H18.6L4 18.6V13.7M20 18L18 20H13.1L20 13.1V18M20 10.3L10.3 20H5.4L20 5.4V10.3Z',
};

/* ---------- Helper: render SVG Icon ---------- */
function svgIcon(path, size = 24) {
  return html`
    <svg
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      role="img"
      aria-hidden="true"
      viewBox="0 0 24 24"
      style="width:${size}px;height:${size}px;"
    >
      <g>
        <path class="primary-path" d="${path}"></path>
      </g>
    </svg>
  `;
}

/* ---------- State helpers ---------- */
function localize(state) {
  const labels = {
    docked: 'Gedockt',
    cleaning: 'Reinigt',
    paused: 'Pausiert',
    idle: 'Bereit',
    returning: 'Kehrt zurück',
    error: 'Fehler',
  };
  return labels[state] || state;
}

function relativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return 'Vor ' + diff + ' Sekunden';
  if (diff < 3600) return 'Vor ' + Math.floor(diff / 60) + ' Minuten';
  if (diff < 86400) return 'Vor ' + Math.floor(diff / 3600) + ' Stunden';
  return 'Vor ' + Math.floor(diff / 86400) + ' Tagen';
}

/* ---------- Vacuum Card ---------- */
class VacuumCard extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        font-family: var(--primary-font-family, 'Roboto', sans-serif);
        --vacuum-color: var(--state-vacuum-docked-color, var(--state-vacuum-inactive-color, var(--state-inactive-color, #44739e)));
        --card-background: var(--card-background-color, var(--ha-card-background, #fff));
      }

      .card {
        background: var(--card-background);
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow, 0 2px 8px rgba(0,0,0,0.12));
        padding: 16px;
      }

      /* --- Status Header --- */
      .state-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .state-info {
        display: flex;
        flex-direction: column;
      }

      .state-text {
        font-size: 20px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin: 0;
      }

      .last-changed {
        font-size: 12px;
        color: var(--secondary-text-color);
        margin: 2px 0 0 0;
      }

      .battery {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: var(--primary-text-color);
      }

      .battery svg {
        fill: var(--primary-text-color);
      }

      /* --- Vacuum SVG --- */
      .vacuum-svg-container {
        display: flex;
        justify-content: center;
        margin: 8px 0 16px;
      }

      .vacuum-svg-container svg {
        width: 200px;
        height: 200px;
        overflow: visible;
      }

      .glow {
        animation: pulse-glow 3s ease-in-out infinite;
      }

      @keyframes pulse-glow {
        0%, 100% { opacity: 0.06; }
        50% { opacity: 0.12; }
      }

      .vacuum-body-rotate {
        transform-origin: 120px 120px;
      }

      .vacuum-body {
        transform-origin: 120px 120px;
      }

      .particle {
        animation: particle-float 2.5s ease-out infinite;
      }

      .p1 { animation-delay: 0s; }
      .p2 { animation-delay: 0.3s; }
      .p3 { animation-delay: 0.6s; }
      .p4 { animation-delay: 0.9s; }
      .p5 { animation-delay: 1.2s; }
      .p6 { animation-delay: 1.5s; }
      .p7 { animation-delay: 1.8s; }
      .p8 { animation-delay: 2.1s; }

      @keyframes particle-float {
        0% { opacity: 0; transform: translate(0, 0) scale(0); }
        20% { opacity: 0.6; }
        100% { opacity: 0; transform: translate(var(--dx, 20px), var(--dy, -30px)) scale(1); }
      }

      .p1 { --dx: 30px; --dy: -20px; }
      .p2 { --dx: -25px; --dy: -25px; }
      .p3 { --dx: 20px; --dy: -35px; }
      .p4 { --dx: -30px; --dy: -15px; }
      .p5 { --dx: 35px; --dy: -25px; }
      .p6 { --dx: -20px; --dy: -30px; }
      .p7 { --dx: 15px; --dy: -40px; }
      .p8 { --dx: -35px; --dy: -20px; }

      .dock-indicator {
        animation: dock-pulse 2s ease-in-out infinite;
      }

      @keyframes dock-pulse {
        0%, 100% { opacity: 0.8; }
        50% { opacity: 1; }
      }

      @keyframes body-drift {
        0% { transform: rotate(-1deg); }
        100% { transform: rotate(1deg); }
      }

      /* --- Buttons --- */
      .buttons {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin: 16px 0;
        flex-wrap: wrap;
      }

      .control-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        border: none;
        border-radius: 8px;
        background: var(--ha-button-background, var(--secondary-background-color, rgba(0,0,0,0.05)));
        color: var(--primary-text-color);
        cursor: pointer;
        transition: background 0.2s, transform 0.15s;
        position: relative;
        overflow: hidden;
      }

      .control-btn:hover {
        background: var(--ha-button-hover-background, rgba(0,0,0,0.1));
      }

      .control-btn:active {
        transform: scale(0.92);
      }

      .control-btn[disabled] {
        opacity: 0.3;
        cursor: not-allowed;
        pointer-events: none;
      }

      .control-btn svg {
        fill: var(--primary-text-color);
        width: 24px;
        height: 24px;
      }

      /* --- Select Menus (Fan speed & Cleaning mode) --- */
      .select-container {
        display: flex;
        gap: 12px;
        justify-content: center;
      }

      .select-menu, .clean-areas-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 14px;
        border: none;
        border-radius: var(--ha-card-border-radius, 10px);
        background: var(--secondary-background-color, rgba(0,0,0,0.03));
        cursor: pointer;
        transition: background 0.2s;
        text-align: left;
        color: var(--primary-text-color);
      }

      .select-menu {
        width: 100%;
        box-sizing: border-box;
      }

      .clean-areas-btn {
        flex: 1 1 0px;
        min-width: 140px;
        max-width: 240px;
      }

      .select-menu:hover, .clean-areas-btn:hover {
        background: var(--ha-button-hover-background, rgba(0,0,0,0.08));
      }

      .select-menu .icon, .clean-areas-btn .icon {
        display: flex;
        align-items: center;
        flex-shrink: 0;
      }

      .select-menu .icon svg, .clean-areas-btn .icon svg {
        fill: var(--state-icon-color, var(--primary-text-color));
        width: 20px;
        height: 20px;
      }

      .select-menu .content, .clean-areas-btn .content {
        flex: 1;
        min-width: 0;
      }

      .select-menu .content .label, .clean-areas-btn .content .label {
        font-size: 11px;
        color: var(--secondary-text-color);
        margin: 0;
        line-height: 1.3;
      }

      .select-menu .content .value, .clean-areas-btn .content .value {
        font-size: 14px;
        font-weight: 500;
        margin: 0;
        line-height: 1.3;
      }

      .clean-areas-btn .icon:last-child svg {
        fill: var(--secondary-text-color);
        width: 18px;
        height: 18px;
      }

      /* --- Dropdown (fan speed) --- */
      .dropdown-wrapper {
        position: relative;
        flex: 1 1 0px;
        min-width: 140px;
        max-width: 240px;
        display: flex;
      }

      .dropdown-menu {
        position: absolute;
        bottom: 100%;
        left: 0;
        right: 0;
        z-index: 100;
        background: var(--card-background);
        border-radius: var(--ha-card-border-radius, 10px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        padding: 4px 0;
        display: none;
        margin-bottom: 4px;
      }

      .dropdown-menu.open {
        display: block;
      }

      .dropdown-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border: none;
        background: none;
        width: 100%;
        cursor: pointer;
        font-size: 14px;
        color: var(--primary-text-color);
        text-align: left;
        transition: background 0.15s;
      }

      .dropdown-item:hover {
        background: var(--secondary-background-color, rgba(0,0,0,0.05));
      }

      .dropdown-item.selected {
        color: var(--primary-color, #03a9f4);
        font-weight: 500;
      }

      /* --- Area Dialog --- */
      .area-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 16px;
      }

      .area-dialog {
        background: var(--card-background);
        border-radius: var(--ha-card-border-radius, 16px);
        box-shadow: 0 8px 40px rgba(0,0,0,0.2);
        max-width: 420px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        padding: 20px;
      }

      .area-dialog-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .area-dialog-header h3 {
        font-size: 18px;
        font-weight: 500;
        color: var(--primary-text-color);
        margin: 0;
      }

      .close-btn {
        width: 32px;
        height: 32px;
        border: none;
        border-radius: 50%;
        background: var(--secondary-background-color, rgba(0,0,0,0.05));
        color: var(--primary-text-color);
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .close-btn:hover {
        background: var(--secondary-background-color, rgba(0,0,0,0.1));
      }

      .area-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-bottom: 12px;
      }

      .area-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        padding: 14px 8px;
        border: 2px solid var(--divider-color, rgba(0,0,0,0.08));
        border-radius: var(--ha-card-border-radius, 12px);
        background: var(--card-background);
        cursor: pointer;
        transition: all 0.2s;
        position: relative;
        text-align: center;
      }

      .area-card:hover {
        border-color: var(--primary-color, #03a9f4);
        background: var(--primary-color, #03a9f4);
        background: color-mix(in srgb, var(--primary-color, #03a9f4) 5%, var(--card-background));
      }

      .area-card.selected {
        border-color: var(--primary-color, #03a9f4);
        background: color-mix(in srgb, var(--primary-color, #03a9f4) 8%, var(--card-background));
      }

      .area-card .badge {
        position: absolute;
        top: -6px;
        right: -6px;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        background: var(--primary-color, #03a9f4);
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .area-card .area-icon svg {
        width: 28px;
        height: 28px;
        fill: var(--state-icon-color, var(--primary-text-color));
        opacity: 0.6;
      }

      .area-card.selected .area-icon svg {
        fill: var(--primary-color, #03a9f4);
        opacity: 1;
      }

      .area-card .area-name {
        font-size: 12px;
        font-weight: 500;
        color: var(--primary-text-color);
        line-height: 1.2;
      }

      .area-card.selected .area-name {
        color: var(--primary-color, #03a9f4);
      }

      .area-hint {
        font-size: 11px;
        color: var(--secondary-text-color);
        margin: 0 0 16px 0;
        line-height: 1.4;
        text-align: center;
      }

      .area-empty {
        text-align: center;
        padding: 24px 0;
        color: var(--secondary-text-color);
      }

      .area-empty p {
        margin: 0 0 8px 0;
        font-size: 14px;
      }

      .area-dialog-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }

      .action-btn {
        padding: 10px 20px;
        border: none;
        border-radius: var(--ha-card-border-radius, 10px);
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .action-btn.primary {
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        flex: 1;
      }

      .action-btn.primary:hover {
        opacity: 0.9;
      }

      .action-btn.primary[disabled] {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .action-btn.secondary {
        background: var(--secondary-background-color, rgba(0,0,0,0.05));
        color: var(--primary-text-color);
      }

      .action-btn.secondary:hover {
        background: var(--secondary-background-color, rgba(0,0,0,0.1));
      }
    `;
  }

  constructor() {
    super();
    this._fanSpeedOpen = false;
    this._fanSpeedOptions = [];
    this._showAreaDialog = false;
    this._selectedAreas = [];
    this._haAreas = [];
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Entity must be specified');
    }
    this.config = {
      ...config,
      name: config.name || '',
      show_title: config.show_title !== false,
      animated: config.animated !== false,
      battery_entity: config.battery_entity || '',
      areas: Array.isArray(config.areas) ? config.areas : [],
    };
  }

  get _stateObj() {
    return this.hass ? this.hass.states[this.config.entity] : null;
  }

  get _vacuumState() {
    if (!this._stateObj) return 'unknown';
    const state = this._stateObj.state;
    if (state === 'docked') return 'docked';
    if (state === 'cleaning' || ['on', 'cleaning'].includes(state)) return 'cleaning';
    if (state === 'paused') return 'paused';
    if (state === 'returning' || state === 'return_to_dock') return 'returning';
    if (state === 'error') return 'error';
    return 'idle';
  }

  get _batteryLevel() {
    // 1) Manuell konfigurierte battery_entity
    if (this.config.battery_entity) {
      const batteryState = this.hass?.states[this.config.battery_entity];
      if (batteryState) {
        let level = batteryState.state;
        if (typeof level === 'number' && level <= 1 && level > 0) level = Math.round(level * 100);
        const parsed = Number(level);
        if (!isNaN(parsed)) return parsed;
      }
    }

    // 2) Auto-Erkennung: Suche nach Sensor-Entity mit "battery" im selben Device
    const autoEntity = this._findBatterySensorEntity();
    if (autoEntity) {
      const batteryState = this.hass?.states[autoEntity];
      if (batteryState) {
        let level = batteryState.state;
        if (typeof level === 'number' && level <= 1 && level > 0) level = Math.round(level * 100);
        const parsed = Number(level);
        if (!isNaN(parsed)) return parsed;
      }
    }

    // 3) Fallback: Attribute der Vacuum-Entity
    const attrs = this._stateObj?.attributes || {};
    let level = attrs.battery_level ?? attrs.battery ?? attrs.battery_percentage ?? attrs.batteryLevel ?? 0;
    if (typeof level === 'number' && level <= 1 && level > 0) level = Math.round(level * 100);
    return Number(level) || 0;
  }

  /**
   * Prüft, ob eine Entity-ID auf einen Batterie-Wert hindeutet
   * (mehrere Sprachen, da HA-Backend-Sprache die ID beeinflussen kann).
   */
  _isBatteryEntityId(entityId) {
    const id = entityId.toLowerCase();
    // Englisch, Deutsch, Französisch, Spanisch, Italienisch, Niederländisch, Schwedisch
    const keywords = ['battery', 'batterie', 'akku', 'batteria', 'batería', 'batterij', 'batteri'];
    return keywords.some(kw => id.includes(kw));
  }

  /**
   * Automatische Erkennung einer Batterie-Sensor-Entity,
   * die zum selben Gerät wie der Staubsauger gehört.
   */
  _findBatterySensorEntity() {
    if (!this.hass || !this._stateObj) return null;

    const vacuumEntityId = this.config.entity;

    // Versuche über das Entity-Registry (hass.entities) das Device zu finden
    const entities = this.hass.entities;
    const vacuumEntityEntry = entities?.[vacuumEntityId];
    const deviceId = vacuumEntityEntry?.device_id;

    if (deviceId && entities) {
      // Suche nach Sensor-Entities mit demselben device_id
      for (const [entityId, entry] of Object.entries(entities)) {
        if (entry.device_id === deviceId &&
            entityId.startsWith('sensor.') &&
            this._isBatteryEntityId(entityId) &&
            this.hass.states[entityId]) {
          return entityId;
        }
      }
    }

    // Fallback: Namenskonvention - aus vacuum.XYZ wird sensor.XYZ_battery
    const baseName = vacuumEntityId.replace(/^vacuum\./, '');
    const suffixes = ['_battery', '_batterie', '_akku', '_battery_level', '_battery_level_sensor'];
    for (const suffix of suffixes) {
      const candidate = `sensor.${baseName}${suffix}`;
      if (this.hass.states[candidate]) return candidate;
    }

    // Letzter Versuch: Durchsuche alle Sensor-States nach Batterie-Keyword
    // die den vacuum-Namen als Substring enthalten
    const vacuumName = baseName.toLowerCase();
    const prefix = vacuumName.split('_')[0];
    for (const entityId of Object.keys(this.hass.states)) {
      if (entityId.startsWith('sensor.') &&
          this._isBatteryEntityId(entityId) &&
          entityId.toLowerCase().includes(prefix) &&
          this.hass.states[entityId]) {
        return entityId;
      }
    }

    return null;
  }

  get _fanSpeed() {
    return this._stateObj?.attributes.fan_speed || this._stateObj?.attributes.fan_speed_level || '';
  }

  get _fanSpeedList() {
    return this._stateObj?.attributes.fan_speed_list || [];
  }

  get _cleaningMode() {
    return this._stateObj?.attributes.cleaning_mode || '';
  }

  get _rooms() {
    if (!this._stateObj) return [];
    const attrs = this._stateObj.attributes || {};

    // 1) Direkt als Array: [{id, name}] oder [{segmentId, rawName}, ...]
    if (Array.isArray(attrs.rooms)) {
      return attrs.rooms.map(r => ({
        id: r.id ?? r.segmentId ?? r.segment_id,
        name: r.name ?? r.rawName ?? r.segment_name ?? r,
      })).filter(r => r.id != null && r.name);
    }

    // 1b) Array von Strings: ['Wohnzimmer', 'Küche', ...]
    if (Array.isArray(attrs.rooms) && attrs.rooms.length > 0 && typeof attrs.rooms[0] === 'string') {
      return attrs.rooms.map((name, i) => ({ id: i, name }));
    }

    // 2) Verschachtelt: {rooms: [{segmentId, rawName}, ...]} (Roborock Traits-Format)
    if (attrs.rooms?.rooms && Array.isArray(attrs.rooms.rooms)) {
      return attrs.rooms.rooms.map(r => ({
        id: r.segmentId ?? r.id,
        name: r.rawName ?? r.name,
      })).filter(r => r.id != null && r.name);
    }

    // 3) map_segments (Valetudo)
    if (Array.isArray(attrs.map_segments)) {
      return attrs.map_segments.map(r => ({
        id: r.id ?? r.segmentId,
        name: r.name ?? r.rawName,
      })).filter(r => r.id != null && r.name);
    }

    return [];
  }

  /**
   * Ruft alle Bereiche (Areas) aus der Home-Assistant-Area-Registry ab.
   * Verwendet die WebSocket-API (config/area_registry/list).
   * Entspricht der {{ areas() }}-Template-Funktion in HA-Templates.
   */
  async _fetchHAAreas() {
    if (!this.hass) return;
    try {
      // Bereiche über die HA-WebSocket-API abrufen
      const areas = await this.hass.callWS({ type: 'config/area_registry/list' });
      this._haAreas = areas.map(area => ({
        id: area.area_id,
        name: area.name,
      })).filter(a => a.name);
      this.requestUpdate();
    } catch (e) {
      // Fallback: Versuche über die REST-API
      try {
        const response = await this.hass.callApi('GET', 'config/area_registry/list');
        this._haAreas = (response || []).map(area => ({
          id: area.area_id,
          name: area.name,
        })).filter(a => a.name);
        this.requestUpdate();
      } catch (e2) {
        console.warn('VacuumCard: Fehler beim Abrufen der HA-Bereiche (WebSocket & REST)', e, e2);
        this._haAreas = [];
        this.requestUpdate();
      }
    }
  }

  /**
   * Gibt alle verfügbaren Bereiche zurück – priorisiert:
   * 1. Vom Staubsauger gelieferte Räume (mit Segment-IDs)
   * 2. Home-Assistant-Areas (aus der Area-Registry)
   *
   * Wenn config.areas gesetzt ist, werden nur die darin aufgeführten
   * Bereiche angezeigt (Matching über name oder id, case-insensitive).
   */
  get _allAreas() {
    const vacuumRooms = this._rooms;
    let areas;
    if (vacuumRooms.length > 0) {
      areas = vacuumRooms.map(r => ({
        ...r,
        source: 'vacuum',
      }));
    } else {
      areas = this._haAreas.map(a => ({
        ...a,
        source: 'ha',
      }));
    }

    // Filterung über config.areas
    const filterList = this.config?.areas;
    if (filterList && filterList.length > 0) {
      const lowerFilter = filterList.map(f => f.toLowerCase());
      areas = areas.filter(a =>
        lowerFilter.includes(a.name?.toLowerCase()) ||
        lowerFilter.includes(a.id?.toLowerCase())
      );
    }

    return areas;
  }

  /* --- Service Calls --- */
  _callService(service, data = {}) {
    if (!this.hass || !this._stateObj) return;
    this.hass.callService('vacuum', service, {
      entity_id: this.config.entity,
      ...data,
    });
  }

  _start() { this._callService('start'); }
  _stop() { this._callService('stop'); }
  _pause() { this._callService('pause'); }
  _startPause() {
    if (this._vacuumState === 'cleaning') {
      this._callService('pause');
    } else {
      this._callService('start');
    }
  }
  _returnToDock() { this._callService('return_to_base'); }
  _locate() { this._callService('locate'); }
  _spotClean() { this._callService('clean_spot'); }
  _setFanSpeed(speed) {
    this._callService('set_fan_speed', { fan_speed: speed });
    this._fanSpeedOpen = false;
    this.requestUpdate();
  }

  _toggleFanSpeed() {
    this._fanSpeedOpen = !this._fanSpeedOpen;
    this.requestUpdate();
  }

  _handleOutsideClick = (e) => {
    if (this._fanSpeedOpen) {
      const dropdown = this.shadowRoot?.querySelector('.dropdown-wrapper');
      if (dropdown) {
        // Ermittle das tatsächliche Klickziel (mit Fallback für Umgebungen ohne composedPath)
        const target = e.composedPath ? e.composedPath()[0] : e.target;
        // Prüfe, ob der Klick AUSSERHALB des dropdown-wrapper liegt
        if (!dropdown.contains(target)) {
          this._fanSpeedOpen = false;
          this.requestUpdate();
        }
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('click', this._handleOutsideClick);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('click', this._handleOutsideClick);
  }

  /* --- Render --- */
  render() {
    if (!this.hass || !this._stateObj) {
      return html`<ha-card><div class="card">Entity not available: ${this.config?.entity}</div></ha-card>`;
    }

    const state = this._vacuumState;
    const battery = this._batteryLevel;
    const fanSpeed = this._fanSpeed;
    const fanSpeedList = this._fanSpeedList;
    const lastChanged = this._stateObj.last_changed;

    // Determine vacuum color based on state
    const stateColors = {
      docked: 'var(--state-vacuum-docked-color, var(--state-vacuum-inactive-color, var(--state-inactive-color, #44739e)))',
      cleaning: 'var(--state-vacuum-cleaning-color, var(--state-vacuum-active-color, var(--state-active-color, #4caf50)))',
      returning: 'var(--state-vacuum-returning-color, var(--state-vacuum-active-color, var(--state-active-color, #ff9800)))',
      paused: 'var(--state-vacuum-paused-color, var(--state-vacuum-inactive-color, var(--state-inactive-color, #ff9800)))',
      idle: 'var(--state-vacuum-inactive-color, var(--state-inactive-color, #44739e))',
      error: 'var(--error-color, #f44336)',
    };
    const vacuumColor = stateColors[state] || stateColors.docked;

    const canStart = state === 'idle' || state === 'docked' || state === 'paused';
    const canStop = state === 'cleaning' || state === 'paused' || state === 'returning';

    return html`
      <ha-card>
        <div class="card">
          <!-- Title -->
          ${this.config.show_title && this.config.title ? html`
            <div class="card-header" style="padding:0 0 12px 0;font-size:18px;font-weight:500;color:var(--primary-text-color);">
              ${this.config.title}
            </div>
          ` : ''}

          <!-- State Header -->
          <div class="state-header">
            <div class="state-info">
              <p class="state-text">${localize(state)}</p>
              <p class="last-changed">
                <ha-relative-time datetime="${lastChanged}" capitalize>
                  ${relativeTime(lastChanged)}
                </ha-relative-time>
              </p>
            </div>
            <div class="battery">
              <span>${battery} %</span>
              ${svgIcon(ICONS.battery, 20)}
            </div>
          </div>

          <!-- Vacuum SVG -->
          <div class="vacuum-svg-container">
            ${this._renderVacuumSVG(state, vacuumColor)}
          </div>

          <!-- Control Buttons -->
          <div class="buttons">
            <button class="control-btn" @click=${this._startPause} ?disabled=${!canStart && !canStop}
              title="${state === 'cleaning' ? 'Pause' : 'Start'}">
              ${state === 'cleaning' ? this._renderPauseIcon() : svgIcon(ICONS.play)}
            </button>
            <button class="control-btn" @click=${this._stop} ?disabled=${!canStop}
              title="Stoppen">
              ${svgIcon(ICONS.stop)}
            </button>
            <button class="control-btn" @click=${this._returnToDock}
              title="Zur Basis zurückkehren">
              ${svgIcon(ICONS.dock)}
            </button>
            <button class="control-btn" @click=${this._locate}
              title="Lokalisieren">
              ${svgIcon(ICONS.locate)}
            </button>
            <button class="control-btn" @click=${this._spotClean}
              title="Fleck reinigen">
              ${svgIcon(ICONS.spot)}
            </button>
          </div>

          <!-- Select Controls -->
          <div class="select-container">
            <!-- Fan Speed -->
            ${fanSpeedList.length > 0 ? html`
              <div class="dropdown-wrapper">
                <button class="select-menu" @click=${this._toggleFanSpeed}>
                  <span class="icon">${svgIcon(ICONS.fan, 20)}</span>
                  <span class="content">
                    <p class="label">Fan speed</p>
                    <p class="value">${fanSpeed || '—'}</p>
                  </span>
                </button>
                <div class="dropdown-menu ${this._fanSpeedOpen ? 'open' : ''}">
                  ${fanSpeedList.map(speed => html`
                    <button class="dropdown-item ${speed === fanSpeed ? 'selected' : ''}"
                      @click=${() => this._setFanSpeed(speed)}>
                      ${speed}
                    </button>
                  `)}
                </div>
              </div>
            ` : ''}

            <!-- Clean Areas -->
            <button class="clean-areas-btn" @click=${this._openCleanAreas}>
              <span class="icon">${svgIcon(ICONS.cleanAreas, 20)}</span>
              <span class="content">
                <p class="label">Reinigung</p>
                <p class="value">${this._cleaningMode || 'Nach Bereich'}</p>
              </span>
              <span class="icon">${svgIcon(ICONS['arrow-right'], 18)}</span>
            </button>
          </div>

          <!-- Area Selection Dialog -->
          ${this._showAreaDialog ? this._renderAreaDialog() : ''}
        </div>
      </ha-card>
    `;
  }

  _renderPauseIcon() {
    return html`
      <svg viewBox="0 0 24 24" style="width:24px;height:24px;fill:var(--primary-text-color);">
        <g>
          <path d="M14,19H18V5H14V19M6,19H10V5H6V19Z"></path>
        </g>
      </svg>
    `;
  }

  _renderAreaDialog() {
    const allAreas = this._allAreas;
    const hasAreas = allAreas.length > 0;
    const isHASource = this._rooms.length === 0 && this._haAreas.length > 0;

    return html`
      <div class="area-dialog-overlay" @click=${this._closeAreaDialog}>
        <div class="area-dialog" @click=${(e) => e.stopPropagation()}>
          <div class="area-dialog-header">
            <h3>Reinigung nach Bereich</h3>
            <button class="close-btn" @click=${this._closeAreaDialog}>✕</button>
          </div>

          ${hasAreas ? html`
            ${isHASource ? html`
              <p class="area-hint" style="margin-bottom:12px;">
                Bereiche aus deiner Home-Assistant-Area-Registry.
                Bereichsbasierte Reinigung erfordert ggf. zusätzliche Konfiguration.
              </p>
            ` : ''}
            ${this.config?.areas?.length > 0 ? html`
              <p class="area-hint" style="margin-bottom:12px;font-style:italic;">
                Gefiltert nach Konfiguration — ${this.config.areas.length} Bereich${this.config.areas.length > 1 ? 'e' : ''} konfiguriert.
              </p>
            ` : ''}
            <div class="area-grid">
              ${allAreas.map((area) => {
                const areaName = area.name;
                const isSelected = this._selectedAreas.includes(areaName);
                const order = this._selectedAreas.indexOf(areaName) + 1;
                return html`
                  <div class="area-card ${isSelected ? 'selected' : ''}"
                       @click=${() => this._toggleArea(areaName)}>
                    ${isSelected ? html`<span class="badge">${order}</span>` : ''}
                    <div class="area-icon">${svgIcon(ICONS.cleanAreas, 24)}</div>
                    <div class="area-name">${areaName}</div>
                  </div>
                `;
              })}
            </div>
            <p class="area-hint">
              Die Reihenfolge, in der Bereiche gereinigt werden, wird von deinem
              Staubsauger möglicherweise nicht unterstützt.
            </p>
            <div class="area-dialog-actions">
              <button class="action-btn secondary" @click=${this._closeAreaDialog}>
                Abbrechen
              </button>
              <button class="action-btn primary"
                      ?disabled=${this._selectedAreas.length === 0}
                      @click=${this._startAreaCleaning}>
                ${this._selectedAreas.length > 0
                  ? `${this._selectedAreas.length} Bereich${this._selectedAreas.length > 1 ? 'e' : ''} reinigen`
                  : 'Bereiche auswählen'}
              </button>
            </div>
          ` : html`
            <div class="area-empty">
              <p>Keine Bereiche verfügbar.</p>
              <p class="area-hint">
                Dein Staubsauger unterstützt möglicherweise keine
                bereichsbasierte Reinigung, oder die Raumdaten sind nicht
                verfügbar.
              </p>
            </div>
            <div class="area-dialog-actions">
              <button class="action-btn primary" @click=${this._closeAreaDialog}>
                Schließen
              </button>
            </div>
          `}
        </div>
      </div>
    `;
  }

  _renderVacuumSVG(state, color) {
    const isActive = state === 'cleaning' || state === 'returning';

    return html`
      <svg viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" class="vacuum-svg">
        <defs>
          <style>
            .particle { animation: particle-float 2.5s ease-out infinite; }
            .p1 { animation-delay: 0s; --dx: 30px; --dy: -20px; }
            .p2 { animation-delay: 0.3s; --dx: -25px; --dy: -25px; }
            .p3 { animation-delay: 0.6s; --dx: 20px; --dy: -35px; }
            .p4 { animation-delay: 0.9s; --dx: -30px; --dy: -15px; }
            .p5 { animation-delay: 1.2s; --dx: 35px; --dy: -25px; }
            .p6 { animation-delay: 1.5s; --dx: -20px; --dy: -30px; }
            .p7 { animation-delay: 1.8s; --dx: 15px; --dy: -40px; }
            .p8 { animation-delay: 2.1s; --dx: -35px; --dy: -20px; }
            @keyframes particle-float {
              0% { opacity: 0; transform: translate(0, 0) scale(0); }
              20% { opacity: 0.6; }
              100% { opacity: 0; transform: translate(var(--dx, 20px), var(--dy, -30px)) scale(1); }
            }
            .glow { animation: pulse-glow 3s ease-in-out infinite; }
            @keyframes pulse-glow {
              0%, 100% { opacity: 0.04; }
              50% { opacity: 0.1; }
            }
            ${isActive ? `
              .vacuum-body-rotate { animation: body-drift 0.8s ease-in-out infinite alternate; transform-origin: 120px 120px; }
              @keyframes body-drift { 0% { transform: rotate(-1deg); } 100% { transform: rotate(1deg); } }
              .brush-spokes line { animation: brush-spin 1.5s linear infinite; transform-origin: 174px 76px; }
              @keyframes brush-spin { 100% { transform: rotate(360deg); } }
            ` : ''}
            .dock-indicator { animation: dock-pulse 2s ease-in-out infinite; }
            @keyframes dock-pulse { 0%, 100% { opacity: 0.8; } 50% { opacity: 1; } }
          </style>
        </defs>

        <!-- Glow -->
        <circle cx="120" cy="120" r="110" class="glow" fill="${color}" opacity="0.06"></circle>

        <g class="vacuum-body-rotate">
          <g class="vacuum-body">
            <!-- Brush right -->
            <g class="brush brush-right">
              <g class="brush-spokes">
                <line x1="174" y1="76" x2="174" y2="64" stroke="${color}" stroke-width="1.2" stroke-linecap="round" opacity="0.5"></line>
                <line x1="174" y1="76" x2="174" y2="88" stroke="${color}" stroke-width="1.2" stroke-linecap="round" opacity="0.5"></line>
                <line x1="174" y1="76" x2="162" y2="76" stroke="${color}" stroke-width="1.2" stroke-linecap="round" opacity="0.5"></line>
                <line x1="174" y1="76" x2="186" y2="76" stroke="${color}" stroke-width="1.2" stroke-linecap="round" opacity="0.5"></line>
              </g>
              <circle cx="174" cy="76" r="2" fill="${color}" opacity="0.5"></circle>
            </g>

            <!-- Main body -->
            <circle cx="120" cy="120" r="72" fill="var(--card-background-color, #fff)" stroke="${color}" stroke-width="2"></circle>
            <circle cx="120" cy="120" r="66" fill="none" stroke="${color}" stroke-width="0.8" opacity="0.2"></circle>

            <!-- Bumper -->
            <path d="M 60 94 A 68 68 0 0 1 180 94" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" class="bumper"></path>

            <!-- Nav lines -->
            <g class="nav-lines" opacity="0.15">
              <line x1="120" y1="56" x2="120" y2="74" stroke="${color}" stroke-width="1.5"></line>
              <line x1="88" y1="63" x2="96" y2="78" stroke="${color}" stroke-width="1.5"></line>
              <line x1="152" y1="63" x2="144" y2="78" stroke="${color}" stroke-width="1.5"></line>
            </g>

            <!-- LiDAR -->
            <circle cx="120" cy="108" r="14" fill="var(--card-background-color, #fff)" stroke="${color}" stroke-width="2" class="lidar-housing"></circle>
            <circle cx="120" cy="108" r="9" fill="none" stroke="${color}" stroke-width="0.8" opacity="0.25"></circle>

            <!-- Power button -->
            <circle cx="120" cy="140" r="8" fill="${color}" opacity="0.08" class="power-ring"></circle>
            <circle cx="120" cy="140" r="4" fill="${color}" opacity="0.25" class="power-dot"></circle>
          </g>
        </g>

        <!-- Particles (only when active) -->
        ${isActive ? html`
          <g class="particles">
            <circle class="particle p1" cx="120" cy="120" r="2" fill="${color}"></circle>
            <circle class="particle p2" cx="120" cy="120" r="1.5" fill="${color}"></circle>
            <circle class="particle p3" cx="120" cy="120" r="1.5" fill="${color}"></circle>
            <circle class="particle p4" cx="120" cy="120" r="2" fill="${color}"></circle>
            <circle class="particle p5" cx="120" cy="120" r="1.5" fill="${color}"></circle>
            <circle class="particle p6" cx="120" cy="120" r="1.5" fill="${color}"></circle>
            <circle class="particle p7" cx="120" cy="120" r="1" fill="${color}"></circle>
            <circle class="particle p8" cx="120" cy="120" r="1" fill="${color}"></circle>
          </g>
        ` : ''}

        <!-- Dock indicator (when docked or returning) -->
        ${state === 'docked' || state === 'returning' ? html`
          <g class="dock-indicator">
            <rect x="76" y="188" width="88" height="28" rx="8" fill="var(--card-background-color, #fff)" stroke="${color}" stroke-width="2"></rect>
          </g>
          <g class="return-path">
            <polygon points="120,220 110,206 130,206" fill="${color}" stroke="${color}" stroke-width="2" stroke-linejoin="round" opacity="0.55"></polygon>
          </g>
        ` : ''}
      </svg>
    `;
  }

  _openCleanAreas() {
    if (!this.hass || !this._stateObj) return;
    this._selectedAreas = [];
    this._showAreaDialog = true;
    this._fetchHAAreas();
    this.requestUpdate();
  }

  _closeAreaDialog() {
    this._showAreaDialog = false;
    this._selectedAreas = [];
    this.requestUpdate();
  }

  _toggleArea(areaId) {
    if (this._selectedAreas.includes(areaId)) {
      this._selectedAreas = this._selectedAreas.filter(id => id !== areaId);
    } else {
      this._selectedAreas = [...this._selectedAreas, areaId];
    }
    this.requestUpdate();
  }

  _startAreaCleaning() {
    if (!this.hass || !this._stateObj || this._selectedAreas.length === 0) return;

    const vacuumRooms = this._rooms;

    if (vacuumRooms.length > 0) {
      // Vakuum-eigene Räume mit Segment-IDs (Roborock-Stil)
      const segmentIds = this._selectedAreas
        .map(name => {
          const room = vacuumRooms.find(r => r.name === name || r.id === name);
          return room ? room.id : null;
        })
        .filter(id => id !== null);
      if (segmentIds.length > 0) {
        this._callService('send_command', {
          command: 'app_segment_clean',
          params: { segments: segmentIds },
        });
      }
    } else if (this._haAreas.length > 0) {
      // HA-Areas (keine Vakuum-Segment-IDs verfügbar)
      // Verwende Area-Namen als Parameter für den Reinigungsbefehl
      this._callService('send_command', {
        command: 'app_segment_clean',
        params: { segments: this._selectedAreas },
      });
    }
    this._closeAreaDialog();
  }

  static getConfigElement() {
    return document.createElement('homeassistant-vacuumcard-editor');
  }

  static getStubConfig() {
    return {
      type: 'custom:homeassistant-vacuumcard',
      entity: '',
      title: 'Staubsauger',
      show_title: true,
      animated: true,
      battery_entity: '',
      areas: [],
    };
  }
}

customElements.define('homeassistant-vacuumcard', VacuumCard);

/* ---------- Vacuum Card Editor ---------- */
class VacuumCardEditor extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      config: { type: Object },
      _config: { type: Object, state: true },
    };
  }

  static get styles() {
    return css`
      :host { display: block; }
      .card-config { direction: ltr; }
      .card-config ha-entity-picker {
        display: block;
        margin-top: 8px;
      }
      .card-config .title-input {
        display: block;
        width: 100%;
        margin-top: 8px;
        padding: 10px 12px;
        border: 1px solid var(--divider-color, rgba(0,0,0,0.12));
        border-radius: var(--ha-card-border-radius, 8px);
        background: var(--input-background-color, var(--card-background));
        color: var(--primary-text-color);
        font-size: 14px;
        font-family: var(--primary-font-family, 'Roboto', sans-serif);
        box-sizing: border-box;
        outline: none;
        transition: border-color 0.2s;
      }
      .card-config .title-input:focus {
        border-color: var(--primary-color, #03a9f4);
      }
      .card-config .title-input::placeholder {
        color: var(--secondary-text-color);
        opacity: 0.7;
      }

      .load-areas-btn {
        padding: 8px 14px;
        border: none;
        border-radius: var(--ha-card-border-radius, 8px);
        background: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #fff);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s;
        white-space: nowrap;
        font-family: var(--primary-font-family, 'Roboto', sans-serif);
        height: 38px;
      }

      .load-areas-btn:hover {
        opacity: 0.85;
      }

      .load-areas-btn:active {
        opacity: 0.7;
      }
    `;
  }

  constructor() {
    super();
    this._config = {};
  }

  setConfig(config) {
    this._config = {
      type: 'custom:homeassistant-vacuumcard',
      entity: config?.entity || '',
      title: config?.title || '',
      show_title: config?.show_title !== false,
      animated: config?.animated !== false,
      battery_entity: config?.battery_entity || '',
      areas: Array.isArray(config?.areas) ? [...config.areas] : [],
    };
  }

  _updateConfig(key, value) {
    this._config = {
      ...this._config,
      type: 'custom:homeassistant-vacuumcard',
      [key]: value,
    };
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  _entityPicked(ev) {
    this._updateConfig('entity', ev.detail.value);
  }

  _showTitleChanged(ev) {
    this._updateConfig('show_title', ev.target.checked);
  }

  _animatedChanged(ev) {
    this._updateConfig('animated', ev.target.checked);
  }

  _batteryEntityPicked(ev) {
    this._updateConfig('battery_entity', ev.detail.value || '');
  }

  _areasInputChanged(ev) {
    const raw = ev.target?.value ?? '';
    const list = raw
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    this._updateConfig('areas', list);
  }

  async _loadAreas() {
    if (!this.hass) return;

    // Warnung, wenn bereits Bereiche konfiguriert sind
    const currentAreas = this._config?.areas;
    if (currentAreas && currentAreas.length > 0) {
      const confirmed = confirm(
        'Bereits konfigurierte Bereiche werden ersetzt.\n\n' +
        `Aktuell: ${currentAreas.join(', ')}\n\n` +
        'Möchtest du alle Bereiche aus Home Assistant laden und die bisherige Eingabe ersetzen?'
      );
      if (!confirmed) return;
    }

    try {
      const areas = await this.hass.callWS({ type: 'config/area_registry/list' });
      const names = areas
        .map(a => a.name)
        .filter(n => n && n.length > 0);
      this._updateConfig('areas', names);
    } catch (e) {
      console.warn('VacuumCard Editor: Fehler beim Laden der Bereiche', e);
    }
  }

  _titleInputChanged(ev) {
    const value = ev.target?.value ?? ev.detail?.value ?? '';
    this._updateConfig('title', value);
  }

  render() {
    if (!this.hass) return html``;

    const config = this._config;

    return html`
      <div class="card-config">
        <ha-entity-picker
          .hass=${this.hass}
          .value=${config.entity}
          .includeDomains=${['vacuum']}
          @value-changed=${this._entityPicked}
          label="Staubsauger-Entity"
        ></ha-entity-picker>

        <div style="margin-top:16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;">
            <span style="color:var(--primary-text-color);font-size:14px;">Titel anzeigen</span>
            <ha-switch
              .checked=${config.show_title !== false}
              @change=${this._showTitleChanged}
            ></ha-switch>
          </div>
          <input
            class="title-input"
            .value=${config.title || ''}
            placeholder="z.B. Mein Saugroboter"
            @input=${this._titleInputChanged}
          />
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;margin-top:8px;">
          <span style="color:var(--primary-text-color);font-size:14px;">Animationen</span>
          <ha-switch
            .checked=${config.animated !== false}
            @change=${this._animatedChanged}
          ></ha-switch>
        </div>

        <ha-entity-picker
          .hass=${this.hass}
          .value=${config.battery_entity || ''}
          .includeDomains=${['sensor']}
          @value-changed=${this._batteryEntityPicked}
          label="Batterie-Sensor (optional)"
          placeholder="Automatisch erkennen"
          style="display:block;margin-top:16px;"
        ></ha-entity-picker>

        <div style="margin-top:16px;">
          <div style="display:flex;gap:8px;align-items:center;">
            <input
              class="title-input"
              style="flex:1;margin-top:0;"
              .value=${Array.isArray(config.areas) ? config.areas.join(', ') : ''}
              placeholder="z.B. Wohnzimmer, Küche, Flur"
              @input=${this._areasInputChanged}
            />
            <button
              class="load-areas-btn"
              @click=${this._loadAreas}
              title="Bereiche aus Home Assistant laden"
            >
              Laden
            </button>
          </div>
          <p style="font-size:11px;color:var(--secondary-text-color);margin:4px 0 0 0;line-height:1.4;">
            Bereiche filtern (kommagetrennt). Nur diese Bereiche werden im Dialog angezeigt.
            <button class="load-link-btn" @click=${this._loadAreas} style="background:none;border:none;color:var(--primary-color,#03a9f4);cursor:pointer;font-size:11px;padding:0;text-decoration:underline;">
              Bereiche aus HA laden
            </button>
          </p>
        </div>
      </div>
    `;
  }
}

customElements.define('homeassistant-vacuumcard-editor', VacuumCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'homeassistant-vacuumcard',
  name: 'Homeassistant Vacuumcard',
  description: 'A full-featured vacuum control panel with animated visualization',
  preview: true,
});
