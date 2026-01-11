"use client";

import { useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteComponent } from "@/utils/actions";
import { ComponentEditDialog } from "./component-edit-dialog";

interface ComponentTableProps {
  components: any[];
  filters: any[];
  componentFilters: any[]; // relations
}

export function ComponentTable({
  components,
  filters,
  componentFilters,
}: ComponentTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this component?")) {
      startTransition(async () => {
        await deleteComponent(id);
      });
    }
  };

  return (
    <div className="rounded-md border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-muted/50">
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-[150px]">Filters</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.map((component) => {
            // Find stats or related info if needed
            const myFilters = componentFilters
              .filter((cf) => cf.component_id === component.id)
              .map((cf) => cf.filter_id);

            return (
              <TableRow
                key={component.id}
                className="border-border hover:bg-muted/50"
              >
                <TableCell className="font-medium">{component.id}</TableCell>
                <TableCell>{component.name}</TableCell>
                <TableCell className="text-muted-foreground truncate max-w-[200px]">
                  {component.description}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {myFilters.length > 0 ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                        {myFilters.length} tags
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <ComponentEditDialog
                      component={component}
                      filters={filters}
                      currentFilters={myFilters}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(component.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
