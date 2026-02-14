import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Mail, ShieldCheck, ArrowLeft, Send, CheckCircle2 } from "lucide-react"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const navigate = useNavigate()
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // Simulating API call for reset link
        try {
            // In a real app, you would fetch `${API_URL}/api/auth/forgot-password`
            await new Promise(resolve => setTimeout(resolve, 1500))

            setIsSubmitted(true)
            toast({
                title: "Lien envoyé",
                description: "Si cet email existe, vous recevrez un lien de réinitialisation.",
            })
        } catch (error) {
            toast({
                title: "Erreur",
                description: "Une erreur est survenue. Veuillez réessayer.",
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
                <div className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700 text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-100 text-green-600 dark:bg-green-900/30">
                        <CheckCircle2 size={40} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Vérifiez vos emails</h1>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Un lien de réinitialisation a été envoyé à <span className="font-bold text-blue-600">{email}</span>.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-8 w-full h-14 rounded-2xl font-bold"
                        onClick={() => navigate("/")}
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Retour à la connexion
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
            <div className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
                <div className="mb-10 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
                        <ShieldCheck size={32} />
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Mot de passe oublié</h1>
                    <p className="mt-3 text-gray-600 dark:text-gray-400">
                        Entrez votre adresse email pour recevoir un lien de réinitialisation.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-300">
                            Email Professionnel
                        </Label>
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" size={20} />
                            <Input
                                id="email"
                                type="email"
                                placeholder="nom@polytechnique.cm"
                                className="pl-11 py-6 border-gray-200 focus:ring-blue-500 dark:bg-gray-700/50 dark:border-gray-600 h-14"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-16 rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 disabled:opacity-70 dark:shadow-none"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Envoi en cours...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>Envoyer le lien</span>
                                <Send size={18} />
                            </div>
                        )}
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => navigate("/")}
                        className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors flex items-center justify-center w-full"
                    >
                        <ArrowLeft size={16} className="mr-2" />
                        Retour à la connexion
                    </button>
                </div>
            </div>
        </div>
    )
}

const Loader2 = ({ className, size }: { className?: string, size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size || 24}
        height={size || 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
)
