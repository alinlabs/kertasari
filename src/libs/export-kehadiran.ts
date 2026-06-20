import { ExportColumn, generateExcel, generatePDF } from './export-base';

export const downloadKehadiranExcel = (data: any[], filename: string, columns: ExportColumn[]) => {
  return generateExcel(data, filename, columns);
};

export const downloadKehadiranPDF = async (data: any[], filename: string, columns: ExportColumn[]) => {
  const isAbsensi = filename.startsWith('Laporan_Absensi');
  const isKeanggotaan = filename.startsWith('Laporan_Keanggotaan');

  if (isKeanggotaan || isAbsensi) {
    const pdfColumns = isKeanggotaan ? [
      { header: "Nama", key: "col_nama" },
      { header: "Posisi & Divisi", key: "col_posisi" },
      { header: "Hadir", key: "hadir" },
      { header: "Izin", key: "izin" },
      { header: "Sakit", key: "sakit" },
      { header: "Pulang", key: "pulang" },
    ] : [
      { header: "Nama", key: "col_nama" },
      { header: "Posisi & Divisi", key: "col_posisi" },
      { header: "Status", key: "status" },
      { header: "Keterangan", key: "keterangan" },
    ];

    return generatePDF(data, filename, pdfColumns, {
      formatTableData: (data) => {
        return data.map(item => {
          if (!item) {
            return isKeanggotaan 
              ? ['-', '-', '-', '-', '-', '-']
              : ['-', '-', '-', '-'];
          }
          if (isKeanggotaan) {
            return [
              `${item.nama}\nNIM. ${item.nim || '-'}`,
              `${item.jabatan}\n${item.divisi || '-'}`,
              item.hadir,
              item.izin,
              item.sakit,
              item.pulang
            ];
          } else {
             return [
              `${item.nama}\nNIM. ${item.nim || '-'}`,
              `${item.jabatan}\n${item.divisi || '-'}`,
              item.status,
              item.keterangan || '-'
            ];
          }
        });
      },
      autoTableOptions: {
        columnStyles: isKeanggotaan ? {
          0: { cellWidth: 50 }, // Nama
          1: { cellWidth: 50 }, // Posisi & Divisi
          2: { cellWidth: 20, halign: 'center' }, // Hadir
          3: { cellWidth: 20, halign: 'center' }, // Izin
          4: { cellWidth: 20, halign: 'center' }, // Sakit
          5: { cellWidth: 22, halign: 'center' }, // Pulang
        } : {
          0: { cellWidth: 50 }, // Nama
          1: { cellWidth: 50 }, // Posisi & Divisi
          2: { cellWidth: 35, halign: 'center' }, // Status
          3: { cellWidth: 'auto', halign: 'left' }, // Keterangan
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
             let currentY = Number(y) + pTop + 3.5;
             const maxWidth = hookData.cell.width - pLeft * 2;
             
             const rowData = data[hookData.row.index];
             if (!rowData) return;
             const colKey = pdfColumns[hookData.column.index].key;
             
             const writeText = (text: string, fontStyle: string, fontSize: number, color: number[], lineHeight: number, alignCenter: boolean = false) => {
                doc.setFont("helvetica", fontStyle);
                doc.setFontSize(fontSize);
                doc.setTextColor(color[0], color[1], color[2]);
                
                const lines = doc.splitTextToSize(text || '-', maxWidth);
                if (alignCenter) {
                  const textWidth = doc.getStringUnitWidth(lines[0]) * fontSize / doc.internal.scaleFactor;
                  doc.text(lines, Number(x) + (hookData.cell.width / 2) - (textWidth / 2), currentY);
                } else {
                  doc.text(lines, startX, currentY);
                }
                currentY += lines.length * lineHeight;
             };

             if (colKey === 'col_nama') {
                writeText(rowData.nama || '-', "bold", 9, [15, 23, 42], 4);
                writeText(`NIM. ${rowData.nim || '-'}`, "normal", 8, [100, 116, 139], 4);
             } else if (colKey === 'col_posisi') {
                writeText(rowData.jabatan || '-', "bold", 9, [15, 23, 42], 4);
                writeText(rowData.divisi || '-', "normal", 8, [100, 116, 139], 4);
             } else if (['hadir', 'izin', 'sakit', 'pulang'].includes(colKey)) {
                writeText(String(rowData[colKey] || '0'), "normal", 9, [15, 23, 42], 4, true);
             } else if (colKey === 'status') {
                writeText(String(rowData[colKey] || '-'), "bold", 9, [15, 23, 42], 4, true);
             } else if (colKey === 'keterangan') {
                writeText(String(rowData[colKey] || '-'), "normal", 9, [15, 23, 42], 4);
             }
          }
        }
      }
    });
  }

  // Fallback for other cases if any
  return generatePDF(data, filename, columns);
};
