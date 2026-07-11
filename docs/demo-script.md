# StadiumOps AI 5-Minute Demo Script

This script walks through the primary demo scenario for evaluation.

## Scenario
**"A crowd is increasing rapidly near Gate 4. Two people have fallen and fans are pushing each other."**

---

### Step 1: Access control & Dashboard Inspection (0:30)
1. Launch the application UI in the browser.
2. Select the **Sofia (Operations Manager)** role from the bottom-left dropdown selector.
3. Observe the initial stadium status: Open Incidents, Critical Issues, and average resolution metrics. Note the simulated telemetry showing elevated crowds in Zone B.

### Step 2: Reporting the Incident (1:00)
1. Click **Report Incident** in the navigation bar.
2. Click the **⚡ Load Demo Scenario** button. This automatically populates the form with:
   - **Title**: Gate 4 Crowd Compress
   - **Description**: A crowd is increasing rapidly near Gate 4. Two people have fallen and fans are pushing each other.
   - **Zone/Section/Gate**: Zone B, Gate 4.
   - **Reporter**: Marcus Vance (Safety Steward).
3. Click **Submit Incident & Trigger AI Dispatch**.

### Step 3: Reviewing AI Analysis & SOP (1:00)
1. The app automatically redirects to the **Incident Details** view.
2. Notice the classification badges:
   - **Category**: Crowd congestion
   - **Severity**: Critical
   - **Priority**: P1
3. Review the **AI Classification Context**: notice the classification confidence and the short reasoning summary explaining *why* it made this decision.
4. Review the **Active Safety Protocol** on the right side:
   - Check the **Critical Safety Warning**: *"Never push back directly against a compressed crowd line; focus on dispersing..."*
   - Go through the **Action Checklist** and click check on the first two steps:
     - [x] *Halt flow at affected turnstiles...*
     - [x] *Utilize external loudspeaker systems...*

### Step 4: Dispatching Multilingual Warnings (1:00)
1. Scroll to the **Public Warning Announcements** panel.
2. Click **⚡ Draft Multilingual Announcement**.
3. View the translations drafted in English, Spanish, French, and Arabic.
4. Click **Approve and Broadcast** (Sofia is an Operations Manager, so she has authority).
5. The status displays: `✓ Broadcast Approved & Dispatched`.

### Step 5: Incident Progress & Report Resolution (1:00)
1. In the lifecycle action panel, click **Move to "Acknowledged"** (simulating responder dispatcher team responding).
2. Click **Move to "In Progress"** as response teams arrive.
3. Once the crowd disperses and medics treat the fallen spectators, click **Move to "Resolved"**.
4. Observe the **Immutable Audit Trail** updating in real time on the right side, showing all status updates, announcement approvals, and timestamps.
5. Click **Compile Post-Incident Report** in the top toolbar.
6. The modal displays a complete Markdown report compiling metadata, response timeline logs, and SOP details. Click **Copy Markdown** to save it.
7. Finally, click **Move to "Closed"** to archive the record. Click **History** in the sidebar to view it in the archived incident list.
