import { ExportColumn, generateExcel, generatePDF } from './export-base';

export const downloadProkerExcel = (data: any[], filename: string, columns: ExportColumn[]) => {
  return generateExcel(data, filename, columns);
};

export const downloadProkerPDF = async (data: any[], filename: string, columns: ExportColumn[]) => {
  return generatePDF(data, filename, columns, {
    autoTableOptions: {
      styles: {
        cellPadding: 5,
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Judul
        1: { cellWidth: 50 }, // Deskripsi
        2: { cellWidth: 35 }, // Target
        3: { cellWidth: 'auto' }, // Manfaat
      },
      didParseCell: (hookData) => {
        if (hookData.section === 'body' && columns[hookData.column.index].key === 'Manfaat') {
          hookData.cell.styles.textColor = hookData.row.index % 2 === 0 ? [255, 255, 255] : [249, 250, 251];
          // Pad the text with extra newlines so autotable allocates more vertical space 
          // to accommodate the custom bullet indent wrapping and spacing.
          const docInst = hookData.doc as any;
          const rawText = Array.isArray(hookData.cell.text) ? hookData.cell.text.join('\n') : String(hookData.cell.text);
          const numLines = docInst.splitTextToSize(rawText, hookData.cell.width > 0 ? hookData.cell.width - 10 : 50).length;
          const numBullets = rawText.split('\n').length;
          // Add more padding to guarantee enough height for bullets and wrapping
          const paddingLines = Array(Math.ceil((numLines + numBullets) * 0.5)).fill('');
          hookData.cell.text = Array.isArray(hookData.cell.text) ? [...hookData.cell.text, ...paddingLines] : [rawText, ...paddingLines] as any;
        }
      },
      didDrawCell: (hookData) => {
        if (hookData.section === 'body' && columns[hookData.column.index].key === 'Manfaat') {
          const doc = hookData.doc as any;
          const { x, y } = hookData.cell;
          
          let pLeft = 5, pTop = 5;
          if (hookData.cell.padding) {
            pLeft = Number((hookData.cell.padding as any).left) || 5;
            pTop = Number((hookData.cell.padding as any).top) || 5;
          }
          
          const startX = Number(x) + pLeft;
          let currentY = Number(y) + pTop + 3.5;
          
          const rowData = data[hookData.row.index];
          if (!rowData) return;
          const manfaatText = rowData.Manfaat || '-';
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(15, 23, 42);
          
          if (manfaatText === '-') {
            doc.text('-', startX, currentY);
            return;
          }
          
          const bullets = manfaatText.split('\n');
          const bulletIndent = 3; 
          const maxTextWidth = hookData.cell.width - pLeft * 2 - bulletIndent;
          
          bullets.forEach((bulletLine: string) => {
            if (bulletLine.startsWith('\u2022 ')) {
              const textContent = bulletLine.substring(2);
              doc.text('\u2022', startX, currentY);
              const lines = doc.splitTextToSize(textContent, maxTextWidth);
              doc.text(lines, startX + bulletIndent, currentY);
              currentY += lines.length * 3.8;
            } else {
              const lines = doc.splitTextToSize(bulletLine, maxTextWidth + bulletIndent);
              doc.text(lines, startX, currentY);
              currentY += lines.length * 3.8;
            }
          });
        }
      }
    }
  });
};
