"use client"

import { Gift, Copy, Check } from "lucide-react"
import { useState } from "react"

export function GiftCard() {
  const [copiedAccountNumber, setCopiedAccountNumber] = useState<string | null>(null)

  const bankAccounts = [
    {
      bank: "BCA",
      accountName: "Marina [Last Name]",
      accountNumber: "1234567890",
    },
    {
      bank: "Mandiri",
      accountName: "Juan [Last Name]",
      accountNumber: "0987654321",
    },
  ]

  const handleCopy = (accountNumber: string) => {
    navigator.clipboard.writeText(accountNumber)
    setCopiedAccountNumber(accountNumber)
    setTimeout(() => setCopiedAccountNumber(null), 2000)
  }

  return (
    <div className="flex justify-center w-full">
      <div className="bg-white/40 backdrop-blur-md rounded-2xl p-8 border border-white/60 shadow-lg max-w-md">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Gift className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-light text-primary text-center">Angpao & Hadiah</h3>
        </div>

        <p className="text-center text-sm text-foreground/70 mb-6 font-light">
          Jika Anda ingin mengirimkan hadiah atau angpao, berikut adalah nomor rekening kami:
        </p>

        <div className="space-y-4">
          {bankAccounts.map((account, index) => (
            <div
              key={index}
              className="bg-white/60 rounded-lg p-4 space-y-3 border border-white/40 hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">{account.bank}</p>
                  <p className="text-xs text-foreground/60">{account.accountName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-background/80 rounded px-3 py-2">
                <code className="text-sm font-mono text-primary flex-1">{account.accountNumber}</code>
                <button
                  onClick={() => handleCopy(account.accountNumber)}
                  className="p-1.5 hover:bg-primary/10 rounded transition-colors text-primary"
                  aria-label="Salin nomor rekening"
                >
                  {copiedAccountNumber === account.accountNumber ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-foreground/50 text-center mt-6 font-light">
          Terima kasih atas dukungan dan doa Anda
        </p>
      </div>
    </div>
  )
}
