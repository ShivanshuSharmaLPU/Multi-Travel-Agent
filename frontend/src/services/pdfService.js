import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ── Safe string: strip emoji/special chars jsPDF Helvetica can't render ─────
const safe = (str) => {
  if (str == null) return ''
  return String(str)
    .replace(/₹/g, 'Rs.')
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/✓/g, '[Yes]')
    .replace(/•/g, '-')
    .replace(/°C/g, ' C')
    .replace(/[\u{1F000}-\u{1FFFF}]/gu, '')
    .replace(/[\u2600-\u27BF]/g, '')
    .replace(/[^\x00-\xFF]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

const money = (val) => `Rs.${Number(val || 0).toLocaleString('en-IN')}`
const cap   = (s)   => safe(s).charAt(0).toUpperCase() + safe(s).slice(1)

// ── Main PDF generator ───────────────────────────────────────────────────────
export const generatePDF = (plan) => {
  const doc   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = doc.internal.pageSize.getWidth()   // 210
  const pageH = doc.internal.pageSize.getHeight()  // 297
  const ML = 15
  const MR = 15
  const TW = pageW - ML - MR
  let y = 0

  // ── Palette ───────────────────────────────────────────────────────────────
  const C = {
    dark    : [8,  15, 30],
    navy    : [14, 24, 50],
    accent  : [0,  195, 235],
    accent2 : [110, 50, 220],
    green   : [16, 185, 129],
    purple  : [124, 58, 237],
    yellow  : [220, 165, 0],
    orange  : [220, 100, 20],
    red     : [220, 55,  55],
    white   : [255, 255, 255],
    offWhite: [248, 250, 253],
    bodyTxt : [35,  50,  75],
    mutedTxt: [100, 120, 150],
    border  : [210, 220, 235],
  }

  // ── Utilities ─────────────────────────────────────────────────────────────
  const newPage = () => {
    doc.addPage()
    doc.setFillColor(...C.offWhite)
    doc.rect(0, 0, pageW, pageH, 'F')
    y = 20
  }
  const check = (need = 28) => { if (y + need > pageH - 16) newPage() }

  const rule = (col = C.border, lw = 0.3) => {
    doc.setDrawColor(...col); doc.setLineWidth(lw)
    doc.line(ML, y, pageW - MR, y); y += 3
  }

  const secHead = (title, color = C.accent) => {
    check(22)
    y += 5
    // Filled pill background
    doc.setFillColor(...color.map(v => Math.min(v + 185, 255)))
    doc.roundedRect(ML, y - 5, TW, 11, 2, 2, 'F')
    // Left accent bar
    doc.setFillColor(...color)
    doc.roundedRect(ML, y - 5, 4, 11, 1, 1, 'F')
    // Text
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...color.map(v => Math.max(v - 60, 0)))
    doc.text(title.toUpperCase(), ML + 8, y + 2.5)
    y += 10
  }

  const bodyTxt = (text, indent = 0, col = C.bodyTxt, sz = 9) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(sz)
    doc.setTextColor(...col)
    const lines = doc.splitTextToSize(safe(text), TW - indent)
    check(lines.length * 5.2 + 2)
    doc.text(lines, ML + indent, y)
    y += lines.length * 5.2 + 1.5
  }

  const boldTxt = (text, indent = 0, col = C.bodyTxt, sz = 9.5) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(sz)
    doc.setTextColor(...col)
    const lines = doc.splitTextToSize(safe(text), TW - indent)
    check(lines.length * 5.5 + 2)
    doc.text(lines, ML + indent, y)
    y += lines.length * 5.5 + 1.5
  }

  const infoBox = (text, bg = [238, 248, 255], col = C.bodyTxt) => {
    const lines = doc.splitTextToSize(safe(text), TW - 10)
    const bh    = lines.length * 5.2 + 8
    check(bh + 3)
    doc.setFillColor(...bg)
    doc.setDrawColor(...C.border)
    doc.setLineWidth(0.25)
    doc.roundedRect(ML, y, TW, bh, 2, 2, 'FD')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.8)
    doc.setTextColor(...col)
    doc.text(lines, ML + 5, y + 6)
    y += bh + 4
  }

  // ── COVER HEADER — light premium redesign ───────────────────────────────
  const src   = safe(plan.source      || '')
  const dest  = safe(plan.destination || '')
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  // ── Zone 1: white top nav bar ────────────────────────────────────────────
  const Z1_H = 13
  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, pageW, Z1_H, 'F')
  // thin bottom border
  doc.setDrawColor(215, 228, 245)
  doc.setLineWidth(0.35)
  doc.line(0, Z1_H, pageW, Z1_H)
  // brand dot-accent square
  doc.setFillColor(0, 160, 220)
  doc.roundedRect(ML, 3, 5, 7, 1, 1, 'F')
  // brand name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10.5)
  doc.setTextColor(10, 30, 75)
  doc.text('VoyageAI', ML + 7, 9.5)
  // tagline right
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(150, 170, 200)
  doc.text('AI-Powered Multi-Agent Travel Planner', pageW - MR, 9.5, { align: 'right' })

  // ── Zone 2: hero band — sky-blue gradient left to white ──────────────────
  const Z2_Y = Z1_H
  const Z2_H = 46
  // Draw gradient in 80 vertical slices
  for (let i = 0; i < 80; i++) {
    const t = i / 79
    const r = Math.round(0   + t * 235)
    const g = Math.round(150 + t * (255 - 150))
    const b = Math.round(210 + t * (255 - 210))
    doc.setFillColor(r, g, b)
    doc.rect(i * (pageW / 80), Z2_Y, pageW / 80 + 0.5, Z2_H, 'F')
  }
  // Thick left teal bar
  doc.setFillColor(0, 140, 210)
  doc.rect(0, Z2_Y, 5, Z2_H, 'F')
  // Subtle bottom shadow
  doc.setFillColor(200, 220, 238)
  doc.rect(0, Z2_Y + Z2_H - 1.2, pageW, 1.2, 'F')

  // SOURCE city
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(8, 28, 75)
  doc.text(src, ML + 6, Z2_Y + 18)
  const srcW = doc.getTextWidth(src)

  // Arrow
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(0, 130, 200)
  const arrTxt = '   ->   '
  doc.text(arrTxt, ML + 6 + srcW, Z2_Y + 18)
  const arrW = doc.getTextWidth(arrTxt)

  // DESTINATION city
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(20)
  doc.setTextColor(0, 100, 175)
  doc.text(dest, ML + 6 + srcW + arrW, Z2_Y + 18)

  // Subtext under route
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(50, 100, 155)
  doc.text('Your personalised AI travel itinerary', ML + 7, Z2_Y + 28)

  // Thin white separator line
  doc.setDrawColor(255, 255, 255)
  doc.setLineWidth(0.5)
  doc.line(ML + 6, Z2_Y + 33, pageW * 0.55, Z2_Y + 33)

  // Meta pills row
  const pills2 = [
    { txt: `${plan.duration || '?'} Days`,          bg: [0, 130, 200],  fg: [255,255,255] },
    { txt: money(plan.budget),                       bg: [255,255,255],  fg: [0,130,200]  },
    { txt: cap(plan.travel_type || 'Trip') + ' Trip',bg: [255,255,255],  fg: [80,60,200]  },
    { txt: `Group of ${plan.group_size || 1}`,       bg: [255,255,255],  fg: [0,150,110]  },
  ]
  let px2 = ML + 6
  pills2.forEach(p => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    const w = doc.getTextWidth(safe(p.txt)) + 7
    doc.setFillColor(...p.bg)
    doc.setDrawColor(190, 215, 238)
    doc.setLineWidth(0.25)
    doc.roundedRect(px2, Z2_Y + 36, w, 7, 2, 2, 'FD')
    doc.setTextColor(...p.fg)
    doc.text(safe(p.txt), px2 + 3.5, Z2_Y + 41)
    px2 += w + 3
  })

  // Generated date bottom-right
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(70, 115, 160)
  doc.text(`Generated: ${today}`, pageW - MR, Z2_Y + Z2_H - 4, { align: 'right' })

  // ── Zone 3: light-grey stat cards row ────────────────────────────────────
  const Z3_Y = Z2_Y + Z2_H
  const Z3_H = 24
  doc.setFillColor(244, 247, 252)
  doc.rect(0, Z3_Y, pageW, Z3_H, 'F')
  doc.setDrawColor(215, 228, 245)
  doc.setLineWidth(0.3)
  doc.line(0, Z3_Y + Z3_H, pageW, Z3_Y + Z3_H)

  const statCards = [
    { label: 'DURATION',  value: `${plan.duration || '?'} Days`,  barCol: [0, 140, 210]  },
    { label: 'BUDGET',    value: money(plan.budget),               barCol: [16, 160, 110] },
    { label: 'TYPE',      value: cap(plan.travel_type || 'Trip'),  barCol: [120, 60, 220] },
    { label: 'GROUP',     value: `${plan.group_size || 1} ${Number(plan.group_size) > 1 ? 'People' : 'Person'}`, barCol: [200, 130, 0] },
  ]
  const cw = (TW - 9) / 4
  statCards.forEach((card, i) => {
    const cx = ML + i * (cw + 3)
    // White card
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(220, 232, 248)
    doc.setLineWidth(0.25)
    doc.roundedRect(cx, Z3_Y + 3, cw, Z3_H - 6, 2, 2, 'FD')
    // Coloured top border bar
    doc.setFillColor(...card.barCol)
    doc.roundedRect(cx, Z3_Y + 3, cw, 2.5, 1, 1, 'F')
    // Label
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(6.5)
    doc.setTextColor(...card.barCol)
    doc.text(card.label, cx + cw / 2, Z3_Y + 10, { align: 'center' })
    // Value
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(20, 35, 70)
    const vl = doc.splitTextToSize(safe(card.value), cw - 4)
    doc.text(vl[0], cx + cw / 2, Z3_Y + 17, { align: 'center' })
  })

  y = Z3_Y + Z3_H + 7

  // ── SECTION 1: TRANSPORT ─────────────────────────────────────────────────
  secHead('Transport Recommendations', C.yellow)

  if (plan.transport?.options?.length) {
    const rows = plan.transport.options.map(o => [
      safe(o.type || '').toUpperCase(),
      safe(o.name || ''),
      safe(o.duration || ''),
      money(o.cost),
      o.recommended ? 'BEST PICK' : '',
    ])
    autoTable(doc, {
      startY: y, head: [['Mode', 'Service', 'Duration', 'Cost', 'Verdict']],
      body: rows, margin: { left: ML, right: MR }, tableWidth: TW,
      styles: { fontSize: 8.5, cellPadding: 3, textColor: C.bodyTxt, lineColor: C.border, lineWidth: 0.2 },
      headStyles: { fillColor: C.yellow, textColor: [40, 28, 0], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [255, 252, 235] },
      columnStyles: {
        0: { cellWidth: 22, fontStyle: 'bold' },
        3: { halign: 'right', fontStyle: 'bold' },
        4: { halign: 'center', fontStyle: 'bold', textColor: C.green },
      },
    })
    y = doc.lastAutoTable.finalY + 4
  }
  if (plan.transport?.recommendation)
    infoBox('Tip: ' + plan.transport.recommendation, [255, 252, 230], [70, 55, 0])

  // ── SECTION 2: HOTELS ────────────────────────────────────────────────────
  secHead('Hotel Suggestions', C.purple)

  if (plan.hotels?.options?.length) {
    const rows = plan.hotels.options.map(h => [
      safe(h.name || ''),
      safe(h.area || ''),
      h.rating ? `${h.rating} / 5` : 'N/A',
      money(h.pricePerNight) + ' /night',
      h.recommended ? 'PICK' : '',
    ])
    autoTable(doc, {
      startY: y, head: [['Hotel Name', 'Area / Location', 'Rating', 'Price', '']],
      body: rows, margin: { left: ML, right: MR }, tableWidth: TW,
      styles: { fontSize: 8.5, cellPadding: 3, textColor: C.bodyTxt, lineColor: C.border, lineWidth: 0.2 },
      headStyles: { fillColor: C.purple, textColor: C.white, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 244, 255] },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'right', fontStyle: 'bold' },
        4: { halign: 'center', fontStyle: 'bold', textColor: C.green },
      },
    })
    y = doc.lastAutoTable.finalY + 4
  }

  // ── SECTION 3: WEATHER ───────────────────────────────────────────────────
  secHead('Weather Forecast', C.accent)

  if (plan.weather) {
    const w = plan.weather
    // 3 stat cards
    const wCards = [
      { label: 'Avg Temp',   value: `${w.avgTemp ?? 'N/A'} C`  },
      { label: 'Rain Chance',value: `${w.avgRain ?? 0} %`       },
      { label: 'Condition',  value: safe(w.condition || 'N/A')  },
    ]
    const ww = (TW - 6) / 3
    wCards.forEach((wc, i) => {
      const wx = ML + i * (ww + 3)
      doc.setFillColor(232, 248, 255)
      doc.setDrawColor(180, 230, 245)
      doc.setLineWidth(0.3)
      doc.roundedRect(wx, y, ww, 16, 2, 2, 'FD')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.setTextColor(...C.accent.map(v => Math.max(v - 40, 0)))
      doc.text(safe(wc.value), wx + ww / 2, y + 9, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...C.mutedTxt)
      doc.text(wc.label, wx + ww / 2, y + 14, { align: 'center' })
    })
    y += 20

    // Forecast table
    if (w.forecast?.length) {
      const fRows = w.forecast.slice(0, plan.duration || 7).map(f => [
        safe(f.date || ''),
        f.temp_max != null ? `${f.temp_max} C` : 'N/A',
        f.temp_min != null ? `${f.temp_min} C` : 'N/A',
        f.rain_prob != null ? `${f.rain_prob} %` : '0 %',
        safe(f.condition || 'N/A'),
      ])
      autoTable(doc, {
        startY: y, head: [['Date', 'Max Temp', 'Min Temp', 'Rain %', 'Condition']],
        body: fRows, margin: { left: ML, right: MR }, tableWidth: TW,
        styles: { fontSize: 8, cellPadding: 2.8, textColor: C.bodyTxt, lineColor: C.border, lineWidth: 0.2 },
        headStyles: { fillColor: C.accent, textColor: [0, 30, 40], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 252, 255] },
        columnStyles: { 1:{halign:'center'}, 2:{halign:'center'}, 3:{halign:'center'} },
      })
      y = doc.lastAutoTable.finalY + 4
    }
    if (w.advice) infoBox('Advisory: ' + w.advice, [232, 248, 255], [10, 70, 100])
    if (w.packing?.length) {
      y += 2
      boldTxt('Packing Suggestions:', 0, C.mutedTxt, 8.5)
      const chunks = []
      let row = []
      w.packing.forEach((item, i) => {
        row.push(safe(item))
        if (row.length === 3 || i === w.packing.length - 1) { chunks.push(row.join('   |   ')); row = [] }
      })
      chunks.forEach(line => bodyTxt(line, 4, C.bodyTxt, 8.5))
      y += 2
    }
  }

  // ── SECTION 4: BUDGET ────────────────────────────────────────────────────
  secHead('Budget Breakdown', C.green)

  if (plan.budget_plan) {
    const bp = plan.budget_plan
    // Stat cards
    const bStats = [
      { label: 'Total Estimated', value: money(bp.total)      },
      { label: 'Per Day',         value: money(bp.per_day)    },
      { label: 'Per Person',      value: money(bp.per_person) },
    ]
    const bw = (TW - 6) / 3
    bStats.forEach((s, i) => {
      const bx = ML + i * (bw + 3)
      doc.setFillColor(232, 252, 242)
      doc.setDrawColor(170, 235, 205)
      doc.setLineWidth(0.3)
      doc.roundedRect(bx, y, bw, 16, 2, 2, 'FD')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10.5)
      doc.setTextColor(...C.green.map(v => Math.max(v - 30, 0)))
      doc.text(safe(s.value), bx + bw / 2, y + 9, { align: 'center' })
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(...C.mutedTxt)
      doc.text(s.label, bx + bw / 2, y + 14, { align: 'center' })
    })
    y += 20

    const bRows = Object.entries(bp.breakdown || {}).map(([k, v]) => [safe(k), money(v)])
    bRows.push(['TOTAL ESTIMATED', money(bp.total)])
    autoTable(doc, {
      startY: y, head: [['Category', 'Amount']],
      body: bRows, margin: { left: ML, right: MR }, tableWidth: TW / 2,
      styles: { fontSize: 9, cellPadding: 3, textColor: C.bodyTxt, lineColor: C.border, lineWidth: 0.2 },
      headStyles: { fillColor: C.green, textColor: C.white, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [240, 252, 245] },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
      didParseCell: (d) => {
        if (d.section === 'body' && d.row.index === bRows.length - 1) {
          d.cell.styles.fontStyle = 'bold'
          d.cell.styles.fillColor = [210, 245, 228]
          d.cell.styles.textColor = C.green
        }
      },
    })
    y = doc.lastAutoTable.finalY + 4
    if (bp.savings_tip) infoBox('Savings Tip: ' + bp.savings_tip, [235, 255, 242], [8, 70, 45])
  }

  // ── SECTION 5: ITINERARY ─────────────────────────────────────────────────
  secHead('Day-wise Itinerary', C.accent2)

  if (plan.itinerary?.days?.length) {
    plan.itinerary.days.forEach((day, i) => {
      check(45)

      // Day header bar
      doc.setFillColor(...C.accent2)
      doc.roundedRect(ML, y, TW, 10, 2, 2, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(...C.white)
      doc.text(`DAY ${i + 1}  -  ${safe(day.theme || '').toUpperCase()}`, ML + 5, y + 7)
      y += 13

      // Places to visit highlight box (if available)
      const places = (day.activities || [])
        .map(a => safe(a.place || a.activity || ''))
        .filter(Boolean)

      if (places.length) {
        const placeLine = 'Places: ' + places.join('  /  ')
        const pLines = doc.splitTextToSize(placeLine, TW - 8)
        const ph = pLines.length * 5 + 8
        check(ph + 2)
        doc.setFillColor(240, 235, 255)
        doc.setDrawColor(...C.accent2.map(v => Math.min(v + 100, 255)))
        doc.setLineWidth(0.25)
        doc.roundedRect(ML, y, TW, ph, 2, 2, 'FD')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7.5)
        doc.setTextColor(...C.accent2)
        doc.text(pLines, ML + 4, y + 5.5)
        y += ph + 4
      }

      // Activity rows
      ;(day.activities || []).forEach((act) => {
        check(14)

        // Time badge
        doc.setFillColor(235, 230, 255)
        doc.roundedRect(ML + 2, y - 3.5, 22, 6, 1.5, 1.5, 'F')
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(7.5)
        doc.setTextColor(...C.accent2)
        doc.text(safe(act.time || ''), ML + 4, y + 0.5)

        // Activity name (bold) — shows place name prominently
        const actLabel = safe(act.place
          ? `${act.activity} — ${act.place}`
          : (act.activity || ''))
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(8.5)
        doc.setTextColor(...C.bodyTxt)
        const actLines = doc.splitTextToSize(actLabel, TW - 30)
        doc.text(actLines, ML + 27, y + 0.5)
        let rowY = y + actLines.length * 4.5 + 1

        // Description
        if (act.description) {
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(8)
          doc.setTextColor(...C.mutedTxt)
          const descLines = doc.splitTextToSize(safe(act.description), TW - 30)
          check(descLines.length * 4.5 + 2)
          doc.text(descLines, ML + 27, rowY)
          rowY += descLines.length * 4.5 + 2
        }
        y = rowY + 1
      })
      y += 3
    })
  }

  // ── SECTION 6: LOCAL GUIDE ───────────────────────────────────────────────
  secHead('Local Recommendations', C.orange)

  if (plan.local_guide) {
    const lg   = plan.local_guide
    const cats = [
      { key: 'restaurants', label: 'Restaurants'  },
      { key: 'cafes',       label: 'Cafes'         },
      { key: 'hidden_gems', label: 'Hidden Gems'   },
      { key: 'shopping',    label: 'Shopping'      },
    ]
    cats.forEach(cat => {
      const items = lg[cat.key]
      if (!items?.length) return
      check(12)
      boldTxt(cat.label + ':', 0, C.orange, 9)
      items.forEach(item => bodyTxt('  -  ' + item, 2, C.bodyTxt, 8.5))
      y += 1
    })
  }

  // ── SECTION 7: SAFETY ────────────────────────────────────────────────────
  secHead('Safety & Travel Tips', C.red)

  if (plan.safety) {
    const s = plan.safety
    if (s.precautions?.length) {
      boldTxt('Precautions:', 0, C.mutedTxt, 8.5)
      s.precautions.forEach(p => {
        check(9)
        const lines = doc.splitTextToSize(safe(p), TW - 9)
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(...C.bodyTxt)
        doc.text('-', ML + 2, y)
        doc.text(lines, ML + 7, y)
        y += lines.length * 5.2 + 1.5
      })
      y += 2
    }
    if (s.scam_warnings?.length) {
      boldTxt('Scam Alerts:', 0, [170, 55, 0], 8.5)
      s.scam_warnings.forEach(w => {
        check(9)
        const lines = doc.splitTextToSize(safe(w), TW - 9)
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5)
        doc.setTextColor(170, 55, 0); doc.text('!', ML + 2, y)
        doc.setTextColor(...C.bodyTxt); doc.text(lines, ML + 7, y)
        y += lines.length * 5.2 + 1.5
      })
      y += 2
    }
    if (s.emergency_contacts) {
      check(16)
      const ecL = doc.splitTextToSize('Emergency Contacts: ' + safe(s.emergency_contacts), TW - 10)
      const bh  = ecL.length * 5.2 + 8
      doc.setFillColor(255, 232, 232); doc.setDrawColor(...C.red); doc.setLineWidth(0.4)
      doc.roundedRect(ML, y, TW, bh, 2, 2, 'FD')
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(...C.red)
      doc.text(ecL, ML + 5, y + 6)
      y += bh + 4
    }
  }

  // ── FOOTER on every page ─────────────────────────────────────────────────
  const total = doc.internal.getNumberOfPages()
  for (let p = 1; p <= total; p++) {
    doc.setPage(p)
    const fy = pageH - 9
    doc.setDrawColor(...C.border); doc.setLineWidth(0.3)
    doc.line(ML, fy - 3, pageW - MR, fy - 3)
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(...C.mutedTxt)
    doc.text('VoyageAI  |  AI-Powered Multi-Agent Travel Planner', ML, fy)
    doc.text(`Page ${p} of ${total}`, pageW - MR, fy, { align: 'right' })
  }

  doc.save(`VoyageAI_${safe(plan.destination)}_TravelPlan.pdf`)
}