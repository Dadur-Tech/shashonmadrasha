// PDF Generation Utilities for Reports
// Using browser's native print functionality for professional PDF output

export interface InstitutionInfo {
  name: string;
  nameEnglish: string;
  address: string;
  phone?: string;
  email?: string;
  establishedYear?: number;
  registrationNumber?: string;
  principalName?: string;
}

export interface ReportOptions {
  title: string;
  subtitle?: string;
  dateRange?: { from: string; to: string };
  generatedBy?: string;
  institution: InstitutionInfo;
}

export function generatePrintStyles(): string {
  return `
    @media print {
      body { 
        -webkit-print-color-adjust: exact !important; 
        print-color-adjust: exact !important;
        font-family: 'Noto Sans Bengali', sans-serif;
      }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
      .avoid-break { page-break-inside: avoid; }
      
      @page {
        size: A4;
        margin: 15mm;
      }
    }
  `;
}

export function formatCurrency(amount: number): string {
  return `৳${amount.toLocaleString('bn-BD')}`;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateEnglish(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function generateReportHeader(options: ReportOptions): string {
  const { institution, title, subtitle, dateRange } = options;
  
  return `
    <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px double #0d5c2e; padding-bottom: 20px;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 10px;">
        <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #0d5c2e, #1a7a42); border-radius: 12px; display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-size: 32px; font-weight: bold;">ج</span>
        </div>
        <div>
          <h1 style="font-size: 22px; color: #0d5c2e; margin: 0; font-weight: bold;">${institution.name}</h1>
          <p style="font-size: 14px; color: #666; margin: 5px 0;">${institution.nameEnglish}</p>
          <p style="font-size: 12px; color: #888; margin: 0;">${institution.address}</p>
        </div>
      </div>
      
      <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <h2 style="font-size: 18px; color: #333; margin: 0 0 5px 0;">${title}</h2>
        ${subtitle ? `<p style="font-size: 14px; color: #666; margin: 0;">${subtitle}</p>` : ''}
        ${dateRange ? `
          <p style="font-size: 12px; color: #888; margin: 5px 0 0 0;">
            সময়কাল: ${formatDate(dateRange.from)} থেকে ${formatDate(dateRange.to)}
          </p>
        ` : ''}
      </div>
    </div>
  `;
}

export function generateReportFooter(options: ReportOptions): string {
  const now = new Date();
  
  return `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 11px; color: #888;">
      <div>
        <p style="margin: 0;">তৈরির তারিখ: ${formatDate(now)}</p>
        ${options.generatedBy ? `<p style="margin: 3px 0 0 0;">তৈরি করেছেন: ${options.generatedBy}</p>` : ''}
      </div>
      <div style="text-align: right;">
        <p style="margin: 0;">${options.institution.name}</p>
        ${options.institution.phone ? `<p style="margin: 3px 0 0 0;">ফোন: ${options.institution.phone}</p>` : ''}
      </div>
    </div>
  `;
}

export function generateTableStyles(): string {
  return `
    <style>
      .report-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
        margin: 20px 0;
      }
      .report-table th {
        background: #0d5c2e;
        color: white;
        padding: 12px 10px;
        text-align: right;
        font-weight: 600;
        border: 1px solid #0a4a24;
      }
      .report-table td {
        padding: 10px;
        border: 1px solid #ddd;
        text-align: right;
      }
      .report-table tr:nth-child(even) {
        background: #f9f9f9;
      }
      .report-table tr:hover {
        background: #f0f7f2;
      }
      .report-table tfoot td {
        background: #e8f5e9;
        font-weight: bold;
        border-top: 2px solid #0d5c2e;
      }
      .summary-box {
        background: linear-gradient(135deg, #f0f7f2, #e8f5e9);
        border: 1px solid #c8e6c9;
        border-radius: 10px;
        padding: 20px;
        margin: 20px 0;
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
      }
      .summary-item {
        text-align: center;
        padding: 15px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      }
      .summary-item .label {
        font-size: 12px;
        color: #666;
        margin-bottom: 5px;
      }
      .summary-item .value {
        font-size: 20px;
        font-weight: bold;
        color: #0d5c2e;
      }
      .signature-area {
        margin-top: 60px;
        display: flex;
        justify-content: space-between;
      }
      .signature-box {
        text-align: center;
        width: 200px;
      }
      .signature-line {
        border-top: 1px solid #333;
        padding-top: 8px;
        font-size: 12px;
        color: #333;
      }
    </style>
  `;
}

export function openPrintWindow(content: string, title: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('পপ-আপ ব্লক করা আছে। অনুগ্রহ করে পপ-আপ অনুমতি দিন।');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="bn" dir="ltr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      ${generateTableStyles()}
      <style>
        * { box-sizing: border-box; }
        body {
          font-family: 'Noto Sans Bengali', sans-serif;
          margin: 0;
          padding: 40px;
          background: white;
          color: #333;
          line-height: 1.6;
        }
        ${generatePrintStyles()}
      </style>
    </head>
    <body>
      ${content}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 500);
        }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

export function generateSignatureArea(signatures: string[]): string {
  return `
    <div class="signature-area avoid-break">
      ${signatures.map(sig => `
        <div class="signature-box">
          <div class="signature-line">${sig}</div>
        </div>
      `).join('')}
    </div>
  `;
}
