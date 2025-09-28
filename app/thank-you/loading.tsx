import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Header } from "@/components/header"

export default function ThankYouLoading() {
  return (
    <div dir="rtl" className="flex min-h-screen flex-col items-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Header />
      <Card className="w-full max-w-2xl mt-8">
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>טוען פרטי התור...</p>
        </CardContent>
      </Card>
    </div>
  )
}
