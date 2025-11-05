"use client";

import React from "react";
import Link from "next/link";

export default function ProjectSelector() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-10">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Select a Project
        </h1>
        <ul className="space-y-4">
          <li>
            <Link
              href="/meeting-tracker"
              className="block p-6 rounded-lg border bg-white shadow hover:shadow-lg transition text-xl text-blue-700 font-semibold hover:bg-blue-50 text-center"
            >
              Meeting Tracker
            </Link>
          </li>
          <li>
            <Link
              href="/internal-requisitions"
              className="block p-6 rounded-lg border bg-white shadow hover:shadow-lg transition text-xl text-green-700 font-semibold hover:bg-green-50 text-center"
            >
              Internal Requisitions
            </Link>
          </li>
        </ul>
        <p className="text-gray-400 text-xs mt-8 text-center">
          Add more projects by creating a new folder under <code>app/</code> and
          adding a link here.
        </p>
      </div>
    </main>
  );
}
