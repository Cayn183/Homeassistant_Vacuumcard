# Homeassistant Vacuumcard

Eine benutzerdefinierte Home Assistant Lovelace-Karte, die das gesamte Staubsauger-Bedienfeld aus dem More-Info-Dialog nachbildet – inklusive animierter SVG-Visualisierung, Batterieanzeige, Steuerungstasten, Lüftergeschwindigkeitsauswahl und bereichsbasierter Reinigung.

![Homeassistant Vacuumcard](https://img.shields.io/badge/HA-Homeassistant%20Vacuumcard-blue)

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
- 🧽 **Bereichsbasierte Reinigung** mit Raumauswahl-Dialog
- 🌐 **Unterstützt Übersetzungen** für Status-Texte

## Installation

### Via HACS (empfohlen)

1. Öffne HACS in Home Assistant
2. Gehe zu "Frontend"
3. Klicke auf das Menü (drei Punkte) → "Custom repositories"
4. Füge `https://github.com/Cayn183/Homeassistant_Vacuumcard` als "Lovelace" hinzu
5. Klicke auf "Durchsuchen & Herunterladen" und suche nach "Homeassistant Vacuumcard"
6. Klicke auf "Herunterladen"
7. Füge die Karte zu deinem Dashboard hinzu

### Manuelle Installation

1. Lade `homeassistant-vacuumcard.js` herunter
2. Kopiere die Datei in den Ordner `/config/www/` deiner Home Assistant-Installation
3. Füge folgendes zu deiner `ui-lovelace.yaml` oder im Raw-Config-Editor hinzu:

```yaml
resources:
  - url: /local/homeassistant-vacuumcard.js
    type: module
```

## Verwendung

Füge eine Karte mit `type: 'custom:homeassistant-vacuumcard'` zu deinem Dashboard hinzu:

```yaml
type: custom:homeassistant-vacuumcard
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
# Für Produktion einfach die homeassistant-vacuumcard.js verwenden
```

## Lizenz

MIT
