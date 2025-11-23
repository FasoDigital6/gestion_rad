"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { loginAction } from "@/lib/actions/auth/auth_actions"
import Image from "next/image"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

const formSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(6, {
    message: "Le mot de passe doit contenir au moins 6 caractères.",
  }),
})

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  /* Added showPassword state for password visibility toggle */
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await loginAction(values)

      if (result?.error) {
        setError(result.error)
        return
      }

      if (result?.success) {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("Une erreur inattendue s'est produite.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    /* Changed background to warm beige with subtle gradient */
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 px-4 py-8">
      <div className="w-full max-w-md">
        <Card className="border-0 bg-white shadow-lg overflow-hidden">
          <div className="flex justify-center pt-8 pb-2">
            <Image
              src="/imgs/logo.png"
              alt="Gestion RAD Logo"
              width={140}
              height={60}
              className="h-auto w-auto max-h-14"
              priority
            />
          </div>

          <CardContent className="pt-6 pb-8">
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Connectez-vous à votre Compte</h1>
                <p className="text-sm text-muted-foreground">Accédez à votre espace de gestion</p>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 text-red-700 text-sm p-4 rounded-lg border border-red-200">{error}</div>
                  )}

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-foreground">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Votre adresse email"
                            type="email"
                            className="h-11 bg-white border-2 border-gray-200 text-foreground placeholder:text-gray-400 focus:border-primary focus:ring-0"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-foreground">Mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              className="h-11 bg-white border-2 border-gray-200 text-foreground placeholder:text-gray-400 focus:border-primary focus:ring-0 pr-10"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked: boolean) => setRememberMe(checked)}
                        className="border-gray-300"
                      />
                      <label htmlFor="remember" className="text-sm font-medium text-foreground cursor-pointer">
                        Se souvenir de moi
                      </label>
                    </div>
                    <a href="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                      Mot de passe oublié ?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold text-base transition-all duration-200 rounded-lg shadow-md hover:shadow-lg mt-8"
                    disabled={isLoading}
                  >
                    {isLoading ? "Connexion en cours..." : "Se connecter"}
                  </Button>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>

        {/* Footer with Contact Info */}
        <div className="text-center text-sm text-gray-600 space-y-2 mt-8">
          <p className="font-semibold text-foreground">© 2025 Gestion RAD. Tous droits réservés.</p>
          <div className="space-y-1 text-xs">
            <p>contact@radguinee.com</p>
            <p>+224 622 39 21 60</p>
          </div>
        </div>
      </div>
    </div>
  )
}
