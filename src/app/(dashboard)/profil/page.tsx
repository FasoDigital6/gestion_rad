"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/firebase/auth/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  RiUserLine,
  RiLockPasswordLine,
  RiEdit2Line,
  RiCheckLine,
  RiCloseLine
} from "react-icons/ri";
import { updatePassword } from "firebase/auth";
import { auth_client } from "@/lib/firebase/client/config";
import { useUser, useUpdateUser } from "@/lib/hooks/use-users";
import { createProfile } from "@/lib/firebase/api/users";

export default function ProfilPage() {
  const authUser = useAuth();
  const { data: user, isLoading } = useUser(authUser?.uid || "");
  const updateUserMutation = useUpdateUser();

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // États pour le profil
  const [telephone, setTelephone] = useState("");
  const [adresse, setAdresse] = useState("");
  const [email, setEmail] = useState("");

  // Initialiser les états quand les données utilisateur sont chargées
  useEffect(() => {
    if (user) {
      setTelephone(user.telephone || "");
      setAdresse(user.adresse || "");
      setEmail(user.email || "");
    } else if (authUser?.email) {
      setEmail(authUser.email);
    }
  }, [user, authUser]);

  // États pour le mot de passe
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // États des messages
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleUpdateProfile = async () => {
    if (!authUser?.uid) return;

    setProfileMessage(null);
    try {
      if (user) {
        // Mise à jour si l'utilisateur existe dans Firestore
        await updateUserMutation.mutateAsync({
          id: user.id,
          telephone,
          adresse,
          email,
          poste: user.poste,
        });
      } else {
        // Création du profil si l'utilisateur n'existe pas dans Firestore
        // On récupère le nom/prénom depuis authUser displayName (format "Prénom Nom")
        const displayName = authUser.displayName || "";
        const parts = displayName.split(" ");
        const prenom = parts[0] || "";
        const nom = parts.slice(1).join(" ") || "";

        await createProfile(authUser.uid, {
          email: authUser.email || "",
          nom,
          prenom,
          telephone,
          adresse,
          role: "user", // Rôle par défaut
        });

        // Recharger la page pour récupérer le nouvel utilisateur via le hook
        setTimeout(() => window.location.reload(), 1000);
      }

      setProfileMessage({ type: "success", text: "Profil mis à jour avec succès !" });
      setIsEditingProfile(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour du profil";
      setProfileMessage({ type: "error", text: message });
    }
  };

  const handleChangePassword = async () => {
    if (!auth_client.currentUser) return;

    setPasswordMessage(null);

    // Validations
    if (!newPassword || !confirmPassword) {
      setPasswordMessage({ type: "error", text: "Veuillez remplir tous les champs" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Le mot de passe doit contenir au moins 6 caractères" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Les mots de passe ne correspondent pas" });
      return;
    }

    try {
      await updatePassword(auth_client.currentUser, newPassword);

      setPasswordMessage({ type: "success", text: "Mot de passe modifié avec succès !" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === "auth/requires-recent-login") {
        setPasswordMessage({
          type: "error",
          text: "Pour des raisons de sécurité, veuillez vous reconnecter avant de changer votre mot de passe"
        });
      } else {
        const message = error instanceof Error ? error.message : "Erreur lors du changement de mot de passe";
        setPasswordMessage({ type: "error", text: message });
      }
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil</h1>
        <p className="text-gray-500">
          Gérez vos informations personnelles et votre sécurité
        </p>
      </div>

      {/* Carte Avatar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-slate-200">
              <AvatarFallback className="bg-[#0b63b5] text-white text-2xl">
                {user?.prenom?.charAt(0) || authUser?.displayName?.charAt(0) || "U"}
                {user?.nom?.charAt(0) || ""}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">
                {user ? `${user.prenom} ${user.nom}` : authUser?.displayName || "Utilisateur"}
              </h2>
              <p className="text-gray-500">{user?.email || authUser?.email}</p>
              <p className="text-sm text-gray-400 mt-1">
                Rôle: <span className="font-medium text-[#0b63b5]">{user?.role || "Utilisateur"}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <RiUserLine className="h-4 w-4" />
            Informations personnelles
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <RiLockPasswordLine className="h-4 w-4" />
            Sécurité
          </TabsTrigger>
        </TabsList>

        {/* Onglet Profil */}
        <TabsContent value="profile">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Informations du profil</CardTitle>
              {!isEditingProfile ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingProfile(true)}
                  className="gap-2"
                >
                  <RiEdit2Line className="h-4 w-4" />
                  Modifier
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingProfile(false);
                      setTelephone(user?.telephone || "");
                      setAdresse(user?.adresse || "");
                      setEmail(user?.email || authUser?.email || "");
                      setProfileMessage(null);
                    }}
                    className="gap-2"
                  >
                    <RiCloseLine className="h-4 w-4" />
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleUpdateProfile}
                    className="gap-2 bg-[#0b63b5] hover:bg-[#0b63b5]/90"
                    disabled={updateUserMutation.isPending}
                  >
                    <RiCheckLine className="h-4 w-4" />
                    {updateUserMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {profileMessage && (
                <div
                  className={`p-4 rounded-md ${profileMessage.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                >
                  {profileMessage.text}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input
                    id="prenom"
                    value={user?.prenom || authUser?.displayName?.split(" ")[0] || ""}
                    disabled
                    className="h-11 bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nom">Nom</Label>
                  <Input
                    id="nom"
                    value={user?.nom || authUser?.displayName?.split(" ").slice(1).join(" ") || ""}
                    disabled
                    className="h-11 bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isEditingProfile}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Téléphone</Label>
                <Input
                  id="telephone"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  disabled={!isEditingProfile}
                  placeholder="Votre numéro de téléphone"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse</Label>
                <Input
                  id="adresse"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  disabled={!isEditingProfile}
                  placeholder="Votre adresse complète"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Input
                  id="role"
                  value={user?.role || "Utilisateur"}
                  disabled
                  className="h-11 bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  Le rôle est défini par l&apos;administrateur
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Sécurité */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Changer le mot de passe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordMessage && (
                <div
                  className={`p-4 rounded-md ${passwordMessage.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                >
                  {passwordMessage.text}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Retapez votre nouveau mot de passe"
                  className="h-11"
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleChangePassword}
                  className="w-full bg-[#0b63b5] hover:bg-[#0b63b5]/90 h-11"
                  disabled={!newPassword || !confirmPassword}
                >
                  <RiLockPasswordLine className="h-4 w-4 mr-2" />
                  Changer le mot de passe
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Conseils de sécurité :</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Utilisez au moins 6 caractères</li>
                  <li>Combinez lettres, chiffres et symboles</li>
                  <li>Ne réutilisez pas d&apos;anciens mots de passe</li>
                  <li>Changez régulièrement votre mot de passe</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
