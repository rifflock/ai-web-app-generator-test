"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { processPayment } from "@/utils/payment-service"
import { createPayment, createDonation } from "@/utils/payment-service"
import { Loader2, AlertCircle, Heart } from "lucide-react"

interface DonationFormProps {
  userId: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function DonationForm({ userId, onSuccess, onCancel }: DonationFormProps) {
  const [amount, setAmount] = useState<number>(50)
  const [customAmount, setCustomAmount] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)

  const predefinedAmounts = [25, 50, 100, 250]

  const handleAmountSelect = (value: number) => {
    setAmount(value)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCustomAmount(value)
    if (value) {
      const numValue = Number.parseFloat(value)
      if (!isNaN(numValue) && numValue > 0) {
        setAmount(numValue)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (amount <= 0) {
        throw new Error("Please enter a valid donation amount")
      }

      // Process payment through payment service
      const paymentResult = await processPayment({
        amount,
        paymentType: "donation",
        paymentMethod: "credit_card",
        description: "Donation to WaveRowers Club",
      })

      if (!paymentResult.success) {
        throw new Error(paymentResult.message || "Payment failed")
      }

      // Record payment in database
      const payment = await createPayment({
        user_id: userId,
        amount,
        payment_type: "donation",
        payment_method: "credit_card",
        status: paymentResult.status,
        transaction_id: paymentResult.transactionId,
        receipt_url: paymentResult.receiptUrl,
        notes: "Donation to WaveRowers Club",
      })

      // Record donation in database
      await createDonation({
        user_id: userId,
        payment_id: payment.id,
        amount,
        is_anonymous: isAnonymous,
        message: message || undefined,
      })

      setSuccess(true)

      // Call onSuccess callback after a short delay
      setTimeout(() => {
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err: any) {
      setError(err.message || "An error occurred during donation processing")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-sand shadow-sm">
        <CardContent className="pt-6 pb-6 text-center">
          <Heart className="h-16 w-16 text-coral mx-auto mb-4 fill-coral" />
          <h3 className="text-xl font-bold text-navy mb-2">Thank You for Your Donation!</h3>
          <p className="text-gray-600 mb-4">
            Your generous donation of ${amount.toFixed(2)} will help support our rowing club.
          </p>
          <Button onClick={onSuccess} className="bg-primary hover:bg-primary/90">
            Continue
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-sand shadow-sm">
      <CardHeader className="bg-sand-light border-b border-sand">
        <CardTitle className="text-navy">Make a Donation</CardTitle>
        <CardDescription>Support our rowing club with a donation</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-navy mb-2 block">Select Amount</Label>
            <div className="grid grid-cols-4 gap-2">
              {predefinedAmounts.map((value) => (
                <Button
                  key={value}
                  type="button"
                  variant={amount === value && !customAmount ? "default" : "outline"}
                  className={
                    amount === value && !customAmount
                      ? "bg-primary hover:bg-primary/90"
                      : "border-sand hover:border-primary"
                  }
                  onClick={() => handleAmountSelect(value)}
                >
                  ${value}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customAmount">Custom Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <Input
                id="customAmount"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className="border-sand focus:border-primary focus:ring-primary pl-8"
                placeholder="Enter custom amount"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="border-sand focus:border-primary focus:ring-primary"
              placeholder="Share why you're donating..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
            <Label htmlFor="anonymous">Make this donation anonymous</Label>
          </div>

          <div className="bg-sand-light p-4 rounded-md">
            <p className="text-sm text-gray-600">
              Your donation helps us maintain equipment, subsidize sessions for those in need, and grow our rowing
              community. Thank you for your support!
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-sand pt-4 flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel} className="border-sand" disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading || amount <= 0}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Donate $${amount.toFixed(2)}`
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

