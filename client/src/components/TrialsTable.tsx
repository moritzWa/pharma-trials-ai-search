import { useState } from 'react';
import { ArrowUpDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Button } from './ui/button';

interface Trial {
  protocolSection: {
    identificationModule: {
      nctId: string;
      briefTitle?: string;
      organization?: {
        fullName?: string;
      };
    };
    statusModule?: {
      overallStatus?: string;
    };
    sponsorCollaboratorsModule?: {
      leadSponsor?: {
        name?: string;
      };
    };
    conditionsModule?: {
      conditions?: string[];
    };
    designModule?: {
      phases?: string[];
      enrollmentInfo?: {
        count?: number;
      };
    };
  };
}

interface TrialsTableProps {
  trials: Trial[];
  totalResults: number;
}

type SortField = 'title' | 'status' | 'phase' | 'condition' | 'sponsor';
type SortOrder = 'asc' | 'desc';

export function TrialsTable({ trials, totalResults }: TrialsTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedTrials = [...trials].sort((a, b) => {
    if (!sortField) return 0;

    let aValue = '';
    let bValue = '';

    switch (sortField) {
      case 'title':
        aValue = a.protocolSection.identificationModule.briefTitle || '';
        bValue = b.protocolSection.identificationModule.briefTitle || '';
        break;
      case 'status':
        aValue = a.protocolSection.statusModule?.overallStatus || '';
        bValue = b.protocolSection.statusModule?.overallStatus || '';
        break;
      case 'phase':
        aValue = a.protocolSection.designModule?.phases?.[0] || '';
        bValue = b.protocolSection.designModule?.phases?.[0] || '';
        break;
      case 'condition':
        aValue = a.protocolSection.conditionsModule?.conditions?.[0] || '';
        bValue = b.protocolSection.conditionsModule?.conditions?.[0] || '';
        break;
      case 'sponsor':
        aValue = a.protocolSection.sponsorCollaboratorsModule?.leadSponsor?.name || '';
        bValue = b.protocolSection.sponsorCollaboratorsModule?.leadSponsor?.name || '';
        break;
    }

    const comparison = aValue.localeCompare(bValue);
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="w-[120px]">NCT ID</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('title')}
                >
                  Title
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('condition')}
                >
                  Condition
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('status')}
                >
                  Status
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('phase')}
                >
                  Phase
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8"
                  onClick={() => handleSort('sponsor')}
                >
                  Sponsor
                  <ArrowUpDown className="ml-2 h-3 w-3" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTrials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              sortedTrials.map((trial) => {
                const ps = trial.protocolSection;
                return (
                  <TableRow key={ps.identificationModule.nctId}>
                    <TableCell className="font-mono text-xs">
                      <a
                        href={`https://clinicaltrials.gov/study/${ps.identificationModule.nctId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {ps.identificationModule.nctId}
                      </a>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="line-clamp-2" title={ps.identificationModule.briefTitle}>
                        {ps.identificationModule.briefTitle || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="line-clamp-2">
                        {ps.conditionsModule?.conditions?.slice(0, 3).join(', ') || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-muted">
                        {ps.statusModule?.overallStatus || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {ps.designModule?.phases?.join(', ') || 'N/A'}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {ps.sponsorCollaboratorsModule?.leadSponsor?.name || 'N/A'}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        Showing {sortedTrials.length} of {totalResults} results
      </div>
    </div>
  );
}
