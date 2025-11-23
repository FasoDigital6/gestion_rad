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
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-[#f8f4ea] via-white to-[#f0ead9] px-4 py-10 text-slate-900">
      <div className="w-full max-w-4xl">
        <Card className="mx-auto max-w-2xl rounded-2xl border border-slate-200 shadow-[0_12px_50px_rgba(0,0,0,0.08)]">
          <div className="flex justify-center pt-10 pb-4">
            <Image
              src="/imgs/logo.png"
              alt="Gestion RAD Logo"
              width={190}
              height={80}
              className="h-auto w-auto"
              priority
            />
          </div>

          <CardContent className="px-10 pb-12 pt-2">
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900">Connectez-vous à votre Compte</h1>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 text-sm text-red-700 px-4 py-3">
                      {error}
                    </div>
                  )}

                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-900">Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Votre adresse email"
                            type="email"
                            className="h-11 rounded-md border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
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
                        <FormLabel className="text-sm font-semibold text-slate-900">Mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Votre mot de passe"
                              className="h-11 rounded-md border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 pr-11 focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
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
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked: boolean) => setRememberMe(checked)}
                        className="border-slate-300 data-[state=checked]:bg-blue-700 data-[state=checked]:border-blue-700"
                      />
                      <label htmlFor="remember" className="text-sm font-medium text-slate-800 cursor-pointer">
                        Se souvenir de moi
                      </label>
                    </div>
                    <a href="#" className="text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors">
                      Mot de passe oublié ?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    className="mt-2 h-11 w-full rounded-md bg-[#0f2547] text-base font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-blue-200"
                    disabled={isLoading}
                  >
                    {isLoading ? "Connexion en cours..." : "Se connecter"}
                  </Button>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>

        <div className="mt-10 text-center text-sm text-slate-600 space-y-1">
          <p className="font-semibold text-slate-700">© 2025 Gestion RAD. Tous droits réservés.</p>
          <p className="text-xs">contact@radguinee.com</p>
          <p className="text-xs">+224 622 39 21 60</p>
        </div>
      </div>
    </div>
  )
}
