"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function ToastDemo() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        onClick={() =>
          toast.success("Generation complete", {
            description: "1 credit spent",
          })
        }
      >
        Success toast
      </Button>
      <Button
        variant="outline"
        onClick={() => toast.error("Generation failed — credit refunded")}
      >
        Error toast
      </Button>
    </div>
  );
}
