import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Download, 
  FileText, 
  TableIcon,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Eye
} from "lucide-react";
import type { Location, ReportExport } from "@shared/schema";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { DateRange } from "react-day-picker";

const exportReportSchema = z.object({
  reportType: z.enum(["reputation", "content_performance", "competitor_analysis"]),
  locationIds: z.array(z.string()).min(1, "Selecciona al menos una ubicación"),
  format: z.enum(["pdf", "excel"]).default("pdf"),
  dateRange: z.object({
    startDate: z.string().date(),
    endDate: z.string().date()
  }),
  filters: z.record(z.any()).optional()
});

type ReportExportForm = z.infer<typeof exportReportSchema>;

export default function ReportExporter() {
  const { toast } = useToast();
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const form = useForm<ReportExportForm>({
    resolver: zodResolver(exportReportSchema),
    defaultValues: {
      reportType: "reputation",
      locationIds: [],
      format: "pdf",
      dateRange: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      filters: {}
    }
  });

  // Get locations
  const { data: locations = [] } = useQuery<Location[]>({
    queryKey: ['/api/businesses/locations'],
  });

  // Get export history
  const { data: exports = [], isLoading: exportsLoading, refetch } = useQuery<ReportExport[]>({
    queryKey: ['/api/reports/exports'],
  });

  // Export report mutation
  const exportReport = useMutation({
    mutationFn: async (data: ReportExportForm) => {
      const response = await apiRequest('/api/reports/export', {
        method: 'POST',
        data
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Reporte en Proceso",
        description: "Tu reporte está siendo generado. Te notificaremos cuando esté listo.",
      });
      form.reset();
      setSelectedLocations([]);
      setDateRange(undefined);
      refetch();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo generar el reporte. Intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  // Download report mutation
  const downloadReport = useMutation({
    mutationFn: async (exportId: string) => {
      const response = await fetch(`/api/reports/download/${exportId}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error('Failed to download report');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte_${exportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return blob;
    },
    onSuccess: () => {
      toast({
        title: "Descarga Completada",
        description: "El reporte se descargó correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error de Descarga",
        description: "No se pudo descargar el reporte.",
        variant: "destructive",
      });
    },
  });

  const handleLocationChange = (locationId: string, checked: boolean) => {
    if (checked) {
      setSelectedLocations(prev => [...prev, locationId]);
    } else {
      setSelectedLocations(prev => prev.filter(id => id !== locationId));
    }
  };

  const handleSubmit = (data: ReportExportForm) => {
    const exportData = {
      ...data,
      locationIds: selectedLocations,
      dateRange: {
        startDate: dateRange?.from?.toISOString().split('T')[0] || data.dateRange.startDate,
        endDate: dateRange?.to?.toISOString().split('T')[0] || data.dateRange.endDate
      }
    };
    
    exportReport.mutate(exportData);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      processing: { label: 'Procesando', variant: 'secondary' as const, icon: Loader2 },
      completed: { label: 'Completado', variant: 'default' as const, icon: CheckCircle2 },
      failed: { label: 'Error', variant: 'destructive' as const, icon: AlertCircle },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { 
      label: status, 
      variant: 'outline' as const, 
      icon: Clock 
    };
    
    return (
      <Badge variant={statusInfo.variant} className="flex items-center gap-1">
        <statusInfo.icon className="h-3 w-3" />
        {statusInfo.label}
      </Badge>
    );
  };

  const getReportTypeLabel = (type: string) => {
    const typeMap = {
      reputation: 'Análisis de Reputación',
      content_performance: 'Rendimiento de Contenido',
      competitor_analysis: 'Análisis de Competencia'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6" data-testid="report-exporter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="title-reports">Exportar Reportes</h1>
          <p className="text-muted-foreground">
            Genera reportes detallados en PDF o Excel con métricas de tu negocio
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Form */}
        <Card data-testid="export-form">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generar Nuevo Reporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label>Tipo de Reporte</Label>
                <Select 
                  value={form.watch("reportType")} 
                  onValueChange={(value) => form.setValue("reportType", value as any)}
                >
                  <SelectTrigger data-testid="select-report-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reputation">Análisis de Reputación</SelectItem>
                    <SelectItem value="content_performance">Rendimiento de Contenido</SelectItem>
                    <SelectItem value="competitor_analysis">Análisis de Competencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ubicaciones</Label>
                <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto border rounded-md p-3">
                  {locations.map((location) => (
                    <div key={location.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={location.id}
                        checked={selectedLocations.includes(location.id)}
                        onCheckedChange={(checked) => handleLocationChange(location.id, !!checked)}
                        data-testid={`checkbox-location-${location.id}`}
                      />
                      <Label htmlFor={location.id} className="text-sm flex-1">
                        {location.name} - {location.city}, {location.state}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedLocations.length === 0 && (
                  <p className="text-sm text-red-600">Selecciona al menos una ubicación</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Formato de Reporte</Label>
                <Select 
                  value={form.watch("format")} 
                  onValueChange={(value) => form.setValue("format", value as any)}
                >
                  <SelectTrigger data-testid="select-format">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        PDF
                      </div>
                    </SelectItem>
                    <SelectItem value="excel">
                      <div className="flex items-center gap-2">
                        <TableIcon className="h-4 w-4" />
                        Excel
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rango de Fechas</Label>
                <DatePickerWithRange
                  date={dateRange}
                  onDateChange={setDateRange}
                  placeholder="Selecciona un rango de fechas"
                  data-testid="date-picker-range"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={exportReport.isPending || selectedLocations.length === 0}
                data-testid="button-generate-report"
              >
                {exportReport.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando Reporte...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generar Reporte
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Export History */}
        <Card data-testid="export-history">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Historial de Reportes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {exportsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : exports.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-semibold">No hay reportes generados</h3>
                <p className="text-muted-foreground">
                  Genera tu primer reporte para ver el historial
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {exports.map((exportItem) => (
                  <div key={exportItem.id} className="border rounded-lg p-4 space-y-3" data-testid={`export-${exportItem.id}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusBadge(exportItem.status)}
                          <Badge variant="outline" className="capitalize">
                            {exportItem.format.toUpperCase()}
                          </Badge>
                        </div>
                        <h4 className="font-semibold" data-testid={`export-type-${exportItem.id}`}>
                          {getReportTypeLabel(exportItem.reportType)}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {(() => {
                            const dateRange = JSON.parse(exportItem.dateRange);
                            return `${new Date(dateRange.startDate).toLocaleDateString('es-MX')} - ${new Date(dateRange.endDate).toLocaleDateString('es-MX')}`;
                          })()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {exportItem.status === 'completed' && exportItem.fileUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadReport.mutate(exportItem.id)}
                            disabled={downloadReport.isPending}
                            data-testid={`button-download-${exportItem.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid={`button-view-${exportItem.id}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>Generado: {formatDate(exportItem.createdAt)}</span>
                      </div>
                      {exportItem.fileSize && (
                        <span>{formatFileSize(exportItem.fileSize)}</span>
                      )}
                    </div>

                    {exportItem.status === 'failed' && exportItem.errorMessage && (
                      <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                        <div className="flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          <span>Error: {exportItem.errorMessage}</span>
                        </div>
                      </div>
                    )}

                    {exportItem.expiresAt && new Date(exportItem.expiresAt) > new Date() && (
                      <div className="text-xs text-muted-foreground">
                        Disponible hasta: {formatDate(exportItem.expiresAt)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}