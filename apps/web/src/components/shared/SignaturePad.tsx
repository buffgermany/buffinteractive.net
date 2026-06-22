"use client";

import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "../ui/primitives";

interface SignaturePadProps {
  onSave: (base64: string | null) => void;
  label?: string;
}

export function SignaturePad({ onSave, label = "Ihre Unterschrift" }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
    onSave(null);
  };

  const handleEnd = () => {
    if (sigCanvas.current?.isEmpty()) {
      setIsEmpty(true);
      onSave(null);
    } else {
      setIsEmpty(false);
      // Generate standard PNG base64
      onSave(sigCanvas.current?.getTrimmedCanvas().toDataURL("image/png") || null);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-2xl">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleClear}
          type="button"
          disabled={isEmpty}
        >
          Löschen
        </Button>
      </div>
      <div className="border-2 border-neutral-600 rounded-lg bg-white overflow-hidden shadow-inner">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: "signature-canvas w-full h-48 touch-none", // touch-none prevents scrolling while signing
          }}
          onEnd={handleEnd}
          backgroundColor="white"
          penColor="black"
        />
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Bitte unterschreiben Sie innerhalb des Feldes.
      </p>
    </div>
  );
}
