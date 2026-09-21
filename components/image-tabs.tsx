"use client";

import Image from "next/image";
import { useState } from "react";
import { Check } from "lucide-react";

type Tab = "organize" | "hired" | "boards";

const TABS: {
  id: Tab;
  label: string;
  caption: string;
  src: string;
  alt: string;
}[] = [
  {
    id: "organize",
    label: "Organize",
    caption:
      "Every role lands in a stage — Applied, Interview, Offer. Sort by where things actually stand.",
    src: "/hero-images/hero1.png",
    alt: "Kanban board organizing job applications by stage",
  },
  {
    id: "hired",
    label: "Progress",
    caption:
      "Drag a card and it saves instantly. No confirm step, no reload — just momentum.",
    src: "/hero-images/hero2.png",
    alt: "Job application successfully progressing to the offer stage",
  },
  {
    id: "boards",
    label: "Manage",
    caption:
      "Rename columns, add stages, keep your board shaped to your search — not the other way around.",
    src: "/hero-images/hero3.png",
    alt: "Dashboard showing the job hunt board with stages and applications",
  },
];

export default function ImageTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("organize");

  const active = TABS.find((t) => t.id === activeTab) ?? TABS[0];

  return (
    <section className="border-t border-[#E8E3DC]/70 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        {/* Section heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#B4451F]">
            The board
          </p>
          <h2 className="mt-3 text-[28px] font-semibold leading-[1.12] tracking-[-0.022em] text-[#1A1714] sm:text-[34px]">
            A view of your search you can actually read.
          </h2>
        </div>

        {/* Tabs — segmented control, quiet and functional */}
        <div
          role="tablist"
          aria-label="Product highlights"
          className="mt-10 flex justify-center"
        >
          <div className="inline-flex items-center gap-0.5 rounded-full border border-[#E8E3DC] bg-[#FAF8F5] p-1">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  id={`tab-${tab.id}`}
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors duration-200 sm:px-5 sm:text-[13.5px] ${
                    isActive
                      ? "bg-white text-[#1A1714] shadow-[0_1px_2px_rgba(26,23,20,0.08)]"
                      : "text-[#6B6660] hover:text-[#1A1714]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Browser frame around product image */}
        <div className="mt-10">
          <div className="overflow-hidden rounded-xl border border-[#E8E3DC] bg-white shadow-[0_24px_60px_-32px_rgba(26,23,20,0.4)]">
            {/* Chrome bar */}
            <div className="flex items-center gap-3 border-b border-[#E8E3DC] bg-[#FAF8F5] px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#E8A87C]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#E8C57C]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#A8C79A]" />
              </div>
              <div className="mx-auto hidden max-w-md flex-1 sm:block">
                <div className="flex h-6 items-center justify-center rounded-md border border-[#E8E3DC] bg-white px-3 text-[11px] text-[#8A857E]">
                  jobtracker.app/dashboard
                </div>
              </div>
              <div className="hidden w-14 sm:block" aria-hidden />
            </div>

            {/* Image panel */}
            <div
              id={`panel-${active.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${active.id}`}
              className="relative bg-[#FAF8F5]"
            >
              <Image
                key={active.id}
                src={active.src}
                alt={active.alt}
                width={1600}
                height={1000}
                priority={active.id === "organize"}
                className="block h-auto w-full"
              />
            </div>
          </div>

          {/* Caption under the frame */}
          <div className="mx-auto mt-5 flex max-w-2xl items-start gap-2.5 px-1">
            <Check
              className="mt-[3px] h-4 w-4 shrink-0 text-[#B4451F]"
              strokeWidth={2.25}
            />
            <p className="text-[14px] leading-relaxed text-[#6B6660] sm:text-[15px]">
              {active.caption}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}