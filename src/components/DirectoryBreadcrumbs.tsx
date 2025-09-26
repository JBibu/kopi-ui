import React from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { useNavigate, useLocation, Location } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Info } from "lucide-react";

interface BreadcrumbState {
  label: string;
  oid?: string;
  prevState?: BreadcrumbState;
}

interface LocationWithState extends Location {
  state?: BreadcrumbState;
}

export function DirectoryBreadcrumbs(): JSX.Element {
  const location = useLocation() as LocationWithState;
  const navigate = useNavigate();

  const breadcrumbs: BreadcrumbState[] = [];
  for (let state = location.state; state; state = state.prevState) {
    breadcrumbs.unshift(state);
  }

  return (
    <TooltipProvider>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((state, i) => {
            const index = breadcrumbs.length - i - 1; // revert index
            const isLast = index === 0;
            return (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="flex items-center gap-1">
                      {state.label}
                      {state.oid && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 cursor-pointer" />
                          </TooltipTrigger>
                          <TooltipContent className="wide-tooltip">
                            <p>OID: {state.oid}</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      onClick={() => navigate(-index)}
                      className="cursor-pointer hover:underline"
                    >
                      {state.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </TooltipProvider>
  );
}