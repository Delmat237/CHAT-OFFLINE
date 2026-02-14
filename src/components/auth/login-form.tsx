import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Loader2, Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react"
import { API_URL } from "@/lib/config"
import { cn } from "@/lib/utils"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.data.user))
        toast({
          title: "Connexion réussie",
          description: "Bienvenue dans School Chat!",
        })
        navigate("/chat")
      } else {
        toast({
          title: "Erreur de connexion",
          description: data.message || "Identifiant ou mot de passe incorrect",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur serveur",
        description: "Veuillez réessayer plus tard",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Custom Loading Toggle Component
  const LoadingToggle = () => (
    <div className="flex items-center gap-2">
      <div className="relative h-6 w-11 rounded-full bg-blue-400 p-1 transition-all duration-300">
        <div className="h-4 w-4 animate-[bounce_1s_infinite] rounded-full bg-white shadow-sm" />
      </div>
      <span className="font-bold tracking-wide">AUTHENTIFICATION...</span>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-xl rounded-2xl bg-white p-10 shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Bon retour !</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Connectez-vous à votre compte <span className="font-bold text-blue-600">School Chat</span>.
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
                className="pl-11 py-6 border-gray-200 focus:ring-blue-500 dark:bg-gray-700/50 dark:border-gray-600"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="font-semibold text-gray-700 dark:text-gray-300">
                Mot de passe
              </Label>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-blue-500" size={20} />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="pl-11 pr-11 py-6 border-gray-200 focus:ring-blue-500 dark:bg-gray-700/50 dark:border-gray-600"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 transition-colors"
            >
              Mot de passe oublié ?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full rounded-2xl bg-blue-600 py-8 text-lg font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 dark:shadow-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingToggle />
            ) : (
              <div className="flex items-center gap-2">
                <span>Se connecter </span>
                <ArrowRight size={20} />
              </div>
            )}
          </Button>
        </form>

        <div className="mt-10 border-t border-gray-100 pt-8 text-center text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
          <p>
            Vous n'avez pas encore de compte ?{" "}
            <button
              onClick={() => navigate("/register")}
              className="font-extrabold text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400"
            >
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

