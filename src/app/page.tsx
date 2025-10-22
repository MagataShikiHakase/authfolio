// src/app/page.tsx

import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans" });

export default function Home() {
  return (
    <main className={`min-h-screen p-8 ${geistSans.variable} font-sans bg-gray-50`}>
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold mb-2">Yuma Fukazawa</h1>
        <p className="text-gray-600 text-lg">Software Engineer & Portfolio</p>
      </header>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-4">About Me</h2>
        <p className="text-gray-700">
          I am a computer science student passionate about full-stack development, AI, and web applications.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-semibold mb-4">Projects</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-bold text-xl mb-2">Authfolio</h3>
            <p className="text-gray-600">A portfolio site built with Next.js and Supabase.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="font-bold text-xl mb-2">Learning Planner</h3>
            <p className="text-gray-600">A productivity app that tracks study progress with AI insights.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-4">Contact</h2>
        <p className="text-gray-700">
          Email: <a href="mailto:yumafukazawa@example.com" className="text-blue-500">yumafukazawa@example.com</a>
        </p>
      </section>
    </main>
  );
}


