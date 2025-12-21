import React from "react";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-600 text-white">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">
                Política de Privacidad
              </h1>
            </div>

            {/* Back button */}
            <Link
              to="/"
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </Link>
          </div>


          {/* Content */}
          <section className="space-y-8 text-slate-700 leading-relaxed">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                1. Introducción
              </h2>
              <p>
                En <strong>Social Hub</strong> respetamos la privacidad de los
                usuarios. Esta Política describe cómo recopilamos, usamos y
                protegemos la información cuando utilizas nuestra aplicación.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                2. Información que recopilamos
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Open ID de TikTok</li>
                <li>Nombre de usuario y nombre visible</li>
                <li>Imagen de perfil</li>
                <li>Tokens de acceso y actualización</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                3. Uso de la información
              </h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Autenticación con TikTok</li>
                <li>Publicación de contenido autorizado</li>
                <li>Gestión de publicaciones</li>
              </ul>
            </div>

           
          </section>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
