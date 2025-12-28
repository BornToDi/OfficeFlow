import { Briefcase } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Briefcase className="h-8 w-8 text-orange-600" />
      
      <div className="flex flex-col leading-tight">
        <span className="text-2xl font-bold tracking-tight text-orange-600">
          Convey & Flow
        </span>
        <span className="text-xs text-muted-foreground">
          powered by <span className="font-semibold text-orange-600">Networld Technology LTD</span>
        </span>
      </div>
    </div>
  );
}
