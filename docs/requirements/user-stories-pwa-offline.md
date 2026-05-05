# User Stories — PWA & Offline Capability
**Feature Area:** Progressive Web App, Service Worker, Offline Play  
**Author:** Analyst Agent  
**Date:** 2026-05-04  
**Status:** Final

---

## US-04 — Play Offline

**Title:** Offline Gameplay  
**User Story:** As a player, I want to play the game offline, so that I can enjoy solitaire without an internet connection.

**Acceptance Criteria:**

```gherkin
Feature: Offline Gameplay

  Scenario: Game is fully playable after first load with no network
    Given the player has visited the app at least once while online
    And all assets have been cached by the service worker
    When the player goes offline (network disconnected)
    And opens the app or refreshes the page
    Then the app loads completely from the service worker cache
    And all game interactions function identically to online mode
    And no network requests are made during gameplay

  Scenario: Player visits for the first time while offline
    Given the service worker has never been installed on the device
    When the player opens the app with no network connection
    Then a graceful "You appear to be offline. Please connect to load the app for the first time." message is shown
    And the game does not attempt to load broken assets

  Scenario: Service worker pre-caches all required assets on install
    Given the service worker is being installed for the first time
    When the install event fires
    Then all HTML, JS, CSS, card SVG assets, and game config JSON files are pre-cached
    And the service worker activates only after all assets are successfully cached

  Scenario: Stale cache update flow
    Given the player is online and a new version of the app is deployed
    When the new service worker detects it is waiting
    Then a non-blocking banner appears: "Update available — refresh to get the latest version"
    And clicking the banner reloads the app with the new service worker active
```

**Priority:** P0  
**Phase:** MVP

---

## US-05 — Install to Home Screen (PWA)

**Title:** PWA Install Prompt  
**User Story:** As a player, I want to install the app to my home screen, so that I can access it like a native app without visiting a URL.

**Acceptance Criteria:**

```gherkin
Feature: PWA Install Prompt

  Scenario: Install prompt appears for eligible users
    Given the player has used the app for at least one session
    And the browser supports PWA installation
    And the player has not previously dismissed or accepted the prompt
    When the beforeinstallprompt event fires
    Then a custom install banner/button appears in the app UI
    And the banner says "Add Svelte-Solitaire to your home screen"

  Scenario: Player accepts the install prompt
    Given the custom install banner is visible
    When the player taps "Install"
    Then the browser's native install flow is triggered
    And the app icon appears on the device's home screen
    And the app opens in standalone mode (no browser chrome)

  Scenario: Player dismisses the install prompt
    Given the custom install banner is visible
    When the player taps "Not now"
    Then the banner is hidden
    And it does not reappear for at least 7 days

  Scenario: App opens in standalone mode after installation
    Given the app has been installed to the home screen
    When the player opens the app from the home screen icon
    Then the app launches without browser address bar or navigation chrome
    And the theme color matches the manifest (#1a6b3a)
    And the start URL is the main game screen
```

**Priority:** P1  
**Phase:** MVP

---

## US-MW — Web App Manifest

**Title:** Valid Web App Manifest  
**User Story:** As a developer/platform, the app must expose a valid `manifest.json`, so that browsers can identify it as an installable PWA.

**Acceptance Criteria:**

```gherkin
Feature: Web App Manifest

  Scenario: Manifest is served with correct MIME type
    Given the app is loaded in a browser
    When the browser fetches /manifest.json
    Then the response Content-Type is "application/manifest+json"
    And the manifest contains: name, short_name, start_url, display, background_color, theme_color, icons

  Scenario: Manifest icons cover all required sizes
    Given the manifest is parsed
    Then icons exist for sizes: 72, 96, 128, 144, 152, 192, 384, 512 (pixels)
    And at least one icon has purpose "maskable"
    And at least one icon has purpose "any"

  Scenario: display mode is standalone
    Given the manifest is parsed
    Then the "display" field is set to "standalone"
    And the "orientation" field is set to "portrait-primary"
```

**Priority:** P0  
**Phase:** MVP

---

## US-PERF — Performance Targets

**Title:** Load Performance  
**User Story:** As a player, I want the app to load in under 2 seconds on a 3G connection, so that I can start playing quickly even on slow networks.

**Acceptance Criteria:**

```gherkin
Feature: Load Performance

  Scenario: First Contentful Paint within threshold
    Given the app is loaded on a simulated 3G connection (Lighthouse throttling)
    When the browser begins rendering
    Then the First Contentful Paint (FCP) occurs within 1.5 seconds

  Scenario: Time to Interactive within threshold
    Given the app is loaded on a simulated 3G connection
    When the page is fully interactive
    Then Time to Interactive (TTI) is within 3.0 seconds

  Scenario: JavaScript bundle size is within budget
    Given the production build is generated
    When the total gzipped JS payload is measured
    Then the total is less than 100 KB

  Scenario: Lighthouse scores meet targets
    Given the production build is deployed
    When Lighthouse is run against the production URL
    Then Performance score is >= 90
    And PWA score is 100
    And Accessibility score is >= 90
    And Best Practices score is >= 90
```

**Priority:** P0  
**Phase:** MVP
