"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { updateProfile, updatePassword } from "firebase/auth";
import { auth_client } from "@/lib/firebase/client/config";

export default function ProfilPage() {
  const user = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // États pour le profil
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");

  // États pour le mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // États des messages
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  const handleUpdateProfile = async () => {
    if (!auth_client.currentUser) return;

    setProfileMessage(null);
    try {
      await updateProfile(auth_client.currentUser, {
        displayName,
        photoURL: photoURL || undefined,
      });

      setProfileMessage({ type: "success", text: "Profil mis à jour avec succès !" });
      setIsEditingProfile(false);

      // Rafraîchir la page pour mettre à jour l'UI
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      setProfileMessage({ type: "error", text: error.message || "Erreur lors de la mise à jour du profil" });
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
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        setPasswordMessage({
          type: "error",
          text: "Pour des raisons de sécurité, veuillez vous reconnecter avant de changer votre mot de passe"
        });
      } else {
        setPasswordMessage({ type: "error", text: error.message || "Erreur lors du changement de mot de passe" });
      }
    }
  };

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
              <AvatarImage src={photoURL || user?.photoURL || "/placeholder-avatar.jpg"} alt="Avatar" />
              <AvatarFallback className="bg-[#0b63b5] text-white text-2xl">
                {displayName?.charAt(0) || user?.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{user?.displayName || "Utilisateur"}</h2>
              <p className="text-gray-500">{user?.email}</p>
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
                      setDisplayName(user?.displayName || "");
                      setPhotoURL(user?.photoURL || "");
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
                  >
                    <RiCheckLine className="h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {profileMessage && (
                <div
                  className={`p-4 rounded-md ${
                    profileMessage.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {profileMessage.text}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="displayName">Nom complet</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={!isEditingProfile}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="h-11 bg-gray-50"
                />
                <p className="text-xs text-gray-500">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="photoURL">Photo de profil (URL)</Label>
                <Input
                  id="photoURL"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  disabled={!isEditingProfile}
                  placeholder="https://example.com/photo.jpg"
                  className="h-11"
                />
                <p className="text-xs text-gray-500">
                  Entrez l'URL d'une image pour votre photo de profil
                </p>
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
                  Le rôle est défini par l'administrateur
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
                  className={`p-4 rounded-md ${
                    passwordMessage.type === "success"
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
                  <li>Ne réutilisez pas d'anciens mots de passe</li>
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
