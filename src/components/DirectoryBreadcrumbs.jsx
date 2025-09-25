import React from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "./ui/breadcrumb";
import { useNavigate, useLocation } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

export function DirectoryBreadcrumbs() {
  const location = useLocation();
  const navigate = useNavigate();

  const breadcrumbs = [];
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
                            <FontAwesomeIcon icon={faInfoCircle} className="cursor-pointer" />
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
