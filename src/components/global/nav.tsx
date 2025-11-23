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
    <div className="fixed top-0 z-10 flex flex-col w-full bg-muted lg:bottom-0 lg:z-auto lg:w-72 ">
      <div className="flex items-center px-4 py-4 h-14 lg:h-auto">
        <Link
          href="/"
          className="flex justify-center items-baseline w-full group gap-x-2"
          onClick={close}
        >
          <div className="w-28">
            <Logo />
          </div>
          <h3 className="text-sm bg-secondary/10 px-2  font-semibold tracking-wide text-secondary uppercase">
            Gestion
          </h3>
        </Link>
      </div>
      <button
        type="button"
        className="absolute top-0 right-0 flex items-center px-4 group h-14 gap-x-2 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="font-medium text-primary group-hover:text-primary/80">
          Menu
        </div>
        {isOpen ? <RiCloseLine /> : <RiMenu2Line />}
      </button>

      <div
        className={clsx(
          "overflow-y-auto lg:static lg:block flex flex-col justify-between",
          {
            "fixed inset-x-0 bottom-0 top-14 mt-px bg-slate-100": isOpen,
            hidden: !isOpen,
          }
        )}
      >
        <nav className="px-2 py-2 space-y-6 ">
          {navItems.map((section) => {
            return (
              <div key={section.name}>
                <div className="px-3 mb-2 text-[10px] tracking-wider font-semibold uppercase text-gray-400/80">
                  <div>{section.name}</div>
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

        <div className="border-t mt-auto">
          <div className="px-3 py-4">
            <div className="flex items-center gap-3 mb-3 px-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User avatar" />
                <AvatarFallback>
                  {user?.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  {user?.displayName || "User Name"}
                </span>
                <span className="text-xs text-gray-500">
                  {user?.email || "user@email.com"}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <Link
                href="/staff/dashboard"
                onClick={close}
                className="flex items-center w-full gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-secondary hover:text-white group"
              >
                <RiAccountCircleFill className="text-secondary h-5 w-5 group-hover:text-white" />
                Mon profil
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center w-full gap-x-3 rounded-md px-3 py-2 text-sm font-medium text-gray-800 hover:bg-secondary hover:text-white group"
              >
                <RiLogoutBoxRLine className="text-secondary h-5 w-5 group-hover:text-white" />
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
        "flex items-center gap-x-3 rounded-md px-3 py-2 text-sm group font-medium hover:text-white",
        {
          "text-gray-800 hover:bg-secondary": !isActive,
          "text-white bg-secondary": isActive,
        }
      )}
    >
      <item.icon
        className={clsx("text-secondary h-5 w-5  group-hover:text-white", {
          "text-white": isActive,
        })}
      />
      {item.name}
    </Link>
  );
}
