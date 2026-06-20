import { ExportColumn, generateExcel, generatePDF } from './export-base';

const formatDateValue = (val: any) => {
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const parts = val.split('-');
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return `${day} ${months[monthIdx]}\n${year}`;
  }
  return val;
};

const formatRupiah = (val: any) => {
  if (typeof val === 'number') {
    return new Intl.NumberFormat('id-ID').format(val);
  }
  return val;
};

export const downloadKeuanganExcel = (data: any[], filename: string, columns: ExportColumn[]) => {
  return generateExcel(data, filename, columns);
};

export const downloadKeuanganPDF = async (data: any[], filename: string, columns: ExportColumn[]) => {
  const isUmum = filename === 'Laporan_Keuangan_Umum';

  return generatePDF(data, filename, columns, {
    formatTableData: (data, columns) => {
      return data.map(item => columns.map(col => {
        let val = item[col.key];
        if (val !== undefined && val !== null) {
          if (col.key === 'tanggal') {
            val = formatDateValue(val);
          } else if (col.key === 'jumlah' || col.key === 'saldo' || col.key === 'nominal') {
            val = formatRupiah(val);
            if (col.key === 'jumlah' && isUmum) {
              if (item.jenis === 'Pemasukan') val = `+${val}`;
              else if (item.jenis === 'Pengeluaran') val = `-${val}`;
            }
          } else if (col.key === 'kategori' && isUmum) {
            val = "           \n           ";
          }
        }
        return val || '-';
      }));
    },
    autoTableOptions: {
      columnStyles: isUmum ? {
        0: { cellWidth: 26 },
        1: { cellWidth: 42 },
        2: { cellWidth: 'auto' },
        3: { cellWidth: 32, halign: 'right' },
        4: { cellWidth: 35, halign: 'right' },
      } : {
        0: { cellWidth: 26 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 35 },
        3: { cellWidth: 45 },
        4: { cellWidth: 35, halign: 'right' },
      },
      didParseCell: (hookData) => {
        if (hookData.section === 'body') {
           const colKey = columns[hookData.column.index].key;
           if (colKey === 'jumlah' || colKey === 'saldo' || colKey === 'nominal') {
              hookData.cell.styles.halign = 'right';
           }
           if (colKey === 'jumlah' && isUmum) {
              const rowData = data[hookData.row.index];
              if (rowData.jenis === 'Pemasukan') {
                 hookData.cell.styles.textColor = [21, 128, 61];
                 hookData.cell.styles.fontStyle = 'bold';
              } else if (rowData.jenis === 'Pengeluaran') {
                 hookData.cell.styles.textColor = [220, 38, 38];
                 hookData.cell.styles.fontStyle = 'bold';
              }
           }
        }
      },
      didDrawCell: (hookData) => {
        if (isUmum && hookData.section === 'body') {
           const colKey = columns[hookData.column.index].key;
           if (colKey === 'kategori') {
              const rowData = data[hookData.row.index];
              if (!rowData) return;
              const doc = hookData.doc as any;
              const { x, y } = hookData.cell as any;
              
              const cellPadding = hookData.cell.padding;
              let pLeft = 3;
              let pTop = 3;
              if (cellPadding !== null && typeof cellPadding === 'object') {
                 pLeft = Number((cellPadding as any).left) || 3;
                 pTop = Number((cellPadding as any).top) || 3;
              } else if (typeof cellPadding === 'number') {
                 pLeft = Number(cellPadding);
                 pTop = Number(cellPadding);
              }
              const paddingLeft = pLeft;
              const paddingTop = pTop;
              
              const isPemasukan = rowData.jenis === 'Pemasukan';

              doc.setTextColor(15, 23, 42);
              doc.setFont("helvetica", "bold");
              doc.setFontSize(9);
              doc.text(rowData.kategori || '-', Number(x) + paddingLeft, Number(y) + paddingTop + 3.5);

              doc.setTextColor(100, 116, 139);
              doc.setFont("helvetica", "normal");
              doc.setFontSize(7);
              const fallbackSumber = (rowData.sumber && rowData.sumber !== '-') ? rowData.sumber : (isPemasukan ? 'Pemasukan' : 'Pengeluaran');
              doc.text(fallbackSumber, Number(x) + paddingLeft, Number(y) + paddingTop + 8);
           }
        }
      }
    }
  });
};
