
"use client";

import type { PropsWithChildren } from "react";



export default function AuthCard({ title, subtitle, children }: PropsWithChildren<{title:string; subtitle?:string;}>) {

  return (

    <main className="min-h-[calc(100vh-0px)] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">

        <div className="relative">

          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-slate-300 via-slate-100 to-slate-200 blur-md opacity-70"></div>

          <div className="relative bg-white/90 backdrop-blur border border-slate-200 rounded-3xl shadow-xl overflow-hidden">

            <div className="p-6 sm:p-8">

              <div className="mb-6 text-center">

                <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-900 text-white grid place-items-center text-xl font-bold shadow">

                  A

                </div>

                <h1 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>

                {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}

              </div>

              {children}

            </div>

          </div>

        </div>

        <p className="mt-6 text-center text-xs text-slate-500">

          By continuing you agree to our Terms and Privacy Policy.

        </p>

      </div>

    </main>

  );

}

