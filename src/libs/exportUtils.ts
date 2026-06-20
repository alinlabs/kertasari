import { ExportColumn } from './export-base';
import { generateExcel, generatePDF } from './export-base';
import { downloadKeuanganExcel, downloadKeuanganPDF } from './export-keuangan';
import { downloadProkerExcel, downloadProkerPDF } from './export-proker';
import { downloadAgendaExcel, downloadAgendaPDF } from './export-agenda';
import { downloadAdministrasiExcel, downloadAdministrasiPDF } from './export-administrasi';
import { downloadKehadiranExcel, downloadKehadiranPDF } from './export-kehadiran';

export type { ExportColumn };

export const downloadExcel = (data: any[], filename: string, columns: ExportColumn[]) => {
  if (filename.startsWith('Laporan_Keuangan')) return downloadKeuanganExcel(data, filename, columns);
  if (filename === 'Data_Program_Kerja') return downloadProkerExcel(data, filename, columns);
  if (filename === 'Data_Agenda') return downloadAgendaExcel(data, filename, columns);
  if (filename.startsWith('Laporan_Administrasi')) return downloadAdministrasiExcel(data, filename, columns);
  if (filename.startsWith('Laporan_Keanggotaan') || filename.startsWith('Laporan_Absensi')) return downloadKehadiranExcel(data, filename, columns);
  
  return generateExcel(data, filename, columns);
};

export const downloadPDF = async (data: any[], filename: string, columns: ExportColumn[]) => {
  if (filename.startsWith('Laporan_Keuangan')) return downloadKeuanganPDF(data, filename, columns);
  if (filename === 'Data_Program_Kerja') return downloadProkerPDF(data, filename, columns);
  if (filename === 'Data_Agenda') return downloadAgendaPDF(data, filename, columns);
  if (filename.startsWith('Laporan_Administrasi')) return downloadAdministrasiPDF(data, filename, columns);
  if (filename.startsWith('Laporan_Keanggotaan') || filename.startsWith('Laporan_Absensi')) return downloadKehadiranPDF(data, filename, columns);

  return generatePDF(data, filename, columns);
};

