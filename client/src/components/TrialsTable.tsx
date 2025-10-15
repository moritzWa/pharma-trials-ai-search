import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

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

type SortField = "title" | "status" | "phase" | "condition" | "sponsor";
type SortOrder = "asc" | "desc";

interface SortableHeaderProps {
  field: SortField;
  label: string;
  currentSortField: SortField | null;
  currentSortOrder: SortOrder;
  onSort: (field: SortField) => void;
  className?: string;
}

function SortableHeader({
  field,
  label,
  currentSortField,
  currentSortOrder,
  onSort,
  className = "",
}: SortableHeaderProps) {
  const isActive = currentSortField === field;

  return (
    <TableHead className={`p-0 ${className}`}>
      <button
        onClick={() => onSort(field)}
        className={`w-full h-full px-2 py-2 flex items-center gap-2 hover:bg-muted transition-colors ${
          isActive ? "bg-muted/50 font-semibold" : ""
        }`}
      >
        <span>{label}</span>
        {isActive ? (
          currentSortOrder === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-50" />
        )}
      </button>
    </TableHead>
  );
}

export function TrialsTable({ trials, totalResults }: TrialsTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortedTrials = [...trials].sort((a, b) => {
    if (!sortField) return 0;

    let aValue = "";
    let bValue = "";

    switch (sortField) {
      case "title":
        aValue = a.protocolSection.identificationModule.briefTitle || "";
        bValue = b.protocolSection.identificationModule.briefTitle || "";
        break;
      case "status":
        aValue = a.protocolSection.statusModule?.overallStatus || "";
        bValue = b.protocolSection.statusModule?.overallStatus || "";
        break;
      case "phase":
        aValue = a.protocolSection.designModule?.phases?.[0] || "";
        bValue = b.protocolSection.designModule?.phases?.[0] || "";
        break;
      case "condition":
        aValue = a.protocolSection.conditionsModule?.conditions?.[0] || "";
        bValue = b.protocolSection.conditionsModule?.conditions?.[0] || "";
        break;
      case "sponsor":
        aValue =
          a.protocolSection.sponsorCollaboratorsModule?.leadSponsor?.name || "";
        bValue =
          b.protocolSection.sponsorCollaboratorsModule?.leadSponsor?.name || "";
        break;
    }

    const comparison = aValue.localeCompare(bValue);
    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="border">
        <Table>
          <TableHeader className="bg-primary-foreground">
            <TableRow>
              <TableHead className="w-[120px]">NCT ID</TableHead>
              <SortableHeader
                field="title"
                label="Title"
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
                className="w-[400px]"
              />
              <SortableHeader
                field="condition"
                label="Condition"
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
                className="w-[250px]"
              />
              <SortableHeader
                field="status"
                label="Status"
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
              <SortableHeader
                field="phase"
                label="Phase"
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
              <SortableHeader
                field="sponsor"
                label="Sponsor"
                currentSortField={sortField}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
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
                    <TableCell>
                      <div className="whitespace-normal break-words">
                        {ps.identificationModule.briefTitle || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="whitespace-normal break-words">
                        {ps.conditionsModule?.conditions
                          ?.slice(0, 3)
                          .join(", ") || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-muted">
                        {ps.statusModule?.overallStatus || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {ps.designModule?.phases?.join(", ") || "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="whitespace-normal break-words">
                        {ps.sponsorCollaboratorsModule?.leadSponsor?.name ||
                          "N/A"}
                      </div>
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
