"use client";

import React, { useRef, useState, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "../ui/primitives";

interface SignaturePadProps {
  onSave: (base64: string | null) => void;
  label?: string;
}

export function SignaturePad({ onSave, label = "Ihre Unterschrift" }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isEmpty, setIsEmpty] = useState(true);

  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Set internal resolution of the canvas to match its displayed offset size.
  // This is required to prevent coordinate offset and blurry drawings.
  useEffect(() => {
    const canvas = sigCanvas.current?.getCanvas();
    if (canvas) {
      const resizeCanvas = () => {
        if (canvas.offsetWidth > 0 && canvas.offsetHeight > 0) {
          if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
            // Save the current strokes data before resizing
            const strokes = sigCanvas.current?.toData();
            const wasEmpty = sigCanvas.current?.isEmpty() ?? true;

            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            sigCanvas.current?.clear();

            // Restore the strokes if there were any
            if (strokes && strokes.length > 0 && !wasEmpty) {
              sigCanvas.current?.fromData(strokes);
              setIsEmpty(false);
              // Recalculate signature image URL with new size
              onSaveRef.current(sigCanvas.current?.getCanvas().toDataURL("image/png") || null);
            } else {
              setIsEmpty(true);
              if (!wasEmpty) {
                onSaveRef.current(null);
              }
            }
          }
        }
      };

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      return () => window.removeEventListener("resize", resizeCanvas);
    }
  }, []); // Run only once on mount to prevent infinite resize loops

  const handleClear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
    onSaveRef.current(null);
  };

  const handleEnd = () => {
    if (sigCanvas.current?.isEmpty()) {
      setIsEmpty(true);
      onSaveRef.current(null);
    } else {
      setIsEmpty(false);
      // Generate standard PNG base64, avoiding getTrimmedCanvas() which can fail in production
      onSaveRef.current(sigCanvas.current?.getCanvas().toDataURL("image/png") || null);
    }
  };

  // Blur any active text input to dismiss the keyboard on mobile/tablets
  const handlePointerDown = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
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
      <div
        className="relative border-2 border-neutral-600 rounded-lg bg-white overflow-hidden shadow-inner h-48"
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: "signature-canvas w-full h-full touch-none", // touch-none prevents scrolling while signing
          }}
          onEnd={handleEnd}
          backgroundColor="white"
          penColor="black"
        />
        {isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none opacity-25">
            <span className="text-4xl font-light text-neutral-500">X</span>
            <span className="text-[10px] uppercase tracking-widest mt-1 text-neutral-500 font-bold">Hier unterschreiben</span>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Bitte unterschreib innerhalb des Feldes.
      </p>
    </div>
  );
}

