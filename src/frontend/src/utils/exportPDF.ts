import type { AllocationCategory, UnlockType } from '../hooks/useTokenomicsCalculator';

interface VestingDataPoint {
  month: number;
  date: string;
  totalUnlocked: number;
  percentUnlocked: number;
}

interface ExportPDFParams {
  sessionName: string;
  totalSupply: number;
  categories: AllocationCategory[];
  vestingData: VestingDataPoint[];
  containerRef?: React.RefObject<HTMLElement | null>;
}

function formatTokenAmount(amount: number): string {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(2)}B`;
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(2)}K`;
  return amount.toFixed(0);
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function getUnlockLabel(unlockType: UnlockType): string {
  if (unlockType === 'immediate') return 'Immediate';
  if (unlockType === 'linear_monthly') return 'Linear Monthly';
  if (unlockType === 'quarterly') return 'Quarterly';
  return String(unlockType);
}

function getUnlockLabelLong(unlockType: UnlockType): string {
  if (unlockType === 'immediate') return 'Immediate Unlock';
  if (unlockType === 'linear_monthly') return 'Linear Monthly Vesting';
  if (unlockType === 'quarterly') return 'Quarterly Vesting';
  return String(unlockType);
}

export async function exportPDF(params: ExportPDFParams): Promise<void> {
  const { sessionName, totalSupply, categories, vestingData } = params;

  // Load jsPDF via script tag (most reliable approach)
  await new Promise<void>((resolve, reject) => {
    if ((window as any).jspdf) { resolve(); return; }
    const existing = document.querySelector('script[data-jspdf]');
    if (existing) {
      // Already loading, wait for it
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load jsPDF')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
    script.setAttribute('data-jspdf', 'true');
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load jsPDF'));
    document.head.appendChild(script);
  });

  const jsPDF = (window as any).jspdf?.jsPDF || (window as any).jsPDF;
  if (!jsPDF) {
    throw new Error('Could not initialize jsPDF library');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc: any = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  // ── Helpers ───────────────────────────────────────────────────────────────

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  }

  function drawPageHeader() {
    doc.setFillColor(10, 15, 40);
    doc.rect(0, 0, pageWidth, 22, 'F');
    doc.setFillColor(0, 188, 180);
    doc.rect(0, 22, pageWidth, 1.5, 'F');
    doc.setTextColor(0, 188, 180);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('OPENOMICS REPORT', margin, 14);
    doc.setTextColor(212, 175, 55);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    doc.text(dateStr, pageWidth - margin, 14, { align: 'right' });
    y = 30;
  }

  function drawSectionTitle(title: string) {
    checkPageBreak(14);
    doc.setFillColor(0, 188, 180);
    doc.rect(margin, y, 3, 7, 'F');
    doc.setFillColor(245, 247, 252);
    doc.rect(margin + 3, y, contentWidth - 3, 7, 'F');
    doc.setTextColor(10, 15, 40);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin + 7, y + 5.5);
    y += 12;
  }

  // ── Page 1: Header + Session Info ─────────────────────────────────────────

  drawPageHeader();

  // Session info box
  doc.setFillColor(245, 247, 252);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(10, 15, 40);
  doc.text(`Session: ${sessionName}`, margin + 4, y + 7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(80, 80, 100);
  doc.text(
    `Total Supply: ${formatTokenAmount(totalSupply)} tokens  |  Categories: ${categories.length}  |  Generated: ${new Date().toLocaleString()}`,
    margin + 4,
    y + 13
  );
  y += 24;

  // ── Summary Statistics ────────────────────────────────────────────────────

  drawSectionTitle('Summary Statistics');

  const totalAllocated = categories.reduce((sum, c) => sum + c.percentage, 0);
  const immediateUnlock = categories.reduce((sum, c) => {
    return c.unlockType === 'immediate' ? sum + c.percentage : sum;
  }, 0);
  const lockedTokens = 100 - immediateUnlock;
  const vestedCats = categories.filter(
    (c) => c.unlockType !== 'immediate' && c.vestingMonths > 0
  );
  const avgVesting =
    vestedCats.length > 0
      ? `${(vestedCats.reduce((s, c) => s + c.vestingMonths, 0) / vestedCats.length).toFixed(0)} mo`
      : 'N/A';
  const maxCliff = Math.max(...categories.map((c) => c.cliffMonths), 0);

  const stats = [
    { label: 'Total Supply', value: formatTokenAmount(totalSupply) },
    { label: 'Total Allocated', value: formatPercent(totalAllocated) },
    { label: 'Categories', value: String(categories.length) },
    { label: 'Immediate Unlock', value: formatPercent(immediateUnlock) },
    { label: 'Vested / Locked', value: formatPercent(lockedTokens) },
    { label: 'Avg Vesting', value: avgVesting },
    { label: 'Max Cliff', value: `${maxCliff} mo` },
    { label: 'Timeline Months', value: String(vestingData.length) },
  ];

  const statColCount = 4;
  const statColWidth = contentWidth / statColCount;
  const statRows = Math.ceil(stats.length / statColCount);

  for (let i = 0; i < stats.length; i++) {
    const col = i % statColCount;
    const row = Math.floor(i / statColCount);
    const sx = margin + col * statColWidth;
    const sy = y + row * 18;

    doc.setFillColor(248, 250, 255);
    doc.roundedRect(sx, sy, statColWidth - 2, 15, 1.5, 1.5, 'F');
    doc.setFillColor(0, 188, 180);
    doc.rect(sx, sy, 2, 15, 'F');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 120);
    doc.text(stats[i].label.toUpperCase(), sx + 5, sy + 5.5);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 15, 40);
    doc.text(stats[i].value, sx + 5, sy + 11.5);
  }
  y += statRows * 18 + 6;

  // ── Allocation Categories Table ───────────────────────────────────────────

  checkPageBreak(20);
  drawSectionTitle('Token Allocation Categories');

  const tableCols = [
    { label: 'Category', x: margin, w: 42 },
    { label: 'Alloc %', x: margin + 42, w: 22 },
    { label: 'Token Amount', x: margin + 64, w: 32 },
    { label: 'Cliff (mo)', x: margin + 96, w: 22 },
    { label: 'Vesting (mo)', x: margin + 118, w: 24 },
    { label: 'Unlock Type', x: margin + 142, w: 40 },
  ];

  // Header row
  doc.setFillColor(10, 15, 40);
  doc.rect(margin, y, contentWidth, 8, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  tableCols.forEach((col) => {
    doc.text(col.label, col.x + 2, y + 5.5);
  });
  y += 8;

  // Data rows
  categories.forEach((cat, idx) => {
    checkPageBreak(9);
    const tokenAmount = (cat.percentage / 100) * totalSupply;

    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 255);
      doc.rect(margin, y, contentWidth, 8, 'F');
    } else {
      doc.setFillColor(255, 255, 255);
      doc.rect(margin, y, contentWidth, 8, 'F');
    }

    // Color dot
    const colorHex = cat.color || '#00BCB4';
    const r = parseInt(colorHex.slice(1, 3), 16) || 0;
    const g = parseInt(colorHex.slice(3, 5), 16) || 188;
    const b = parseInt(colorHex.slice(5, 7), 16) || 180;
    doc.setFillColor(r, g, b);
    doc.circle(margin + 2.5, y + 4, 1.5, 'F');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(10, 15, 40);

    const catName = cat.name.length > 16 ? cat.name.slice(0, 15) + '…' : cat.name;
    doc.text(catName, margin + 6, y + 5.5);
    doc.text(formatPercent(cat.percentage), tableCols[1].x + 2, y + 5.5);
    doc.text(formatTokenAmount(tokenAmount), tableCols[2].x + 2, y + 5.5);
    doc.text(String(cat.cliffMonths || 0), tableCols[3].x + 2, y + 5.5);
    doc.text(String(cat.vestingMonths || 0), tableCols[4].x + 2, y + 5.5);
    doc.text(getUnlockLabel(cat.unlockType), tableCols[5].x + 2, y + 5.5);

    doc.setDrawColor(220, 225, 235);
    doc.line(margin, y + 8, margin + contentWidth, y + 8);

    y += 8;
  });

  y += 6;

  // ── Vesting Schedule Monthly Breakdown ───────────────────────────────────

  if (vestingData && vestingData.length > 0) {
    checkPageBreak(20);
    drawSectionTitle('Vesting Schedule — Monthly Breakdown');

    const vestCols = [
      { label: 'Month', x: margin, w: 18 },
      { label: 'Date', x: margin + 18, w: 28 },
      { label: 'Total Unlocked', x: margin + 46, w: 40 },
      { label: '% Unlocked', x: margin + 86, w: 30 },
    ];

    // Header
    doc.setFillColor(10, 15, 40);
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    vestCols.forEach((col) => {
      doc.text(col.label, col.x + 2, y + 5.5);
    });
    y += 8;

    // Show up to 60 months
    const maxRows = Math.min(vestingData.length, 60);
    for (let i = 0; i < maxRows; i++) {
      checkPageBreak(7);
      const row = vestingData[i];

      if (i % 2 === 0) {
        doc.setFillColor(248, 250, 255);
        doc.rect(margin, y, contentWidth, 6.5, 'F');
      } else {
        doc.setFillColor(255, 255, 255);
        doc.rect(margin, y, contentWidth, 6.5, 'F');
      }

      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(10, 15, 40);

      doc.text(String(row.month), vestCols[0].x + 2, y + 4.5);
      doc.text(String(row.date || ''), vestCols[1].x + 2, y + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 140, 130);
      doc.text(formatTokenAmount(row.totalUnlocked), vestCols[2].x + 2, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 100);
      doc.text(`${row.percentUnlocked.toFixed(2)}%`, vestCols[3].x + 2, y + 4.5);

      doc.setDrawColor(220, 225, 235);
      doc.line(margin, y + 6.5, margin + contentWidth, y + 6.5);

      y += 6.5;
    }

    if (vestingData.length > 60) {
      y += 4;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 120);
      doc.text(
        `… and ${vestingData.length - 60} more months (showing first 60 of ${vestingData.length})`,
        margin,
        y
      );
      y += 6;
    }

    y += 4;
  }

  // ── Category Vesting Details ──────────────────────────────────────────────

  checkPageBreak(20);
  drawSectionTitle('Category Vesting Details');

  categories.forEach((cat) => {
    checkPageBreak(32);

    const tokenAmount = (cat.percentage / 100) * totalSupply;

    doc.setFillColor(248, 250, 255);
    doc.roundedRect(margin, y, contentWidth, 28, 2, 2, 'F');

    const colorHex = cat.color || '#00BCB4';
    const r = parseInt(colorHex.slice(1, 3), 16) || 0;
    const g = parseInt(colorHex.slice(3, 5), 16) || 188;
    const b = parseInt(colorHex.slice(5, 7), 16) || 180;
    doc.setFillColor(r, g, b);
    doc.rect(margin, y, 3, 28, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(10, 15, 40);
    doc.text(cat.name, margin + 7, y + 7);

    // Unlock type badge (top right)
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 140, 130);
    doc.text(getUnlockLabelLong(cat.unlockType), margin + contentWidth - 2, y + 7, { align: 'right' });

    const detailCols = [
      { label: 'Allocation', value: formatPercent(cat.percentage) },
      { label: 'Token Amount', value: formatTokenAmount(tokenAmount) },
      { label: 'Cliff Period', value: `${cat.cliffMonths || 0} months` },
      { label: 'Vesting Period', value: `${cat.vestingMonths || 0} months` },
    ];

    const detailColW = contentWidth / 4;
    detailCols.forEach((detail, di) => {
      const dx = margin + 7 + di * detailColW;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 120);
      doc.text(detail.label.toUpperCase(), dx, y + 15);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(10, 15, 40);
      doc.text(detail.value, dx, y + 21);
    });

    y += 32;
  });

  // ── Footer on every page ──────────────────────────────────────────────────

  const totalPages: number = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(10, 15, 40);
    doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 170);
    doc.text(
      `Openomics Calculator  |  ${sessionName}  |  Page ${p} of ${totalPages}`,
      margin,
      pageHeight - 3.5
    );
    doc.setTextColor(212, 175, 55);
    doc.text('alphareporters.co', pageWidth - margin, pageHeight - 3.5, { align: 'right' });
  }

  // ── Save ──────────────────────────────────────────────────────────────────

  const filename = `tokenomics-${sessionName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}
