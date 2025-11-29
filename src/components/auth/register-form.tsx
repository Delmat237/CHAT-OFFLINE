import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast, useToast } from "@/hooks/use-toast"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { Loader2 } from "lucide-react"

export default function RegisterForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  // Role = 'teacher', 'student', 'worker'
  const [role, setRole] = useState("")
  const [photo, setPhoto] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
  
    try {
      const res = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, photo }),
      })

      const data = await res.json()
      if (res.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.data.user))
        toast({
          title: "Registration réussie",
          description: "Bienvenue dans School Chat!",
        })
        navigate("/chat")
      } else {
        toast({
          title: "Erreur de registration",
          description: data.message || "Erreur de registration",
          variant: "destructive",
        })
      }
    
    } catch (error) {
    toast({
      title: "Erreur de registration",
      description: "Veuillez réessayer plus tard",
      variant: "destructive",
    })
    console.error(error)
  } finally {
    setIsLoading(false)
  } 
}
return (
  <div>
  <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">School Chat</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Créez un compte pour accéder à votre espace
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password">Mot de passe</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="space-y-3">
            <Label htmlFor="role">Role</Label>
            <Input id="role" type="text" value={role} onChange={(e) => setRole(e.target.value)} required />
          </div>
          <div className="space-y-3">
            <Label htmlFor="photo">Photo</Label>
            <Input id="photo" type="file" value={photo} onChange={(e) => setPhoto(e.target.value)} required />
          </div>
          <Button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 py-3 font-medium text-white shadow-md hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Inscription en cours..." : "S'inscrire"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Vous avez déjà un compte ?{" "}
            <a
              href="/"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Se connecter 
            </a>
          </p>
        </div>
      </div>
    </div>
  </div>
)}