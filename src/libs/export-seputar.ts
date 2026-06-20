import jsPDF from "jspdf";
import { Seputar } from "../types";

export const downloadSeputarKamiPDF = async (data: Seputar) => {
  const { jsPDF } = await import("jspdf");
  
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const marginLeft = 40;
  const marginRight = 30;
  const marginTop = 20;
  const marginBottom = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - marginLeft - marginRight;
  
  let cursorY = marginTop;

  // Colors
  const textColor = "#334155"; // slate-700 for better reading
  const headingColor = "#0F172A"; // slate-900
  const brandColor = "#15803D"; // brand-700 for a darker, more elegant green
  const accentColor = "#64748B"; // slate-500

  // Helper to add centered text
  const addCenteredText = (text: string, size: number, color: string, bold: boolean = false, font: string = "times") => {
    doc.setFont(font, bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    const tw = doc.getTextWidth(text);
    doc.text(text, marginLeft + (contentWidth - tw) / 2, cursorY);
    cursorY += size * (25.4 / 72) * 1.5;
  };

  const checkPageBreak = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - marginBottom) {
      doc.addPage();
      cursorY = marginTop + 10;
    }
  };

  // Helper to add paragraph text with justified alignment
  const addParagraph = (text: string, size: number, color: string, indent: number = 0) => {
    doc.setFont("times", "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    
    const paragraphs = text.split('\n');
    const lineHeight = size * (25.4 / 72) * 1.5;

    paragraphs.forEach(p => {
      // Skip empty paragraphs if any
      if (!p.trim()) return;
      
      const lines = doc.splitTextToSize(p, contentWidth - indent);
      lines.forEach((line: string, index: number) => {
        checkPageBreak(lineHeight);
        const isLastLine = index === lines.length - 1;
        
        if (isLastLine) {
          doc.text(line, marginLeft + indent, cursorY);
        } else {
          doc.text(line, marginLeft + indent, cursorY, { align: 'justify', maxWidth: contentWidth - indent });
        }
        cursorY += lineHeight;
      });
    });
  };

  const addHeading = (text: string, size: number, color: string, xOffset: number = 0) => {
    doc.setFont("times", "bold");
    doc.setFontSize(size);
    doc.setTextColor(color);
    const lineHeight = size * (25.4 / 72) * 1.5;
    checkPageBreak(lineHeight);
    doc.text(text, marginLeft + xOffset, cursorY);
    cursorY += lineHeight;
  };

  const addBullet = (text: string, size: number, color: string, indent: number = 0) => {
    doc.setFont("times", "normal");
    doc.setFontSize(size);
    doc.setTextColor(color);
    
    const lines = doc.splitTextToSize(text, contentWidth - indent - 6);
    const lineHeight = size * (25.4 / 72) * 1.5;

    lines.forEach((line: string, index: number) => {
      checkPageBreak(lineHeight);
      if (index === 0) {
        doc.text("•", marginLeft + indent + 2, cursorY);
      }
      
      const isLastLine = index === lines.length - 1;
      if (isLastLine) {
        doc.text(line, marginLeft + indent + 6, cursorY);
      } else {
        doc.text(line, marginLeft + indent + 6, cursorY, { align: 'justify', maxWidth: contentWidth - indent - 6 });
      }
      cursorY += lineHeight;
    });
  };

  try {
    const getBase64ImageFromUrl = async (url: string): Promise<string> => {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    };
    
    const [logoBase64, purwakartaLogoBase64] = await Promise.all([
      getBase64ImageFromUrl("/gambar/logo.png").catch(() => null),
      getBase64ImageFromUrl("/gambar/purwakarta-logo.png").catch(() => null)
    ]);
    
    (doc as any)._purwakartaLogo = purwakartaLogoBase64; // Store for later use

    if (logoBase64) {
      doc.addImage(logoBase64, "PNG", marginLeft + (contentWidth - 24) / 2, cursorY, 24, 24);
      cursorY += 30;
    } else {
      cursorY += 10;
    }
  } catch (e) {
    console.warn("Failed to load logo", e);
    cursorY += 10;
  }

  // --- HEADER ---
  addCenteredText("KULIAH PRAKTIK PENGABDIAN MASYARAKAT", 16, headingColor, true, "times");
  addCenteredText("DESA KERTASARI", 22, brandColor, true, "times");
  addCenteredText("Mengabdi, Berkarya, Berdampak Bersama Membangun Desa", 11, textColor, false, "times");
  
  cursorY += doc.getLineHeight(); // Single blank line between sections
  
  // --- KELOMPOK KPPM ---
  addHeading("PROFIL KELOMPOK KPPM", 14, headingColor);
  
  if (data.deskripsiKelompok) {
    addParagraph(data.deskripsiKelompok, 12, textColor);
  }

  if (data.visiKelompok) {
    addHeading("Visi", 12, brandColor);
    addParagraph(data.visiKelompok, 12, textColor);
  }

  if (data.misiKelompok && data.misiKelompok.length > 0) {
    addHeading("Misi", 12, brandColor);
    data.misiKelompok.forEach((misi) => {
      addBullet(misi, 12, textColor);
    });
  }

  // Nilai Inti
  cursorY += doc.getLineHeight() * 0.5; // Small gap before list
  addHeading("Nilai Inti (Slogan)", 13, headingColor);
  const nilaiInti = [
    { nama: "Mengabdi", desc: "Melayani dan mendampingi masyarakat sepenuh hati sebagai wujud kontribusi nyata." },
    { nama: "Berkarya", desc: "Mengimplementasikan keilmuan akademis menjadi karya dan inovasi yang solutif." },
    { nama: "Berdampak", desc: "Memberikan perubahan dan manfaat positif yang langsung dirasakan oleh masyarakat." },
    { nama: "Membangun Bersama", desc: "Menjalin kolaborasi dan kerja sama yang erat dengan seluruh elemen desa." }
  ];

  nilaiInti.forEach(item => {
    checkPageBreak(doc.getLineHeight() * 2);
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(brandColor);
    doc.setLineHeightFactor(1.5);
    doc.text(item.nama, marginLeft + 2, cursorY);
    cursorY += doc.getLineHeight();
    addParagraph(item.desc, 11, textColor, 2);
  });
  
  cursorY += doc.getLineHeight();
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(marginLeft + 20, cursorY, pageWidth - marginRight - 20, cursorY);
  cursorY += doc.getLineHeight();

  // --- DESA KERTASARI ---
  checkPageBreak(30);
  const purwLogo = (doc as any)._purwakartaLogo;
  if (purwLogo) {
    doc.addImage(purwLogo, "PNG", marginLeft, cursorY - 5, 14, 16);
    addHeading("PROFIL DESA KERTASARI", 15, headingColor, 18);
  } else {
    addHeading("PROFIL DESA KERTASARI", 15, headingColor);
  }
  
  if (data.deskripsiDesa) {
    addParagraph(data.deskripsiDesa, 12, textColor);
  }

  if (data.visiDesa) {
    addHeading("Visi Desa", 12, brandColor);
    addParagraph(data.visiDesa, 12, textColor);
  }

  if (data.misiDesa && data.misiDesa.length > 0) {
    addHeading("Misi Desa", 12, brandColor);
    data.misiDesa.forEach((misi) => {
      addBullet(misi, 12, textColor);
    });
  }

  if (data.sejarahDesa) {
    addHeading("Sejarah Desa Kertasari", 13, headingColor);
    addParagraph(data.sejarahDesa, 12, textColor);
  }

  // Footer metadata
  const totalPages = (doc as any).internal.getNumberOfPages();
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont("times", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(`Dicetak pada: ${today}`, marginLeft, pageHeight - 20);
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - marginRight - 25, pageHeight - 20);
  }

  // Download
  doc.save("Resume_Seputar_Kami.pdf");
};

