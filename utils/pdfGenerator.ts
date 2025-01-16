import { jsPDF } from 'jspdf';

export const generatePDF = (content: string, filename: string) => {
  const doc = new jsPDF();

  // Split the content into lines
  const lines = doc.splitTextToSize(content, 180);

  let y = 10;
  lines.forEach((line: string) => {
    if (y > 280) {
      doc.addPage();
      y = 10;
    }
    doc.text(line, 10, y);
    y += 7;
  });

  doc.save(filename);
};
