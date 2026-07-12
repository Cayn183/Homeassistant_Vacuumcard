# Vacuum Control Card

Eine benutzerdefinierte Home Assistant Lovelace-Karte, die das gesamte Staubsauger-Bedienfeld aus dem More-Info-Dialog nachbildet – inklusive animierter SVG-Visualisierung, Batterieanzeige, Steuerungstasten und Lüftergeschwindigkeitsauswahl.

![Vacuum Card Vorschau](https://img.shields.io/badge/HA%-Vacuum%20Card-blue)

## Funktionen

- 🔋 **Batterieanzeige** mit Prozentwert und Icon
- 🧹 **Animierte SVG-Visualisierung** des Roboters mit:
  - Rotierenden Bürsten (während der Reinigung)
  - Schwebepartikel (im aktiven Modus)
  - Dock-Indikator (im Gedockt-/Rückkehrmodus)
  - LiDAR-Sensor, Stoßstange und Power-Taste
  - Farbcodierung je nach Status (Grün = Reinigen, Orange = Rückkehr, Blau = Gedockt, etc.)
- 🎮 **Steuerungstasten**:
  - ▶️ Start/Pause
  - ⏹️ Stop
  - 🏠 Zur Basis zurückkehren
  - 📍 Lokalisieren
  - 🔲 Fleck reinigen
- 💨 **Lüftergeschwindigkeitsauswahl** (Dropdown-Menü)
- 🧽 **Reinigungsmodus-Anzeige**
- 🌐 **Unterstützt Übersetzungen** für Status-Texte

## Installation

### Via HACS (empfohlen)

1. Öffne HACS in Home Assistant
2. Gehe zu "Frontend"
3. Klicke auf das Menü (drei Punkte) → "Custom repositories"
4. Füge `https://github.com/DEIN_USERNAME/Homeassistant_Vacuumcard` als "Lovelace" hinzu
5. Klicke auf "Durchsuchen & Herunterladen" und suche nach "Vacuum Control Card"
6. Klicke auf "Herunterladen"
7. Füge die Karte zu deinem Dashboard hinzu

### Manuelle Installation

1. Lade `vacuum-card.js` herunter
2. Kopiere die Datei in den Ordner `/config/www/` deiner Home Assistant-Installation
3. Füge folgendes zu deiner `ui-lovelace.yaml` oder im Raw-Config-Editor hinzu:

```yaml
resources:
  - url: /local/vacuum-card.js
    type: module
```

## Verwendung

Füge eine Karte mit `type: 'custom:vacuum-card'` zu deinem Dashboard hinzu:

```yaml
type: custom:vacuum-card
entity: vacuum.dein_saugroboter
title: Mein Saugroboter
show_title: true
animated: true
```

### Optionen

| Option | Typ | Standard | Beschreibung |
|--------|-----|----------|-------------|
| `entity` | string | **erforderlich** | Die Entity-ID deines Staubsaugers |
| `title` | string | `''` | Optionaler Titel, der oben in der Karte angezeigt wird |
| `show_title` | boolean | `true` | Zeige den Titel an |
| `animated` | boolean | `true` | Aktiviere Animationen in der SVG-Visualisierung |

## Unterstützte Zustände

Die Karte unterstützt folgende Staubsauger-Zustände und färbt die Visualisierung entsprechend ein:

| Zustand | Farbe | Beschreibung |
|---------|-------|-------------|
| `docked` | Blau | Angedockt an der Basis |
| `cleaning` | Grün | Reinigung aktiv |
| `returning` | Orange | Rückkehr zur Basis |
| `paused` | Orange/Gelb | Pausiert |
| `idle` | Blau | Bereit |
| `error` | Rot | Fehler |

## Kompatibilität

Getestet mit:
- Home Assistant 2023.8+
- Alle Saugroboter, die den `vacuum`-Domain-Standard unterstützen (z. B. Roborock, Roomba, Xiaomi, Neato, etc.)

## Entwicklung

Die Karte verwendet [LitElement](https://lit-element.polymer-project.org/) und wird als ES-Modul bereitgestellt.

```bash
# Installation der Abhängigkeiten (für Entwicklung)
npm install

# Für Produktion einfach die vacuum-card.js verwenden
```

## Lizenz

MIT
