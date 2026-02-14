import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import {
  Loader2,
  Eye,
  EyeOff,
  Check,
  X,
  User as UserIcon,
  Mail,
  Lock,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  ChevronLeft,
  Camera
} from "lucide-react"
import { API_URL } from "@/lib/config"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export default function RegisterForm() {
  const [step, setStep] = useState(1)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [pseudo, setPseudo] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const navigate = useNavigate()
  const { toast } = useToast()

  const passwordRequirements = useMemo(() => [
    { label: "Minuscule", met: /[a-z]/.test(password) },
    { label: "Majuscule", met: /[A-Z]/.test(password) },
    { label: "Chiffre", met: /[0-9]/.test(password) },
    { label: "Caractère spécial", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    { label: "8 caractères min.", met: password.length >= 8 },
  ], [password])

  const isPasswordValid = passwordRequirements.every(req => req.met)
  const passwordsMatch = password === confirmPassword && password !== ""

  // Step Validation Logic
  const canGoNext = () => {
    if (step === 1) return lastName.trim() !== "" && firstName.trim() !== "" && role !== "";
    if (step === 2) return email.trim() !== "" && isPasswordValid && passwordsMatch;
    return true; // Step 3 is optional (photo)
  }

  const handleNext = () => {
    if (canGoNext()) setStep(s => s + 1);
  }

  const handlePrev = () => {
    setStep(s => s - 1);
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canGoNext()) return;

    setIsLoading(true)

    try {
      const fullName = `${lastName.toUpperCase()} ${firstName}`
      const formData = new FormData()
      formData.append("name", fullName)
      formData.append("email", email)
      formData.append("password", password)
      formData.append("role", role)
      if (pseudo) formData.append("pseudo", pseudo)
      if (photo) formData.append("photo", photo)

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.data.user))
        toast({ title: "Inscription réussie", description: `Bienvenue, ${firstName} !` })
        navigate("/chat")
      } else {
        toast({
          title: "Erreur d'inscription",
          description: data.message || "Impossible de créer le compte.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur d'inscription",
        description: "Veuillez réessayer plus tard.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // Progress Bar Header
  const ProgressHeader = () => (
    <div className="mb-10 w-full">
      <div className="flex justify-between mb-2 px-2">
        {["Identité", "Sécurité", "Profil"].map((label, i) => (
          <span key={i} className={cn(
            "text-xs font-bold uppercase transition-colors",
            step > i + 1 ? "text-green-500" : step === i + 1 ? "text-blue-600" : "text-gray-300"
          )}>
            {label}
          </span>
        ))}
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <div className="w-full max-w-xl rounded-3xl bg-white p-10 shadow-2xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-xl rotate-3 transform hover:rotate-0 transition-transform">
            <ShieldCheck size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">Inscription</h1>
          <p className="mt-2 text-gray-500 font-medium">Divisé en étapes pour plus de simplicité.</p>
        </div>

        <ProgressHeader />

        <form onSubmit={handleSubmit} className="space-y-8 min-h-[350px] flex flex-col">

          <div className="flex-1">
            {/* STEP 1: IDENTITY */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="font-bold flex gap-1">Nom <span className="text-red-500">*</span></Label>
                    <div className="relative group">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={18} />
                      <Input
                        id="lastName"
                        placeholder="AZANGUE"
                        className="pl-10 h-12 rounded-xl transition-all focus:ring-2 focus:ring-blue-100 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="font-bold flex gap-1">Prénom <span className="text-red-500">*</span></Label>
                    <div className="relative group">
                      <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={18} />
                      <Input
                        id="firstName"
                        placeholder="Leonel"
                        className="pl-10 h-12 rounded-xl transition-all focus:ring-2 focus:ring-blue-100 dark:bg-gray-700/50 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pseudo" className="font-bold">Pseudo</Label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">@</div>
                      <Input
                        id="pseudo"
                        placeholder="leonel"
                        className="pl-10 h-12 rounded-xl dark:bg-gray-700/50 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="font-bold flex gap-1">Rôle <span className="text-red-500">*</span></Label>
                    <Select onValueChange={setRole} value={role} required>
                      <SelectTrigger className="w-full h-12 rounded-xl">
                        <SelectValue placeholder="Choisir un rôle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Élève</SelectItem>
                        <SelectItem value="teacher">Professeur</SelectItem>
                        <SelectItem value="worker">Personnel / Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: SECURITY */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold flex gap-1">Email <span className="text-red-500">*</span></Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={18} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@ecole.com"
                      className="pl-10 h-12 rounded-xl dark:bg-gray-700/50 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password" title="Mot de passe" className="font-bold flex gap-1">Mot de passe <span className="text-red-500">*</span></Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={18} />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="pl-10 pr-10 h-12 rounded-xl dark:bg-gray-700/50 dark:border-gray-600 dark:text-white dark:placeholder-gray-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="font-bold flex gap-1">Confirmation <span className="text-red-500">*</span></Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500" size={18} />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        className={cn(
                          "pl-10 pr-10 h-12 rounded-xl transition-all",
                          password && confirmPassword && (passwordsMatch ? "border-green-500 bg-green-50/10 focus-visible:ring-green-500" : "border-red-500 bg-red-50/10 focus-visible:ring-red-500")
                        )}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {password && (
                  <div className="rounded-2xl bg-gray-50 p-5 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                    <p className="mb-3 text-[10px] font-black uppercase tracking-[2px] text-gray-400">Security Check</p>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                      {passwordRequirements.map((req, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <div className={cn("flex h-4 w-4 items-center justify-center rounded-full", req.met ? "bg-green-500 text-white" : "bg-gray-200 text-transparent")}>
                            <Check size={10} strokeWidth={4} />
                          </div>
                          <span className={cn("font-medium transition-colors", req.met ? "text-green-600" : "text-gray-400")}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: PROFILE */}
            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 flex flex-col items-center">
                <div className="relative group">
                  <div className="h-32 w-32 rounded-full border-4 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800 dark:border-gray-700 transition-all group-hover:border-blue-300">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Camera size={32} />
                        <span className="text-[10px] mt-1 font-bold">AJOUTER</span>
                      </div>
                    )}
                  </div>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handlePhotoChange}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full shadow-lg border-4 border-white dark:border-gray-800">
                    <Camera size={14} />
                  </div>
                </div>

                <div className="text-center max-w-sm">
                  <h3 className="text-xl font-bold dark:text-white">Photo de profil</h3>
                  <p className="text-sm text-gray-500 mt-1">C'est facultatif, vous pourrez la modifier plus tard dans les paramètres.</p>
                </div>

                <div className="w-full bg-blue-50/50 rounded-2xl p-6 border border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30">
                  <h4 className="text-xs font-black text-blue-600 uppercase mb-4 tracking-wider">Récapitulatif</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Nom :</span> <span className="font-bold dark:text-white">{lastName} {firstName}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Email :</span> <span className="font-bold dark:text-white">{email}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Rôle :</span> <span className="font-bold dark:text-white capitalize text-blue-600">{role}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="mt-auto flex gap-4 pt-4">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                className="flex-1 h-14 rounded-2xl border-2 font-bold hover:bg-gray-50 transition-all dark:hover:bg-gray-700"
              >
                <ChevronLeft className="mr-2" size={20} />
                Précédent
              </Button>
            )}

            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext()}
                className="flex-[2] h-14 rounded-2xl bg-blue-600 font-bold text-white shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all dark:shadow-none"
              >
                Continuer
                <ChevronRight className="ml-2" size={20} />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-[2] h-14 rounded-2xl bg-blue-600 font-bold text-white shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 transition-all dark:shadow-none"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Création...</span>
                  </div>
                ) : (
                  <span>Terminer l'inscription</span>
                )}
              </Button>
            )}
          </div>
        </form>

        <div className="mt-10 border-t border-gray-100 pt-6 text-center text-sm text-gray-500 dark:border-gray-700">
          <p>
            Vous avez déjà un compte ?{" "}
            <button
              onClick={() => navigate("/")}
              className="font-black text-blue-600 hover:text-blue-500 hover:underline transition-colors"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}