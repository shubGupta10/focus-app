# Privacy Policy for Lockout

**Effective Date:** October 3, 2026

## 1. Introduction
Lockout ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains our practices regarding the collection, use, and disclosure of information when you use our mobile application ("App").

## 2. Core Philosophy: Offline-First
Lockout is an offline-first focus and productivity application. We do not require you to create an account, and we do not sync your personal data, app usage data, or focus history to any remote servers or third-party cloud services. 

**All your data remains locally on your device.**

## 3. Data We Access and Why
To function as an effective app blocker, Lockout requires specific Android system permissions. Here is what we access and why:

### a) Usage Access (PACKAGE_USAGE_STATS)
- **Why we need it:** We use this permission to detect which application is currently in the foreground of your device.
- **How it is used:** This allows Lockout to immediately show the blocking screen if you open an app that you have selected to block during an active focus session.
- **Data Privacy:** This data is processed locally on your device in real-time. We do not store your app usage history, nor do we transmit this information off your device.

### b) Display Over Other Apps (SYSTEM_ALERT_WINDOW)
- **Why we need it:** We use this permission to draw a full-screen blocking UI over the distracting apps you try to open.
- **How it is used:** When a blocked app is detected, the overlay is displayed on top of it, preventing access.
- **Data Privacy:** This permission does not collect any data; it is strictly used for drawing the user interface.

### c) Foreground Service (FOREGROUND_SERVICE & FOREGROUND_SERVICE_SPECIAL_USE)
- **Why we need it:** We use a Foreground Service to continuously monitor app usage in the background while a focus session is active.
- **How it is used:** This ensures that Lockout remains active and can reliably block apps even if you close the Lockout interface or navigate away.
- **Data Privacy:** The service only runs when you explicitly start a session and stops when the session completes or is canceled. No data is transmitted externally.

## 4. Crash Reporting and Analytics
To improve the stability and performance of Lockout, we use Sentry for crash reporting.
- **Why we need it:** If the app crashes (especially in the background), Sentry automatically securely transmits an error report to help us identify and fix the bug.
- **Data Privacy:** Sentry is configured to collect anonymized technical data, such as device model, OS version, and the stack trace of the crash. We do not transmit personally identifiable information (PII) or your specific focus session data (like the names of your routines or custom blocked apps) to Sentry.

Lockout does not integrate with third-party analytics trackers or advertising SDKs. 

## 5. Changes to This Privacy Policy
We may update our Privacy Policy from time to time. We will notify you of any changes by updating the "Effective Date" at the top of this policy and publishing the new Privacy Policy within the app repository.

## 6. Contact Us
If you have any questions or suggestions about our Privacy Policy, please contact us by filing an issue on our public repository.
