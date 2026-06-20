import { ExportColumn, generateExcel, generatePDF } from './export-base';

const formatDateValue = (val: any) => {
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const parts = val.split('-');
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${day} ${months[monthIdx]}`;
  }
  return val;
};

export const downloadAgendaExcel = (data: any[], filename: string, columns: ExportColumn[]) => {
  return generateExcel(data, filename, columns);
};

export const downloadAgendaPDF = async (data: any[], filename: string, columns: ExportColumn[]) => {
  const pdfColumns = [
    { header: "Waktu", key: "col_waktu" },
    { header: "Kegiatan", key: "col_kegiatan" },
    { header: "Detail", key: "col_detail" }
  ];

  return generatePDF(data, filename, pdfColumns, {
    formatTableData: (data) => {
      return data.map(item => {
        if (!item) return ['-', '-', '-'];
        const tgl = formatDateValue(item.tanggal) || '-';
        const wkt = item.waktu || '-';
        const proker = item.terkaitProker || '-';
        const judul = item.judul || '-';
        const lokasi = item.lokasi || '-';
        const pic = item.pic || '-';
        const deskripsi = item.deskripsi || '-';
        const status = item.status || '-';
        
        return [
          `${tgl}\n${wkt}`,
          `${proker}\n${judul}\n${lokasi}`,
          `${pic}\n${deskripsi}\nStatus : ${status}`
        ];
      });
    },
    autoTableOptions: {
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 65 },
        2: { cellWidth: 'auto' }
      },
      didParseCell: (hookData) => {
        if (hookData.section === 'body') {
          hookData.cell.styles.textColor = hookData.row.index % 2 === 0 ? [255, 255, 255] : [249, 250, 251];
        }
      },
      didDrawCell: (hookData) => {
        if (hookData.section === 'body') {
          const doc = hookData.doc as any;
          const { x, y } = hookData.cell;
          
          let pLeft = 4, pTop = 4;
          if (hookData.cell.padding) {
            pLeft = Number((hookData.cell.padding as any).left) || 4;
            pTop = Number((hookData.cell.padding as any).top) || 4;
          }
          
          const startX = Number(x) + pLeft;
          const startY = Number(y) + pTop;
          const maxWidth = hookData.cell.width - pLeft * 2;
          
          const rowData = data[hookData.row.index];
          if (!rowData) return;
          const colKey = pdfColumns[hookData.column.index].key;
          
          let currentY = startY + 3.5;
          const writeText = (text: string, fontStyle: string, fontSize: number, color: number[], lineHeight: number, inlineStr?: string, inlineFontStyle?: string) => {
            doc.setFont("helvetica", fontStyle);
            doc.setFontSize(fontSize);
            doc.setTextColor(color[0], color[1], color[2]);
            
            if (inlineStr) {
               // Special case for inline "Status: " + "xxx"
               doc.text(text, startX, currentY);
               const textWidth = doc.getStringUnitWidth(text) * fontSize / doc.internal.scaleFactor;
               doc.setFont("helvetica", inlineFontStyle || "normal");
               doc.text(inlineStr, startX + textWidth + 1, currentY);
               currentY += lineHeight;
               return;
            }
            
            const lines = doc.splitTextToSize(text || '-', maxWidth);
            doc.text(lines, startX, currentY);
            currentY += lines.length * lineHeight;
          };

          if (colKey === 'col_waktu') {
            writeText(formatDateValue(rowData.tanggal) || '-', "normal", 8, [100, 116, 139], 4);
            writeText(rowData.waktu || '-', "bold", 9, [15, 23, 42], 4);
            
          } else if (colKey === 'col_kegiatan') {
            writeText(rowData.terkaitProker || '-', "normal", 8, [100, 116, 139], 4);
            writeText(rowData.judul || '-', "bold", 9, [15, 23, 42], 4);
            writeText(rowData.lokasi || '-', "normal", 8, [100, 116, 139], 4);
            
          } else if (colKey === 'col_detail') {
            writeText(`PJ : ${rowData.pic || '-'}`, "bold", 8, [15, 23, 42], 4);
            writeText(rowData.deskripsi || '-', "normal", 8, [15, 23, 42], 4);
            writeText("Status :", "bold", 8, [15, 23, 42], 4, rowData.status || '-', "normal");
          }
        }
      }
    }
  });
};
