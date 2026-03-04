'use client'

import { useRef, useState, useImperativeHandle, forwardRef } from 'react'

export interface CameraCaptureRef {
  open: () => void
}

interface CameraCaptureProps {
  onCapture: (base64: string) => void
}

export const CameraCapture = forwardRef<CameraCaptureRef, CameraCaptureProps>(
  function CameraCapture({ onCapture }, ref) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [preview, setPreview] = useState<string | null>(null)

    useImperativeHandle(ref, () => ({
      open() {
        inputRef.current?.click()
      },
    }))

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }

    function handleSend() {
      if (preview) {
        const base64 = preview.split(',')[1]
        onCapture(base64)
        setPreview(null)
        if (inputRef.current) inputRef.current.value = ''
      }
    }

    function handleCancel() {
      setPreview(null)
      if (inputRef.current) inputRef.current.value = ''
    }

    return (
      <>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleChange}
          className="hidden"
        />
        {preview && (
          <div className="fixed inset-0 z-50 flex flex-col bg-black">
            <div className="flex flex-1 items-center justify-center p-4">
              <img src={preview} alt="Preview" className="max-h-full max-w-full rounded-lg object-contain" />
            </div>
            <div className="flex justify-center gap-4 p-6">
              <button
                onClick={handleCancel}
                className="rounded-xl bg-julius-card px-6 py-3 font-medium text-julius-text"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                className="rounded-xl bg-julius-accent px-6 py-3 font-medium text-white"
              >
                Enviar
              </button>
            </div>
          </div>
        )}
      </>
    )
  }
)
