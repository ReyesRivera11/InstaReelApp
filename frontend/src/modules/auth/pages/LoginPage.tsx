import { useState } from "react";
import { Button, Input, Card } from "../../../shared/components/ui";
import { Icons } from "../../../shared/components/icons";

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="p-6 space-y-4 text-center border-b border-border">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
            <div className="text-white">
              <Icons.Instagram />
            </div>
          </div>
          <div>
            <h1>Reels Manager</h1>
            <p className="text-muted-foreground">
              Gestiona y programa tus publicaciones de Instagram
            </p>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="email"
              type="email"
              label="Correo electrónico"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              id="password"
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" fullWidth>
              Iniciar sesión
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Demo: cualquier email/contraseña
            </p>
          </form>
        </div>
      </Card>
    </div>
  );
}
