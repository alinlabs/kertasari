import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable, { UserOptions } from 'jspdf-autotable';

export interface ExportColumn {
  header: string;
  key: string;
}

export const getBase64ImageFromUrl = async (url: string): Promise<string> => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateExcel = (data: any[], filename: string, columns: ExportColumn[]) => {
  const exportData = data.map(item => {
    const row: any = {};
    columns.forEach(col => {
      row[col.header] = item[col.key] || '-';
    });
    return row;
  });
  
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const generatePDF = async (
  data: any[],
  filename: string,
  columns: ExportColumn[],
  options?: {
    formatTableData?: (data: any[], columns: ExportColumn[]) => any[][];
    autoTableOptions?: Partial<UserOptions>;
  }
) => {
  const doc = new jsPDF();
  
  const tableData = options?.formatTableData ? options.formatTableData(data, columns) : data.map(item => columns.map(col => item[col.key] || '-'));
  
  try {
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Add Kop Surat (Official Header)
    try {
      const imgDataLeft = await getBase64ImageFromUrl('/gambar/wikara-logo.png');
      doc.addImage(imgDataLeft, 'PNG', 14, 10, 24, 24);
    } catch (e) {
      console.warn("Failed to load left logo for PDF header", e);
    }

    try {
      const imgDataRight = await getBase64ImageFromUrl('/gambar/logo.png');
      doc.addImage(imgDataRight, 'PNG', pageWidth - 14 - 24, 10, 24, 24);
    } catch (e) {
      console.warn("Failed to load right logo for PDF header", e);
    }
    
    // Header Text
    doc.setFont("helvetica", "bold");
    
    doc.setFontSize(14);
    let textStr = "Kelompok Desa Kertasari";
    let txtWidth = doc.getStringUnitWidth(textStr) * 14 / doc.internal.scaleFactor;
    doc.text(textStr, (pageWidth - txtWidth) / 2, 16);
    
    doc.setFontSize(16);
    textStr = "Kuliah Praktik Pengabdian Masyarakat";
    txtWidth = doc.getStringUnitWidth(textStr) * 16 / doc.internal.scaleFactor;
    doc.text(textStr, (pageWidth - txtWidth) / 2, 23);
    
    doc.setFontSize(12);
    textStr = "Sekolah Tinggi Ilmu Ekonomi Wibawa Karta Raharja 2026";
    txtWidth = doc.getStringUnitWidth(textStr) * 12 / doc.internal.scaleFactor;
    doc.text(textStr, (pageWidth - txtWidth) / 2, 29);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    textStr = "Desa Kertasari, Kec. Bojong, Kab. Purwakarta - 41164";
    txtWidth = doc.getStringUnitWidth(textStr) * 10 / doc.internal.scaleFactor;
    doc.text(textStr, (pageWidth - txtWidth) / 2, 34);
    
    // Draw a line
    doc.setLineWidth(0.5);
    doc.line(14, 38, pageWidth - 14, 38);
    doc.setLineWidth(1.5);
    doc.line(14, 39.5, pageWidth - 14, 39.5);
    
    // Document Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    let titleName = filename.replace(/_/g, ' ').toUpperCase();
    if (titleName.startsWith('DATA ')) {
      titleName = titleName.substring(5);
    } else if (titleName.startsWith('LAPORAN ')) {
      titleName = titleName.substring(8);
    }
    const title = `LAPORAN DATA ${titleName}`;
    // Center title
    txtWidth = doc.getStringUnitWidth(title) * 12 / doc.internal.scaleFactor;
    const x = (pageWidth - txtWidth) / 2;
    doc.text(title, x, 48);

    autoTable(doc, {
      head: [columns.map(col => col.header)],
      body: tableData,
      startY: 55,
      theme: 'grid',
      styles: { 
        fontSize: 9,
        cellPadding: 4,
        font: "helvetica",
        lineColor: [226, 232, 240], // slate-200
        lineWidth: 0.1,
      },
      headStyles: { 
        fillColor: [21, 128, 61], // Tailwind brand-600 (green)
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // Tailwind slate-50
      },
      margin: { top: 15, bottom: 35, left: 14, right: 14 },
      ...(options?.autoTableOptions || {})
    });
    
    // Render footer timestamp
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const footerText = `Dicetak pada: ${new Date().toLocaleString('id-ID')} | Halaman ${i} dari ${pageCount}`;
        doc.text(footerText, 14, doc.internal.pageSize.getHeight() - 10);
        
        const supportText = "Support : AlinLabs Technologi";
        const linkText = "www.alinlabs.biz.id";
        const rightX = doc.internal.pageSize.getWidth() - 14;
        doc.text(supportText, rightX, doc.internal.pageSize.getHeight() - 12, { align: 'right' });
        doc.text(linkText, rightX, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
    }

    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
    autoTable(doc, {
      head: [columns.map(col => col.header)],
      body: tableData,
    });
    doc.save(`${filename}-fallback.pdf`);
  }
};
