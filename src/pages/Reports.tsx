import React from 'react';
import { useData } from '../context/DataContext';
import { Card, Button } from '../components/common';
import { DownloadIcon, EquipmentIcon, FinancialIcon } from '../components/Icons';
import { setWorksheetColumns, parseLocalDate } from '../utils';

export const Reports: React.FC = () => {
    const { equipment, clients, financial } = useData();

    const handleDownloadEquipmentReport = () => {
        const XLSX = (window as any).XLSX;
        const dataToExport = equipment.map(eq => {
            const client = clients.find(c => c.id === eq.clientId);
            return {
                "Equipamento": eq.name,
                "Número de Série": eq.serialNumber,
                "Cliente": client?.name || 'N/A',
                "Status": eq.status,
                "Data de Vencimento": parseLocalDate(eq.expiryDate),
                "Última Inspeção": eq.lastInspectionDate ? parseLocalDate(eq.lastInspectionDate) : 'N/A',
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        setWorksheetColumns(worksheet, dataToExport);
        
        // Apply date format to columns E and F
        dataToExport.forEach((_row, index) => {
            const rowIndex = index + 2;
            const expiryCell = `E${rowIndex}`;
            const lastInspectionCell = `F${rowIndex}`;
            if(worksheet[expiryCell]) {
                 worksheet[expiryCell].t = 'd';
                 worksheet[expiryCell].z = 'dd/mm/yyyy';
            }
             if(worksheet[lastInspectionCell] && worksheet[lastInspectionCell].v !== 'N/A') {
                 worksheet[lastInspectionCell].t = 'd';
                 worksheet[lastInspectionCell].z = 'dd/mm/yyyy';
            }
        });


        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Equipamentos");
        XLSX.writeFile(workbook, "Relatorio_Equipamentos_InspecPro.xlsx");
    };

    const handleDownloadFinancialReport = () => {
        const XLSX = (window as any).XLSX;
        const dataToExport = financial.map(rec => {
            const client = clients.find(c => c.id === rec.clientId);
            return {
                "Cliente": client?.name || 'N/A',
                "Descrição": rec.description,
                "Valor (R$)": rec.value,
                "Status": rec.status,
                "Emissão": parseLocalDate(rec.issueDate),
                "Vencimento": parseLocalDate(rec.dueDate),
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport, { cellDates: true });

        worksheet['!cols'] = [
            { wch: 30 }, { wch: 40 }, { wch: 15 },
            { wch: 15 }, { wch: 15 }, { wch: 15 },
        ];
        
        dataToExport.forEach((_row, index) => {
            const rowIndex = index + 2;
            const valueCell = `C${rowIndex}`;
            const issueDateCell = `E${rowIndex}`;
            const dueDateCell = `F${rowIndex}`;

            if(worksheet[valueCell]) {
                worksheet[valueCell].t = 'n';
                worksheet[valueCell].z = 'R$ #,##0.00';
            }
            if(worksheet[issueDateCell]) {
                 worksheet[issueDateCell].t = 'd';
                 worksheet[issueDateCell].z = 'dd/mm/yyyy';
            }
            if(worksheet[dueDateCell]) {
                 worksheet[dueDateCell].t = 'd';
                 worksheet[dueDateCell].z = 'dd/mm/yyyy';
            }
        });
        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Financeiro");
        XLSX.writeFile(workbook, "Relatorio_Financeiro_InspecPro.xlsx");
    };


    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold text-text-primary px-4 md:px-0">Central de Relatórios</h1>
            
            <Card title="Relatório de Equipamentos" actions={<EquipmentIcon className="w-6 h-6 text-accent"/>}>
                <p className="text-text-secondary mb-4">Gere uma planilha completa de todos os equipamentos cadastrados no sistema.</p>
                <div className="flex justify-end">
                    <Button onClick={handleDownloadEquipmentReport}>
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Baixar .xlsx
                    </Button>
                </div>
            </Card>

            <Card title="Relatório Financeiro" actions={<FinancialIcon className="w-6 h-6 text-accent"/>}>
                <p className="text-text-secondary mb-4">Exporte todos os registros financeiros, incluindo status de pagamento e valores.</p>
                <div className="flex justify-end">
                    <Button onClick={handleDownloadFinancialReport}>
                        <DownloadIcon className="w-5 h-5 mr-2" />
                        Baixar .xlsx
                    </Button>
                </div>
            </Card>
        </div>
    );
};