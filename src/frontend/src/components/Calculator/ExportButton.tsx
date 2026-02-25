import React, { useState } from 'react';
import { Download, FileText, Table2, Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { exportCSV } from '@/utils/exportCSV';
import { exportPDF } from '@/utils/exportPDF';
import type { AllocationCategory } from '@/hooks/useTokenomicsCalculator';
import { toast } from 'sonner';

interface VestingDataPoint {
  month: number;
  date: string;
  totalUnlocked: number;
  percentUnlocked: number;
}

interface ExportButtonProps {
  sessionName: string;
  totalSupply: number;
  categories: AllocationCategory[];
  vestingData: VestingDataPoint[];
  containerRef: React.RefObject<HTMLElement | null>;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  sessionName,
  totalSupply,
  categories,
  vestingData,
  containerRef,
}) => {
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportCSV = () => {
    try {
      exportCSV({ sessionName, totalSupply, categories, vestingData });
      toast.success('CSV exported successfully');
    } catch (err) {
      console.error('CSV export failed:', err);
      toast.error('Failed to export CSV');
    }
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await exportPDF({ sessionName, totalSupply, categories, vestingData, containerRef });
      toast.success('PDF exported successfully');
    } catch (err) {
      console.error('PDF export failed:', err);
      toast.error('Failed to export PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="border-gold/40 text-gold hover:bg-gold/10 hover:text-gold hover:border-gold gap-2 font-semibold"
          disabled={isExportingPDF}
        >
          {isExportingPDF ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {isExportingPDF ? 'Generating…' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-navy-card border-navy-border text-foreground min-w-[180px]"
      >
        <DropdownMenuLabel className="text-foreground/50 text-xs uppercase tracking-wider">
          Export: {sessionName}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-navy-border" />
        <DropdownMenuItem
          onClick={handleExportCSV}
          className="cursor-pointer hover:bg-teal/10 focus:bg-teal/10 gap-2"
        >
          <Table2 className="w-4 h-4 text-teal" />
          <div>
            <div className="font-medium text-sm">Export as CSV</div>
            <div className="text-xs text-foreground/40">Formatted spreadsheet</div>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleExportPDF}
          disabled={isExportingPDF}
          className="cursor-pointer hover:bg-gold/10 focus:bg-gold/10 gap-2"
        >
          <FileText className="w-4 h-4 text-gold" />
          <div>
            <div className="font-medium text-sm">Export as PDF</div>
            <div className="text-xs text-foreground/40">Visual charts &amp; tables</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;
