"use client";

import Link from "next/link";
import clsx from "clsx";

import { useState } from "react";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import {
  RiCloseLine,
  RiLogoutBoxRLine,
  RiAccountCircleFill,
  RiMenu2Line,
} from "react-icons/ri";

import Logo from "@/components/global/logo";
import { navItems } from "@/lib/nav-data";
import { ItemNav } from "@/lib/types";
import { logout } from "@/lib/firebase/auth/logout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/firebase/auth/auth-context";

export function GlobalNav() {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  const router = useRouter();
  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  const user = useAuth();

  return (
    <div className="fixed top-0 z-20 flex w-full flex-col bg-[#f5f7fb] text-slate-800 shadow-sm lg:bottom-0 lg:z-auto lg:w-72 lg:border-r lg:border-slate-200">
      <div className="flex flex-col items-center justify-center gap-2 px-5 py-5 h-20 lg:h-auto text-center">
        <Link
          href="/"
          className="flex flex-col items-center gap-2 w-full"
          onClick={close}
        >
          <div className="w-32">
            <Logo className="mx-auto" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold uppercase tracking-[0.12em] text-[#0b63b5]">
              GESTPRO
            </div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-slate-500">
              Gestion interne
            </div>
          </div>
        </Link>
      </div>

      <button
        type="button"
        className="absolute top-0 right-0 flex items-center px-4 h-14 gap-x-2 lg:hidden text-slate-700"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="font-medium">Menu</div>
        {isOpen ? <RiCloseLine /> : <RiMenu2Line />}
      </button>

      <div
        className={clsx(
          "overflow-y-auto lg:static lg:block flex flex-col justify-between transition-[transform,opacity] duration-200 lg:translate-y-0 lg:opacity-100",
          {
            "fixed inset-x-0 bottom-0 top-14 bg-[#f5f7fb] translate-y-0 opacity-100": isOpen,
            "hidden -translate-y-2 opacity-0": !isOpen,
          }
        )}
      >
        <nav className="px-4 py-4 space-y-6">
          {navItems.map((section) => {
            return (
              <div key={section.name}>
                <div className="px-2 mb-2 text-[11px] tracking-[0.18em] font-semibold uppercase text-slate-400">
                  {section.name}
                </div>

                <div className="space-y-1">
                  {section.items.map((item) => (
                    <GlobalNavItem key={item.slug} item={item} close={close} />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 mt-auto">
          <div className="px-4 py-4 space-y-2">
            <div className="flex items-center gap-3 px-1">
              <Avatar className="h-10 w-10 border border-slate-200">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User avatar" />
                <AvatarFallback className="bg-slate-100 text-slate-700">
                  {user?.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">
                  {user?.displayName || "User Name"}
                </span>
                <span className="text-xs text-slate-500">
                  {user?.email || "user@email.com"}
                </span>
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <Link
                href="/staff/dashboard"
                onClick={close}
                className="flex items-center w-full gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-slate-800 hover:bg-[#e8f1fb] hover:text-[#0b63b5] transition"
              >
                <RiAccountCircleFill className="h-5 w-5 text-[#0b63b5]" />
                Mon profil
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center w-full gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-slate-800 hover:bg-[#e8f1fb] hover:text-[#0b63b5] transition"
              >
                <RiLogoutBoxRLine className="h-5 w-5 text-[#0b63b5]" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobalNavItem({
  item,
  close,
}: {
  item: ItemNav;
  close: () => false | void;
}) {
  const segment = useSelectedLayoutSegment();
  const isActive = item.slug === segment;

  if (!item.icon) return null;

  return (
    <Link
      onClick={close}
      href={`/${item.slug}`}
      className={clsx(
        "group flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
        isActive
          ? "bg-[#0b63b5] text-white shadow-sm"
          : "text-slate-800 hover:bg-[#e8f1fb] hover:text-[#0b63b5]"
      )}
    >
      <item.icon
        className={clsx("h-5 w-5 transition-colors", {
          "text-white": isActive,
          "text-slate-700 group-hover:text-[#0b63b5]": !isActive,
        })}
      />
      <span>{item.name}</span>
    </Link>
  );
}
