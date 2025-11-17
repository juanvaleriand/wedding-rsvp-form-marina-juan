"use client"

import { Gift, Copy, Check } from "lucide-react"
import { useState } from "react"

export function GiftCard() {
  const [copiedAccountNumber, setCopiedAccountNumber] = useState<string | null>(null)

  const bankAccounts = [
    {
      bank: "BCA",
      accountName: "Marina",
      accountNumber: "8310009955",
    },
    {
      bank: "BCA",
      accountName: "Juan",
      accountNumber: "6871825022",
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
          <h3 className="text-2xl font-light text-primary text-center">Gift</h3>
        </div>

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
      </div>
    </div>
  )
}
