"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { processPayment, type PaymentMethod, type PaymentType } from "@/utils/payment-service"
import { createPayment } from "@/utils/payment-service"
import { updateBookingStatus } from "@/utils/session-service"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface PaymentFormProps {
  amount: number
  paymentType: PaymentType
  description: string
  userId: string
  bookingId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function PaymentForm({
  amount,
  paymentType,
  description,
  userId,
  bookingId,
  onSuccess,
  onCancel,
}: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit_card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Process payment through payment service
      const paymentResult = await processPayment({
        amount,
        paymentType,
        paymentMethod,
        description,
        metadata: bookingId ? { bookingId } : undefined,
      })

      if (!paymentResult.success) {
        throw new Error(paymentResult.message || "Payment failed")
      }

      // Record payment in database
      await createPayment({
        user_id: userId,
        booking_id: bookingId,
        amount,
        payment_type: paymentType,
        payment_method: paymentMethod,
        status: paymentResult.status,
        transaction_id: paymentResult.transactionId,
        receipt_url: paymentResult.receiptUrl,
        notes: description,
      })

      // If this is for a booking, update the booking status
      if (bookingId) {
        await updateBookingStatus(bookingId, "confirmed", "paid")
      }

      setSuccess(true)

      // Call onSuccess callback after a short delay
      setTimeout(() => {
        if (onSuccess) onSuccess()
      }, 1500)
    } catch (err: any) {
      setError(err.message || "An error occurred during payment processing")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-sand shadow-sm">
        <CardContent className="pt-6 pb-6 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-navy mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">Your payment of ${amount.toFixed(2)} has been processed successfully.</p>
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
        <CardTitle className="text-navy">Payment Details</CardTitle>
        <CardDescription>Complete your payment for {description}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div>
            <Label className="text-navy">Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              className="grid grid-cols-3 gap-2 mt-2"
            >
              <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-sand hover:border-primary transition-colors">
                <RadioGroupItem value="credit_card" id="credit_card" className="text-primary" />
                <Label htmlFor="credit_card" className="cursor-pointer flex-1">
                  Credit Card
                </Label>
              </div>
              <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-sand hover:border-primary transition-colors">
                <RadioGroupItem value="bank_transfer" id="bank_transfer" className="text-primary" />
                <Label htmlFor="bank_transfer" className="cursor-pointer flex-1">
                  Bank Transfer
                </Label>
              </div>
              <div className="flex items-center space-x-2 bg-white p-3 rounded-md border border-sand hover:border-primary transition-colors">
                <RadioGroupItem value="cash" id="cash" className="text-primary" />
                <Label htmlFor="cash" className="cursor-pointer flex-1">
                  Cash
                </Label>
              </div>
            </RadioGroup>
          </div>

          {paymentMethod === "credit_card" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="border-sand focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  className="border-sand focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/YY"
                    className="border-sand focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    className="border-sand focus:border-primary focus:ring-primary"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {paymentMethod === "bank_transfer" && (
            <div className="bg-sand-light p-4 rounded-md">
              <p className="text-sm font-medium mb-2">Bank Transfer Instructions</p>
              <p className="text-sm text-gray-600 mb-2">Please transfer the amount to the following account:</p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Bank:</span> WaveRowers Bank
                </p>
                <p>
                  <span className="font-medium">Account Name:</span> WaveRowers Club
                </p>
                <p>
                  <span className="font-medium">Account Number:</span> 1234567890
                </p>
                <p>
                  <span className="font-medium">Reference:</span> Your Name + Session Date
                </p>
              </div>
            </div>
          )}

          {paymentMethod === "cash" && (
            <div className="bg-sand-light p-4 rounded-md">
              <p className="text-sm font-medium mb-2">Cash Payment Instructions</p>
              <p className="text-sm text-gray-600">
                Please bring the exact amount in cash to the session. You will receive a receipt upon payment.
              </p>
            </div>
          )}

          <div className="bg-primary/10 p-4 rounded-md">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount:</span>
              <span className="font-bold text-primary">${amount.toFixed(2)}</span>
            </div>
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
          <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay $${amount.toFixed(2)}`
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

