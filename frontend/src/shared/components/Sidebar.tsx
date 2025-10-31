"use client";

import { useEffect, useState } from "react";
import type { Page } from "../../core/types";

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

type SocialNetwork = "instagram" | "facebook" | "tiktok" | "whatsapp" | "x";

export function Sidebar({ currentPage, onNavigate, onLogout }: SidebarProps) {
  const [expandedNetwork, setExpandedNetwork] = useState<SocialNetwork | null>(
    "instagram"
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const socialNetworks = [
    {
      id: "instagram" as SocialNetwork,
      label: "Instagram",
      icon: (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
      color: "text-pink-600",
      subItems: [
        { id: "instagram-clients" as Page, label: "Clientes" },
        { id: "instagram-publications" as Page, label: "Publicaciones" },
        { id: "instagram-schedule" as Page, label: "Programar" },
      ],
    },
    {
      id: "facebook" as SocialNetwork,
      label: "Facebook",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: "text-blue-600",
      subItems: [
        { id: "facebook-clients" as Page, label: "Clientes" },
        { id: "facebook-publications" as Page, label: "Publicaciones" },
        { id: "facebook-schedule" as Page, label: "Programar" },
      ],
    },
    {
      id: "tiktok" as SocialNetwork,
      label: "TikTok",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
      color: "text-slate-900",
      subItems: [
        { id: "tiktok-clients" as Page, label: "Clientes" },
        { id: "tiktok-publications" as Page, label: "Publicaciones" },
        { id: "tiktok-schedule" as Page, label: "Programar" },
      ],
    },
    {
      id: "whatsapp" as SocialNetwork,
      label: "WhatsApp",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
      color: "text-green-600",
      subItems: [
        { id: "whatsapp-clients" as Page, label: "Clientes" },
        { id: "whatsapp-publications" as Page, label: "Mensajes" },
        { id: "whatsapp-schedule" as Page, label: "Programar" },
      ],
    },
    {
      id: "x" as SocialNetwork,
      label: "X (Twitter)",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "text-slate-900",
      subItems: [
        { id: "x-clients" as Page, label: "Clientes" },
        { id: "x-publications" as Page, label: "Posts" },
        { id: "x-schedule" as Page, label: "Programar" },
      ],
    },
  ];

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (currentPage.startsWith("instagram")) setExpandedNetwork("instagram");
    else if (currentPage.startsWith("facebook")) setExpandedNetwork("facebook");
    else if (currentPage.startsWith("tiktok")) setExpandedNetwork("tiktok");
    else if (currentPage.startsWith("whatsapp")) setExpandedNetwork("whatsapp");
    else if (currentPage.startsWith("x-")) setExpandedNetwork("x");
  }, [currentPage]);

  const handleLogout = async () => {
    setError(null);
    setSuccess(false);

    try {
      await onLogout();
      setSuccess(true);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al cerrar sesión"
      );
    }
  };

  const toggleNetwork = (networkId: SocialNetwork) => {
    setExpandedNetwork(expandedNetwork === networkId ? null : networkId);
  };

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-slate-800 rounded-xl flex items-center justify-center shadow-sm">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-sidebar-foreground font-semibold">
              Social Hub
            </h2>
            <p className="text-xs text-muted-foreground">
              Multi-Platform Manager
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <button
          onClick={() => onNavigate("dashboard")}
          className={`w-full hover:cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all ${
            currentPage === "dashboard"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "hover:bg-sidebar-accent text-sidebar-foreground"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <rect
              x="3"
              y="3"
              width="7"
              height="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="14"
              y="3"
              width="7"
              height="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="14"
              y="14"
              width="7"
              height="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="3"
              y="14"
              width="7"
              height="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-medium">Dashboard</span>
        </button>

        <div className="pt-4 space-y-1">
          <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Redes Sociales
          </p>
          {socialNetworks.map((network) => {
            const isExpanded = expandedNetwork === network.id;
            const isNetworkActive = currentPage.startsWith(network.id);

            return (
              <div key={network.id}>
                <button
                  onClick={() => toggleNetwork(network.id)}
                  className={`w-full hover:cursor-pointer flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-all ${
                    isNetworkActive
                      ? "bg-sidebar-accent text-sidebar-foreground"
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={network.color}>{network.icon}</span>
                    <span className="text-sm font-medium">{network.label}</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform text-muted-foreground ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l-2 border-sidebar-border pl-4">
                    {network.subItems.map((subItem) => {
                      const isActive = currentPage === subItem.id;
                      return (
                        <button
                          key={subItem.id}
                          onClick={() => onNavigate(subItem.id)}
                          className={`w-full hover:cursor-pointer text-left px-3 py-2 rounded-md text-sm transition-all ${
                            isActive
                              ? "bg-sidebar-accent text-sidebar-foreground font-semibold"
                              : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                          }`}
                        >
                          {subItem.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full hover:cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-destructive/10 text-destructive transition-all font-medium"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
            />
            <polyline
              points="16 17 21 12 16 7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
