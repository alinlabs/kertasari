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

export const downloadAdministrasiExcel = (data: any[], filename: string, columns: ExportColumn[]) => {
  return generateExcel(data, filename, columns);
};

export const downloadAdministrasiPDF = async (data: any[], filename: string, columns: ExportColumn[]) => {
  return generatePDF(data, filename, columns, {
    formatTableData: (data, columns) => {
      return data.map(item => columns.map(col => {
        let val = item[col.key];
        if (col.key === 'tanggalsurat' || col.key === 'tanggal') {
          val = formatDateValue(val);
        }
        return val || '-';
      }));
    },
    autoTableOptions: {
      columnStyles: {
        0: { cellWidth: 26 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 },
        4: { cellWidth: 30 },
      }
    }
  });
};
