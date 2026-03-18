import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Service } from "@/hooks/useServices";
import { formatCurrency, formatDateLong } from "@/lib/format";
import { APP_NAME } from "@/lib/constants";

interface ReportData {
  services: Service[];
  userName: string;
  month: string;
  year: number;
}

export function generateMonthlyReport({ services, userName, month, year }: ReportData) {
  const doc = new jsPDF();
  
  const statusLabels: Record<string, string> = {
    pending: "Pendente",
    paid: "Pago",
    cancelled: "Cancelado",
  };

  // Header
  doc.setFontSize(20);
  doc.setTextColor(16, 185, 129); // Primary green
  doc.text(APP_NAME.toUpperCase(), 105, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text("Seu trabalho, organizado.", 105, 27, { align: "center" });

  // Report title
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.text(`Relatório Mensal - ${month} ${year}`, 105, 45, { align: "center" });

  // User info
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Prestador: ${userName}`, 14, 60);
  doc.text(`Gerado em: ${formatDateLong(new Date().toISOString())}`, 14, 67);

  // Summary
  const paidServices = services.filter((s) => s.status === "paid");
  const pendingServices = services.filter((s) => s.status === "pending");
  const totalPaid = paidServices.reduce((sum, s) => sum + Number(s.value), 0);
  const totalPending = pendingServices.reduce((sum, s) => sum + Number(s.value), 0);

  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text("Resumo", 14, 82);
  
  doc.setFontSize(10);
  doc.setTextColor(80);
  doc.text(`Total de serviços: ${services.length}`, 14, 90);
  doc.text(`Serviços pagos: ${paidServices.length} (${formatCurrency(totalPaid)})`, 14, 97);
  doc.text(`Serviços pendentes: ${pendingServices.length} (${formatCurrency(totalPending)})`, 14, 104);

  // Table
  const tableData = services.map((service) => [
    service.client_name,
    service.service_type,
    formatDateLong(service.service_date),
    formatCurrency(Number(service.value)),
    statusLabels[service.status] || service.status,
  ]);

  autoTable(doc, {
    startY: 115,
    head: [["Cliente", "Serviço", "Data", "Valor", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 50 },
      2: { cellWidth: 35 },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 25, halign: "center" },
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount} - Gerado pelo ${APP_NAME.toUpperCase()}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    );
  }

  // Download
  const fileName = `${APP_NAME.toUpperCase()}_Relatorio_${month}_${year}.pdf`;
  doc.save(fileName);
}
