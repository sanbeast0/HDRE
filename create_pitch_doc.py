import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_background(cell, hex_color):
    """Sets background color of a table cell."""
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets internal padding of a table cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def create_document():
    doc = Document()

    # Page Margins: 1 inch all around
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.8)
        section.bottom_margin = Inches(0.8)
        section.left_margin = Inches(0.8)
        section.right_margin = Inches(0.8)

    # Palette Colors
    PRIMARY_COLOR = RGBColor(180, 83, 9)     # Deep Amber / Gold (#b45309)
    SECONDARY_COLOR = RGBColor(15, 23, 42)    # Dark Slate (#0f172a)
    ACCENT_COLOR = RGBColor(217, 119, 6)     # Amber-600 (#d97706)
    MUTED_TEXT = RGBColor(100, 116, 139)     # Slate-500 (#64748b)

    # Base Normal Style
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = SECONDARY_COLOR
    normal_style.paragraph_format.line_spacing = 1.18
    normal_style.paragraph_format.space_after = Pt(6)

    # -------------------------------------------------------------
    # COVER / HEADER BANNER
    # -------------------------------------------------------------
    header_table = doc.add_table(rows=1, cols=1)
    header_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    cell = header_table.cell(0, 0)
    set_cell_background(cell, "FEF3C7") # Warm Yellow / Amber Light
    set_cell_margins(cell, top=200, bottom=200, left=250, right=250)

    p = cell.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p.add_run("PCCOE INTERNATIONAL GRAND CHALLENGE 2026 · TEAM THE GOAT'S (VIT PUNE)\n")
    r_sub.font.name = 'Arial'
    r_sub.font.size = Pt(9.5)
    r_sub.font.bold = True
    r_sub.font.color.rgb = RGBColor(146, 64, 14) # Amber-800

    r_title = p.add_run("HYDRO-DIPLOMACY & RESILIENCE ENGINE (HDRE / R2C Ai)\n")
    r_title.font.name = 'Arial'
    r_title.font.size = Pt(20)
    r_title.font.bold = True
    r_title.font.color.rgb = SECONDARY_COLOR

    r_tagline = p.add_run("A Closed-Loop Operating System Bridging Macro Transboundary River Basin Treaty Allocations Directly to Micro Municipal Ward Tap Delivery")
    r_tagline.font.name = 'Calibri'
    r_tagline.font.size = Pt(11)
    r_tagline.font.italic = True
    r_tagline.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_paragraph() # Spacing

    # -------------------------------------------------------------
    # SECTION 1: THE ELEVATOR PITCH & VALUE PROPOSITION
    # -------------------------------------------------------------
    h1 = doc.add_heading("1. Executive Summary & The Core Elevator Pitch", level=1)
    h1.runs[0].font.name = 'Arial'
    h1.runs[0].font.color.rgb = PRIMARY_COLOR
    h1.runs[0].font.size = Pt(14)

    p_lead = doc.add_paragraph()
    r = p_lead.add_run("What is HDRE in One Sentence?")
    r.bold = True
    r.font.size = Pt(11.5)
    doc.add_paragraph(
        "HDRE (Hydro-Diplomacy & Resilience Engine / R2C Ai) is the world's first closed-loop water governance operating system "
        "that computationally proves transboundary interstate river treaty diplomacy and municipal city survival are two sides of the exact same hydrological coin."
    )

    doc.add_paragraph(
        "Historically, river basin diplomacy and municipal water utilities operate in complete isolation. When a severe climate shock hits—such as a "
        "-30% monsoon deficit under RCP 8.5 coupled with a +2.5°C extended heatwave surge—upstream and downstream states lock into protracted, zero-sum legal litigation "
        "in tribunals, while municipal city engineers are forced into blind, uncoordinated rationing that causes tail-end hydraulic head collapse in informal settlements "
        "and critical shortages in hospital wards."
    )

    doc.add_paragraph(
        "HDRE replaces political deadlock and blind rationing with a unified, mathematical pipeline: it optimizes interstate treaty releases using John Rawls' Maximin "
        "game theory via SciPy, forecasts 30-, 60-, and 90-day ward deficits using trained XGBoost regressors, and automates SCADA valve rationing using Google OR-Tools MILP—strictly "
        "enforcing a non-negotiable statutory floor of ≥ 55.0 LPCD (Liters Per Capita per Day) and 100% zero-deficit hospital reserves."
    )

    # Highlight Callout Box
    box = doc.add_table(rows=1, cols=1)
    box.alignment = WD_TABLE_ALIGNMENT.CENTER
    c = box.cell(0, 0)
    set_cell_background(c, "F8FAFC")
    set_cell_margins(c, top=140, bottom=140, left=180, right=180)
    bp = c.paragraphs[0]
    br1 = bp.add_run("THE NON-NEGOTIABLE CORE THESIS:\n")
    br1.bold = True
    br1.font.size = Pt(10)
    br1.font.color.rgb = PRIMARY_COLOR
    br2 = bp.add_run(
        "Under no circumstances does HDRE allow bureaucratic convenience to relax the ≥ 55.0 LPCD human survival baseline or compromise critical medical "
        "infrastructure. If the upstream river treaty shifts by even 5%, HDRE dynamically rebalances downstream municipal valve schedules within seconds to keep every tap flowing."
    )
    br2.font.size = Pt(10.5)
    br2.font.italic = True

    doc.add_paragraph()

    # -------------------------------------------------------------
    # SECTION 2: PROBLEMS WE SOLVE
    # -------------------------------------------------------------
    h2 = doc.add_heading("2. Critical Problems Solved by HDRE", level=1)
    h2.runs[0].font.name = 'Arial'
    h2.runs[0].font.color.rgb = PRIMARY_COLOR
    h2.runs[0].font.size = Pt(14)

    prob_table = doc.add_table(rows=5, cols=3)
    prob_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    headers = ["Challenge / Status Quo", "Root Cause in Current System", "HDRE Solution & Mathematical Proof"]
    
    # Table Header Row
    for idx, text in enumerate(headers):
        cell = prob_table.cell(0, idx)
        set_cell_background(cell, "0F172A")
        set_cell_margins(cell, top=120, bottom=120, left=140, right=140)
        p = cell.paragraphs[0]
        run = p.add_run(text)
        run.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        run.font.size = Pt(9.5)

    prob_data = [
        (
            "1. Zero-Sum River Tribunal Standoffs",
            "Interstate water disputes (e.g. Krishna-Bhima, Cauvery) rely on static colonial treaties and political leverage rather than dynamic hydrological equity.",
            "Rawlsian Maximin SLSQP Game Theory: Replaces political posturing by maximizing the welfare security of the most vulnerable jurisdiction, generating non-dominated Pareto frontiers and automated Explainable AI legal briefs."
        ),
        (
            "2. Uncoordinated Blind Municipal Rationing",
            "City water engineers cut water uniformly or arbitrarily across city sectors during droughts, causing dry taps in slums and low-pressure elevated wards.",
            "XGBoost Multi-Horizon Forecasting + OR-Tools MILP: Predicts 30/60/90-day deficits from 16,425 telemetry records and schedules automated SCADA valve throttling (THROTTLE_15_PCT, DIVERT_CORRIDOR)."
        ),
        (
            "3. Violation of Human Rights & Hospital Crises",
            "Under drought stress, hospitals face water trucking emergencies and informal settlements receive under 30 LPCD, triggering public health emergencies.",
            "Strict Statutory Human Floor (≥ 55.0 LPCD) & 100% Zero-Deficit Hospital Buffers: Hard mathematical constraints in MILP branch-and-cut solver that can never be violated."
        ),
        (
            "4. Severe Evaporative Losses Under Climate Heatwaves",
            "Treaties ignore temperature surges (+2.5°C to +3.5°C), leading to massive unmonitored evaporative reservoir depletion and broken delivery promises.",
            "Dynamic Penman-Monteith Formulation: Automatically quantifies evaporative losses per degree Celsius surge and guarantees 2.5 TMC ecological river trunk flows."
        )
    ]

    for row_idx, data in enumerate(prob_data, start=1):
        for col_idx, text in enumerate(data):
            cell = prob_table.cell(row_idx, col_idx)
            set_cell_background(cell, "FFFFFF" if row_idx % 2 != 0 else "F8FAFC")
            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
            p = cell.paragraphs[0]
            run = p.add_run(text)
            run.font.size = Pt(9)
            if col_idx == 0:
                run.bold = True
                run.font.color.rgb = PRIMARY_COLOR

    doc.add_paragraph()

    # -------------------------------------------------------------
    # SECTION 3: SYSTEM ARCHITECTURE & HOW IT WORKS
    # -------------------------------------------------------------
    h3 = doc.add_heading("3. Technical Architecture & Closed-Loop Pipeline", level=1)
    h3.runs[0].font.name = 'Arial'
    h3.runs[0].font.color.rgb = PRIMARY_COLOR
    h3.runs[0].font.size = Pt(14)

    doc.add_paragraph(
        "The HDRE architecture is engineered across three interconnected computational tiers:"
    )

    doc.add_paragraph(
        "• Tier 1: Macro River Basin Diplomacy (SciPy SLSQP Maximin Solver)\n"
        "   - Inputs: Live catchment storage (Alpha: Panshet/Varasgaon/Khadakwasla = 64.2 TMC, Beta: Ujani = 38.5 TMC), projected seasonal inflow (14.1 TMC), climate stressors (-30% precipitation deficit, +2.5°C surge).\n"
        "   - Physics Engine: Penman-Monteith evaporative loss formula adjusted for thermal surges, mass conservation bounds, and statutory ecological minimum flow (≥ 2.5 TMC).\n"
        "   - Social Justice Optimization: Formulates John Rawls' Maximin difference principle: max min(S_A, S_B), maximizing the minimum riparian welfare.\n"
        "   - Outputs: 16-point non-dominated Pareto trade-off curve and automated Explainable AI Legal Dispute Briefs for tribunal judges."
    )

    doc.add_paragraph(
        "• Tier 2: Dynamic Flume Translation Pipeline (The Closed-Loop Bridge)\n"
        "   - Dynamically translates upstream dam live release (TMC) into downstream Pune municipal bulk intake flume (MLD):\n"
        "     Bulk MLD = (Release_A_TMC × 28,316.85 × 0.28) / 365 days\n"
        "   - Proves mathematically that shifting upstream releases by ±5% immediately shifts city bulk availability between 650 MLD and 1,200 MLD."
    )

    doc.add_paragraph(
        "• Tier 3: Micro Municipal Resilience Cockpit (XGBoost + Google OR-Tools MILP)\n"
        "   - Machine Learning: 3 trained XGBoost regressors (n_estimators=450, depth=6, lr=0.03) forecasting ward unmet deficit ratios across 30, 60, and 90 day horizons.\n"
        "   - Mixed-Integer Linear Programming: Google OR-Tools (SCIP / Branch & Cut) optimizes water delivery x_i across all 15 Pune wards while penalizing pumping energy elevation head costs.\n"
        "   - Hard Constraints: Enforces x_i ≥ 0.055 · Pop_i (≥ 55 LPCD) and x_i ≥ Hospital_Reserve_i (Zero Deficit).\n"
        "   - SCADA Actuation: Prescribes automated valve throttling commands (THROTTLE_15_PCT, DIVERT_INDUSTRIAL_FLOW, BOOST_SECONDARY_SUMP)."
    )

    doc.add_paragraph()

    # -------------------------------------------------------------
    # SECTION 4: 3-MINUTE JUDGES PITCH SCRIPT (WORD-FOR-WORD)
    # -------------------------------------------------------------
    h4 = doc.add_heading("4. The Official 3-Minute Competition Pitch Script", level=1)
    h4.runs[0].font.name = 'Arial'
    h4.runs[0].font.color.rgb = PRIMARY_COLOR
    h4.runs[0].font.size = Pt(14)

    doc.add_paragraph(
        "Note for the Speaker: Deliver with confidence, clear pacing, and urgency. "
        "Total word count is ~410 words, calibrated for a crisp 2 minutes and 50 seconds, leaving 10 seconds buffer."
    )

    script_table = doc.add_table(rows=6, cols=3)
    script_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    s_headers = ["Time & Segment", "Speaker Script (What You Say)", "Screen / Demo Actions (What You Show)"]
    
    for idx, text in enumerate(s_headers):
        cell = script_table.cell(0, idx)
        set_cell_background(cell, "B45309") # Amber-700
        set_cell_margins(cell, top=120, bottom=120, left=120, right=120)
        p = cell.paragraphs[0]
        run = p.add_run(text)
        run.bold = True
        run.font.color.rgb = RGBColor(255, 255, 255)
        run.font.size = Pt(9.5)

    script_data = [
        (
            "0:00 - 0:35\n(35 sec)\n\nTHE HOOK & THE SILENT CRISIS",
            "\"Respected judges, imagine a severe compound climate drought strikes Maharashtra: the monsoon fails by 30%, and temperatures surge by 2.5 degrees. "
            "What happens today? Two separate disasters unfold in complete isolation:\n\n"
            "At the macro level, politicians and ministers lock into bitter, zero-sum litigation in river tribunals over dam releases.\n"
            "And at the micro level, municipal engineers blindly cut valve pressures—leaving slums under 30 LPCD and critical hospitals fighting for water tankers.\n\n"
            "Nobody connects the upstream river treaty to the downstream municipal tap. Until today.\"",
            "Open the HDRE Cockpit in Light/Dark Mode.\nPoint to the CWC Live Telemetry Ribbon showing Dam Alpha (64.2 TMC) and Dam Beta (38.5 TMC)."
        ),
        (
            "0:35 - 1:15\n(40 sec)\n\nTHE BREAKTHROUGH & MACRO SOLVER",
            "\"Introducing HDRE: the Hydro-Diplomacy & Resilience Engine.\n\n"
            "Our core thesis is revolutionary yet simple: Transboundary river diplomacy and municipal tap delivery are two sides of the exact same hydrological coin.\n\n"
            "In Viewport 1, HDRE replaces political deadlock with John Rawls' Maximin social justice optimization via SciPy SLSQP. "
            "Instead of a zero-sum battle, our solver computes the mathematical equilibrium that maximizes the welfare of the least advantaged state under Penman-Monteith evaporative heatwave surges. "
            "It generates a 16-point non-dominated Pareto frontier and an Explainable AI legal brief in under two seconds that tribunal judges can legally trust.\"",
            "Switch to Viewport 1 (Macro Treaty Sandbox).\nToggle '-30% Monsoon Deficit' and '+2.5°C Heatwave'. Click 'RUN MAXIMIN OPTIMIZATION SOLVER'.\nShow the Pareto curve and the XAI Legal Memo."
        ),
        (
            "1:15 - 2:00\n(45 sec)\n\nTHE MICRO PREDICTION & MILP VALVE SCHEDULER",
            "\"Now watch what happens when that river treaty meets the city.\n\n"
            "HDRE’s dynamic flume pipeline translates upstream TMC releases directly into millions of liters per day at the Pune municipal waterworks.\n\n"
            "In Viewport 2, we ingest 16,425 daily telemetry records across all 15 Pune municipal wards. "
            "Our multi-horizon XGBoost models predict deficit risks 30, 60, and 90 days into the future. "
            "Then, Google OR-Tools Mixed-Integer Linear Programming solves the hydraulic flow distribution.\n\n"
            "And here is our non-negotiable statutory guarantee: Under no condition does any citizen receive less than 55 LPCD, and 100% of hospital reserves are mathematically locked at zero deficit!\"",
            "Switch to Viewport 2 (Municipal Cockpit).\nClick Ward 14 (Shivajinagar) on the vector choropleth map.\nShow: Delivered LPCD = 55.0 (PASS ≥ 55) and Hospital Buffer = 100% LOCKED.\nShow the Algorithmic SCADA Valve Actions table."
        ),
        (
            "2:00 - 2:35\n(35 sec)\n\nTHE LIVE CLOSED-LOOP DEMONSTRATION",
            "\"Look at the Treaty-to-Tap tab on screen.\n\n"
            "When we shift the upstream river treaty slider by just 5%, you can watch the entire city’s hydraulic response adapt in real-time. "
            "The MILP engine instantly dispatches SCADA valve actuations—throttling industrial corridors by 15%, boosting secondary sumps, and equalizing terminal pressure heads to prevent pipe bursts and pump burnout—saving over 93,000 rupees a day in pumping energy.\"",
            "Switch to 'Treaty-to-Tap' Viewport.\nMove the release slider by +5% / -5%.\nPoint out the instant recalculation of bulk intake MLD and automated valve actions."
        ),
        (
            "2:35 - 3:00\n(25 sec)\n\nTHE IMPACT & VISION",
            "\"HDRE is not a theoretical model. It is fully trained, fully verified, and running live on production FastAPI, OR-Tools, and XGBoost right now.\n\n"
            "From the Krishna-Bhima basin to the Cauvery, from Pune to Delhi, HDRE turns transboundary water wars into algorithmic equity and guarantees human survival at the tap.\n\n"
            "We are Team The GOAT's from VIT Pune, and this is HDRE: Water diplomacy, solved. Thank you!\"",
            "Switch to Analytics Viewport showing the 4 Plotly charts.\nEnd with confidence and invite judges' questions."
        )
    ]

    for row_idx, data in enumerate(script_data, start=1):
        for col_idx, text in enumerate(data):
            cell = script_table.cell(row_idx, col_idx)
            set_cell_background(cell, "FFFFFF" if row_idx % 2 != 0 else "FDF8F0")
            set_cell_margins(cell, top=100, bottom=100, left=120, right=120)
            p = cell.paragraphs[0]
            run = p.add_run(text)
            run.font.size = Pt(9)
            if col_idx == 0:
                run.bold = True
                run.font.color.rgb = PRIMARY_COLOR
            elif col_idx == 2:
                run.font.italic = True
                run.font.color.rgb = RGBColor(71, 85, 105)

    doc.add_paragraph()

    # -------------------------------------------------------------
    # SECTION 5: JUDGES Q&A PREPARATION (THE TOUGH QUESTIONS)
    # -------------------------------------------------------------
    h5 = doc.add_heading("5. Judges Q&A Defense Strategy (Anticipated Questions & Winning Answers)", level=1)
    h5.runs[0].font.name = 'Arial'
    h5.runs[0].font.color.rgb = PRIMARY_COLOR
    h5.runs[0].font.size = Pt(14)

    qa_list = [
        (
            "Q1: Why John Rawls' Maximin? Why not simple Utilitarian optimization (maximizing total water released)?",
            "Answer: \"In transboundary river conflicts, Utilitarian optimization leads directly to civil unrest because it favors the downstream state with larger agricultural acreage or higher economic output, leaving the upstream state starved. John Rawls' Maximin principle from social justice game theory specifically maximizes the welfare of the least secure party (min(S_A, S_B)). This ensures neither state drops below critical survival levels, eliminating the zero-sum incentive to litigate in court.\""
        ),
        (
            "Q2: How do you guarantee the ≥ 55 LPCD floor if the total available bulk water flume is physically insufficient?",
            "Answer: \"Our Google OR-Tools MILP solver enforces x_i ≥ 0.055 · Pop_i as a hard statutory constraint, not a soft penalty. If bulk reservoir inflows drop below the absolute physical survival limit of the city, the solver flags an infeasibility condition to the disaster management authority and automatically triggers emergency diversion protocols from non-essential industrial water corridors to residential ESR sumps—as demonstrated in our SCADA action 'DIVERT_INDUSTRIAL_FLOW'. Under no condition is the human floor relaxed.\""
        ),
        (
            "Q3: Why XGBoost for deficit forecasting instead of simple statistical moving averages or deep learning LSTM?",
            "Answer: \"We trained three multi-horizon XGBoost regressors on 16,425 daily telemetry records across 15 Pune wards. XGBoost was chosen over LSTMs because SCADA telemetry features include tabular static covariates (pipe age, slum ratio, elevation head) alongside dynamic variables (temperature surges, monsoon deficit). XGBoost achieved an R² of 0.648 and an RMSE of 0.046 while maintaining sub-millisecond inference times required for real-time SCADA valve actuation.\""
        ),
        (
            "Q4: How does this integrate with real-world municipal infrastructure?",
            "Answer: \"HDRE's output is not just a chart; it outputs explicit Automated Valve Actions conforming to IEC 60870-5 and Modbus/DNP3 SCADA protocols. Each action provides the exact node identifier (e.g., 'VALVE_14B'), the prescribed actuation ('THROTTLE_15_PCT'), target ward, flow delta, and physical rationale. It can be mounted directly onto PMC's existing SCADA server via our OpenAPI 3.1 REST API.\""
        ),
        (
            "Q5: Can this system scale to other transboundary basins across India and globally?",
            "Answer: \"Yes, HDRE is architected with complete jurisdictional modularity. By updating the GeoJSON vectors and reservoir capacity parameters, HDRE can be deployed for the Cauvery basin (Karnataka-Tamil Nadu), Indus basin (India-Pakistan), or the Colorado River basin in the United States. The mathematical principles of Maximin equity and MILP flow rationing are universally applicable.\""
        )
    ]

    for q, a in qa_list:
        p_q = doc.add_paragraph()
        r_q = p_q.add_run(q)
        r_q.bold = True
        r_q.font.color.rgb = SECONDARY_COLOR
        r_q.font.size = Pt(11)

        p_a = doc.add_paragraph()
        r_a = p_a.add_run(a)
        r_a.font.size = Pt(10)
        r_a.font.color.rgb = RGBColor(51, 65, 85)

    # -------------------------------------------------------------
    # FOOTER
    # -------------------------------------------------------------
    footer_para = doc.add_paragraph()
    footer_para.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    rf = footer_para.add_run("Generated by HDRE / R2C Ai Engine · Specification v2.4.0 Production · Team The GOAT's")
    rf.font.size = Pt(8.5)
    rf.font.italic = True
    rf.font.color.rgb = MUTED_TEXT

    output_path = r"C:\Users\9br24\.gemini\antigravity\scratch\hdre-project\HDRE_Pitch_Deck_and_Judges_Script.docx"
    doc.save(output_path)
    print(f"Document successfully created at: {output_path}")

if __name__ == "__main__":
    create_document()
