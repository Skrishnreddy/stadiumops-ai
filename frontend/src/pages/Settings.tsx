import React, { useState } from 'react';

export const Settings: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Medical emergency');

  // SOPs list hardcoded for reference in the UI
  const sops = [
    {
      category: 'Medical emergency',
      title: 'SOP-ME-01: Medical Emergencies & First Aid Protocol',
      matched_section: 'Section 3.2: Stadium Stand Response',
      recommended_steps: [
        'Confirm exact section, row, and seat number of the casualty.',
        'Dispatch nearest mobile medical responder team immediately.',
        'Clear standard access path for stretcher and emergency paramedics.',
        'Apply localized privacy screens around the patient.',
        'Secure report from first responder and notify the Command Center duty manager.'
      ],
      safety_warning: 'Do not attempt to move casualties with suspected spinal or head injuries unless there is an immediate life threat (e.g. fire).',
      source_reference: 'FIFA Smart Stadium Safety Code, Section 12.1'
    },
    {
      category: 'Fire or smoke',
      title: 'SOP-FR-02: Fire and Smoke Mitigation Protocol',
      matched_section: 'Section 4.1: Localized Flame/Smoke Response',
      recommended_steps: [
        'Confirm location of fire and type of material burning.',
        'Dispatch fire marshal with appropriate fire extinguisher (CO2, Dry Powder).',
        'Isolate electricity and gas valves supplying the affected sector.',
        'Begin immediate evacuation of the immediate grid and adjacent blocks.',
        'Initiate high-volume smoke extraction venting systems.'
      ],
      safety_warning: 'Treat all smoke as highly toxic. If flame spreads beyond 1 square meter, trigger full block evacuation.',
      source_reference: 'FIFA Safety Code (Fire & Life Safety - Vol 2)'
    },
    {
      category: 'Crowd congestion',
      title: 'SOP-CC-03: Crowd Management and Pressure Relief',
      matched_section: 'Section 2.4: Gate Congestion and Ingress Flow Control',
      recommended_steps: [
        'Halt flow at affected turnstiles immediately using gate indicators.',
        'Utilize external loudspeaker systems to direct fans to adjacent gates with shorter queues.',
        'Open manual bypass relief gates to relieve physical pressure.',
        'Form steward cordons to stagger entry and slow down rushing crowds.',
        'Coordinate with local transport police to slow down arrival rates from stadium train/metro stations.'
      ],
      safety_warning: 'Never push back directly against a compressed crowd line; focus on dispersing and opening secondary pathways.',
      source_reference: 'Guide to Safety at Sports Grounds (Green Guide), Chapter 6'
    },
    {
      category: 'Lost child',
      title: 'SOP-LC-04: Safeguarding and Missing Persons',
      matched_section: 'Section 5.3: Reunification & Child Protection',
      recommended_steps: [
        'Gather detailed description of the child (age, height, hair, clothing, name).',
        'Broadcast description over internal steward radio networks.',
        'Deploy guest services agents to all major exit gate checkpoints to block unaccompanied departures.',
        'Escort parents/guardians to the secure Guest Services Hub.',
        'Alert stadium CCTV control room to scan the last known zone.'
      ],
      safety_warning: "Do not broadcast the child's full name over public stadium-wide PA speakers to prevent security and kidnapping risks.",
      source_reference: 'UNICEF Child Safety in Public Events Guideline'
    },
    {
      category: 'Suspicious package',
      title: 'SOP-SP-05: Unattended Items & Explosive Ordinance Response',
      matched_section: 'Section 7.1: Suspicious Package Assessment',
      recommended_steps: [
        'Establish a strict 100-meter safety cordon; do not handle or touch the object.',
        'Ensure all radios and cellphones are kept at least 15 meters away to avoid RF triggers.',
        'Instruct stewards to calmly evacuate spectators from the cordoned zone.',
        'Liaise with Police Commander to request bomb disposal (EOD) dispatch.',
        'Review CCTV feeds of the location to identify who left the item and when.'
      ],
      safety_warning: 'Under no circumstances should stadium staff touch, open, or shake the item.',
      source_reference: 'FIFA Security Guidelines - Bomb Threat Protocols'
    },
    {
      category: 'Power failure',
      title: 'SOP-PF-06: Facilities Emergency and Power Outage',
      matched_section: 'Section 8.2: Emergency Power Restoration',
      recommended_steps: [
        'Verify if backup generator has engaged (automatic transfer switch should fire in <10 seconds).',
        'Deploy facilities team to main switchboard room for diagnostics.',
        'Deploy stewards to all exit stairwells and unlit passageways with torches.',
        'Switch command radio communications to analog battery back-up frequencies.',
        'Maintain spectator calm by broadcasting announcements using battery-powered PA systems.'
      ],
      safety_warning: 'Ensure access elevators are manually checked for trapped occupants and overridden using mechanical keys.',
      source_reference: 'Stadium Infrastructure Standards & Engineering Manual'
    },
    {
      category: 'Network failure',
      title: 'SOP-NO-07: IT and Communications Failure Response',
      matched_section: 'Section 9.1: Offline Ticketing and Radio Outage Protocols',
      recommended_steps: [
        'Instruct turnstile operators to transition immediately to offline ticket check mode.',
        'Switch crucial staff communications to the secondary analog UHF radio channel.',
        'Check server room switches and report gateway connectivity to ISP partner.',
        'Dispatch IT field engineers to the affected zone\'s wiring closets.'
      ],
      safety_warning: 'Do not halt entry gates for IT issues; proceed with offline ticket logging to prevent crowd buildup at gates.',
      source_reference: 'FIFA IT Operations & Ingress Continuity Plan'
    },
    {
      category: 'Access-control failure',
      title: 'SOP-AC-08: Access Control and Gate System Breakdown',
      matched_section: 'Section 10.3: Gate Interruption Procedures',
      recommended_steps: [
        'Deploy security supervisors to the affected entry turnstiles.',
        'Set barcode readers to local cached mode if master network is down.',
        'Initiate manual visual inspection of tickets and match against physical security holograms.',
        'Re-route incoming spectators to adjacent entry queues.'
      ],
      safety_warning: 'Ensure stewards do not bypass search protocols (bag check, metal detection) even if turnstiles are backed up.',
      source_reference: 'FIFA Smart Stadium Operations Handbook'
    },
    {
      category: 'Severe weather',
      title: 'SOP-SW-09: Severe Meteorological Events Response',
      matched_section: 'Section 11.2: Lightning and High Wind Safety',
      recommended_steps: [
        'Monitor lightning detection systems; if strike is within 8km, prepare to clear open bowl.',
        'Direct fans from open seating tiers to seek shelter inside the covered stadium concourses.',
        'Secure pitchside promotional banners and television camera mounts.',
        'Coordinate with FIFA Match Commissioner to assess potential game delay or postponement.'
      ],
      safety_warning: 'Instruct spectators to avoid touching large metal structures, fences, or lighting poles during active lightning storms.',
      source_reference: 'WMO Public Safety Event Guidelines'
    },
    {
      category: 'Evacuation',
      title: 'SOP-EV-10: Full Stadium Evacuation Procedure',
      matched_section: 'Section 15.1: General Evacuation Orders',
      recommended_steps: [
        'Open all safety gates, pitch gates, and external perimeter fences.',
        'Activate the emergency evacuation audio alarm and strobe lighting system.',
        'Broadcast standardized clear instructions over public address boards and video screens.',
        'Instruct stewards to guide spectators toward the designated external safe assembly points.',
        'Command Center to monitor exits via CCTV and direct response teams to clear blockages.'
      ],
      safety_warning: 'Never use elevators or escalators during an evacuation. Stewards must prioritize high-congestion choke points.',
      source_reference: 'FIFA Operations Manual, Chapter 15'
    }
  ];

  const currentSop = sops.find(s => s.category === selectedCategory) || sops[0];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Safety Standard Operating Procedures</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Reference library of FIFA World Cup 2026 pre-approved safety and response frameworks.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: '30px' }} className="responsive-container">
        
        {/* Navigation List */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>SOP Categories</h3>
          <ul style={{ listStyle: 'none' }}>
            {sops.map((sop) => (
              <li key={sop.category} style={{ marginBottom: '8px' }}>
                <button
                  onClick={() => setSelectedCategory(sop.category)}
                  className="btn"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    background: selectedCategory === sop.category ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    borderColor: selectedCategory === sop.category ? 'var(--card-hover-border)' : 'transparent',
                    color: selectedCategory === sop.category ? 'white' : 'var(--text-secondary)',
                    padding: '10px 14px',
                    fontSize: '0.85rem'
                  }}
                >
                  📖 {sop.category}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Selected SOP Detail Display */}
        <div className="glass-panel" style={{ padding: '30px', borderLeft: '3px solid var(--primary)' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase' }}>
            Tournament SOP Framework
          </span>
          <h3 style={{ fontSize: '1.5rem', marginTop: '4px', marginBottom: '8px' }}>{currentSop.title}</h3>
          
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            <strong>Manual Section:</strong> {currentSop.matched_section}
          </div>

          <div 
            style={{ 
              backgroundColor: 'rgba(245, 158, 11, 0.08)', 
              border: '1px solid var(--severity-medium)', 
              borderRadius: '8px', 
              padding: '16px', 
              marginBottom: '24px' 
            }}
          >
            <strong style={{ fontSize: '0.85rem', color: 'var(--severity-medium)', display: 'block', marginBottom: '4px' }}>
              ⚠️ CRITICAL SAFETY WARNING:
            </strong>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>{currentSop.safety_warning}</p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', fontWeight: 600 }}>Standard Dispatch Guidelines:</h4>
            <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {currentSop.recommended_steps.map((step, idx) => (
                <li key={idx} style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <strong>Source Standard Authority Reference:</strong> {currentSop.source_reference}
          </div>
        </div>

      </div>

      {/* Settings Info block */}
      <div className="glass-panel" style={{ padding: '20px', marginTop: '30px' }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>StadiumOps AI System Information</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          This prototype runs using local memory caches for rapid keyword-based SOP mapping. 
          The backend connects to the Gemini API (using <code>gemini-1.5-flash</code>) to execute semantic incident classifications, with a pure Python heuristic classifier acting as a fallback mechanism for service continuity.
        </p>
      </div>
    </div>
  );
};
