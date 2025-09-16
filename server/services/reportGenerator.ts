import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import fs from 'fs-extra';
import path from 'path';

export interface ReportData {
  businessName: string;
  location: string;
  dateRange: {
    from: string;
    to: string;
  };
  metrics: {
    totalReviews: number;
    averageRating: number;
    reviewTrend: number;
    responseRate: number;
    avgResponseTime: number;
    positivePercentage: number;
    negativePercentage: number;
    neutralPercentage: number;
  };
  reviewSources: Array<{
    source: string;
    reviewCount: number;
    averageRating: number;
  }>;
  monthlyData: Array<{
    month: string;
    reviews: number;
    rating: number;
  }>;
  competitorAnalysis?: {
    competitors: Array<{
      name: string;
      averageRating: number;
      totalReviews: number;
    }>;
  };
}

export class ReportGeneratorService {
  private static reportsDir = path.join(process.cwd(), 'generated_reports');

  static async ensureReportsDirectory() {
    await fs.ensureDir(this.reportsDir);
  }

  static async generatePDFReport(data: ReportData, exportId: string): Promise<string> {
    await this.ensureReportsDirectory();
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let yPos = 30;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Rendimiento Digital', pageWidth / 2, yPos, { align: 'center' });
    yPos += 20;

    // Business info
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text(`Negocio: ${data.businessName}`, margin, yPos);
    yPos += 10;
    doc.text(`Ubicación: ${data.location}`, margin, yPos);
    yPos += 10;
    doc.text(`Período: ${data.dateRange.from} - ${data.dateRange.to}`, margin, yPos);
    yPos += 20;

    // Metrics section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Métricas Principales', margin, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const metrics = [
      ['Total de Reseñas:', data.metrics.totalReviews.toString()],
      ['Calificación Promedio:', data.metrics.averageRating.toFixed(1)],
      ['Tendencia de Reseñas:', `${data.metrics.reviewTrend > 0 ? '+' : ''}${data.metrics.reviewTrend}%`],
      ['Tasa de Respuesta:', `${data.metrics.responseRate}%`],
      ['Tiempo Promedio de Respuesta:', `${data.metrics.avgResponseTime} horas`],
      ['Reseñas Positivas:', `${data.metrics.positivePercentage}%`],
      ['Reseñas Negativas:', `${data.metrics.negativePercentage}%`],
      ['Reseñas Neutrales:', `${data.metrics.neutralPercentage}%`]
    ];

    metrics.forEach(([label, value]) => {
      doc.text(label, margin, yPos);
      doc.text(value, margin + 80, yPos);
      yPos += 8;
    });

    yPos += 15;

    // Review Sources section
    if (data.reviewSources.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Fuentes de Reseñas', margin, yPos);
      yPos += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      data.reviewSources.forEach(source => {
        doc.text(`${source.source}: ${source.reviewCount} reseñas (${source.averageRating.toFixed(1)}★)`, margin, yPos);
        yPos += 8;
      });
      yPos += 15;
    }

    // Monthly Data section
    if (data.monthlyData.length > 0) {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Tendencia Mensual', margin, yPos);
      yPos += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      data.monthlyData.forEach(month => {
        doc.text(`${month.month}: ${month.reviews} reseñas (${month.rating.toFixed(1)}★)`, margin, yPos);
        yPos += 8;
      });
      yPos += 15;
    }

    // Competitor Analysis section
    if (data.competitorAnalysis && data.competitorAnalysis.competitors.length > 0) {
      // Add new page if needed
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }

      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Análisis de Competencia', margin, yPos);
      yPos += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      data.competitorAnalysis.competitors.forEach(competitor => {
        doc.text(`${competitor.name}: ${competitor.totalReviews} reseñas (${competitor.averageRating.toFixed(1)}★)`, margin, yPos);
        yPos += 8;
      });
    }

    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(`Generado por Altevia el ${new Date().toLocaleDateString('es-MX')}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });

    const fileName = `reporte_${exportId}.pdf`;
    const filePath = path.join(this.reportsDir, fileName);
    
    // Save the PDF
    const pdfBuffer = doc.output('arraybuffer');
    await fs.writeFile(filePath, Buffer.from(pdfBuffer));
    
    return filePath;
  }

  static async generateExcelReport(data: ReportData, exportId: string): Promise<string> {
    await this.ensureReportsDirectory();

    const workbook = XLSX.utils.book_new();

    // Main metrics sheet
    const metricsData = [
      ['Reporte de Rendimiento Digital'],
      [''],
      ['Información del Negocio'],
      ['Negocio', data.businessName],
      ['Ubicación', data.location],
      ['Período', `${data.dateRange.from} - ${data.dateRange.to}`],
      [''],
      ['Métricas Principales'],
      ['Total de Reseñas', data.metrics.totalReviews],
      ['Calificación Promedio', data.metrics.averageRating],
      ['Tendencia de Reseñas (%)', data.metrics.reviewTrend],
      ['Tasa de Respuesta (%)', data.metrics.responseRate],
      ['Tiempo Promedio de Respuesta (horas)', data.metrics.avgResponseTime],
      ['Reseñas Positivas (%)', data.metrics.positivePercentage],
      ['Reseñas Negativas (%)', data.metrics.negativePercentage],
      ['Reseñas Neutrales (%)', data.metrics.neutralPercentage]
    ];

    const metricsSheet = XLSX.utils.aoa_to_sheet(metricsData);
    XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Métricas');

    // Review sources sheet
    if (data.reviewSources.length > 0) {
      const sourcesData = [
        ['Fuente', 'Número de Reseñas', 'Calificación Promedio'],
        ...data.reviewSources.map(source => [
          source.source,
          source.reviewCount,
          source.averageRating
        ])
      ];

      const sourcesSheet = XLSX.utils.aoa_to_sheet(sourcesData);
      XLSX.utils.book_append_sheet(workbook, sourcesSheet, 'Fuentes');
    }

    // Monthly data sheet
    if (data.monthlyData.length > 0) {
      const monthlyData = [
        ['Mes', 'Número de Reseñas', 'Calificación Promedio'],
        ...data.monthlyData.map(month => [
          month.month,
          month.reviews,
          month.rating
        ])
      ];

      const monthlySheet = XLSX.utils.aoa_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Tendencia Mensual');
    }

    // Competitor analysis sheet
    if (data.competitorAnalysis && data.competitorAnalysis.competitors.length > 0) {
      const competitorData = [
        ['Competidor', 'Total de Reseñas', 'Calificación Promedio'],
        ...data.competitorAnalysis.competitors.map(competitor => [
          competitor.name,
          competitor.totalReviews,
          competitor.averageRating
        ])
      ];

      const competitorSheet = XLSX.utils.aoa_to_sheet(competitorData);
      XLSX.utils.book_append_sheet(workbook, competitorSheet, 'Competencia');
    }

    const fileName = `reporte_${exportId}.xlsx`;
    const filePath = path.join(this.reportsDir, fileName);
    
    XLSX.writeFile(workbook, filePath);
    
    return filePath;
  }

  static async generateReport(format: 'pdf' | 'excel', data: ReportData, exportId: string): Promise<string> {
    if (format === 'pdf') {
      return this.generatePDFReport(data, exportId);
    } else {
      return this.generateExcelReport(data, exportId);
    }
  }

  static async deleteReport(filePath: string): Promise<void> {
    try {
      await fs.remove(filePath);
    } catch (error) {
      console.error('Error deleting report file:', error);
    }
  }

  static getReportsDirectory(): string {
    return this.reportsDir;
  }
}