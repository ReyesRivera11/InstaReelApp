import React from "react";
import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 md:p-12">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-900 text-white">
                <FileText className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900">
                Términos y Condiciones
              </h1>
            </div>


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
                1. Aceptación
              </h2>
              <p>
                Al utilizar <strong>Social Hub</strong>, aceptas estos términos.
                Si no estás de acuerdo, no debes utilizar la aplicación.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                2. Uso del servicio
              </h2>
              <p>
                La aplicación permite autenticar cuentas de TikTok y publicar
                contenido autorizado por el usuario.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                3. Responsabilidad
              </h2>
              <p>
                El usuario es responsable del contenido publicado y del
                cumplimiento de las normas de TikTok.
              </p>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
};

export default Terms;
