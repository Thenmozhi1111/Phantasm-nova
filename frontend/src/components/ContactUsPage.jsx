import React from "react";
import { Link } from "react-router-dom";
import {
  Home,
  Users,
  MapPin,
  Phone,
  ExternalLink,
  Signpost,
  Camera,
  BriefcaseBusiness,
  Play,
} from "lucide-react";
import Navbar from "./Navbar";

const coordinators = [
  { name: "M. Dhivyasri", phone: "+91 8248466142" },
  { name: "M. Arjun", phone: "+91 6381771885" },
  { name: "R. Dhanya", phone: "+91 6369458769" },
  { name: "R. Keerthivasan", phone: "+91 9159325594" },
];

const quickLinks = [
  { name: "Home", path: "/#home" },
  { name: "Events", path: "/events" },
  { name: "Schedule", path: "/#schedule" },
  { name: "Contact Us", path: "/#contact" },
];

const socialLinks = {
  instagram:
    "https://www.instagram.com/targaryenz.gceb?igsh=d2M5M2l2Ym5tMWF5&igsi=d2M5M2l2Ym5tMWF5",
  linkedin: "https://www.linkedin.com/in/final-year-cse-33b5a342b/",
  youtube: "https://www.youtube.com/",
};

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=Government+College+of+Engineering+Bargur+Krishnagiri";

export default function ContactUsPage({ showNavbar = true }) {
  return (
    <div className="min-h-screen w-full bg-[#050810] text-white font-body overflow-x-hidden">

      {/* ================= NAVBAR ================= */}
      {showNavbar && <Navbar />}

      {/* ================= MAIN ================= */}
      <main className="w-full px-4 sm:px-6 md:px-10 lg:px-12 pt-24 sm:pt-28 pb-8">

        {/* ================= BREADCRUMB ================= */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-blue-500 mb-3">
          <Home className="w-4 h-4" />
          <span>/</span>
          <span>CONTACT US</span>
        </div>

        {/* ================= TITLE ================= */}
        <div className="mb-7">
          <h1 className="font-gothic text-3xl sm:text-4xl md:text-5xl tracking-tight">
            CONTACT <span className="text-blue-500">US</span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Have questions or need more information? We're here to help you.
            Reach out to us anytime!
          </p>
        </div>

        {/* ================= COORDINATORS + MAP ================= */}
        {/* ================= COORDINATORS + MAP ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5 mb-5">

          {/* ================= COORDINATORS ================= */}
          <section
            className="
              lg:col-span-2
              border border-white/10
              rounded-2xl
              p-4 sm:p-5
              bg-white/[0.02]
              shadow-glow
            "
          >

            {/* Heading */}
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-5 h-5 text-blue-500" />

              <h2 className="font-serif2 text-base sm:text-lg font-semibold">
                OUR COORDINATORS
              </h2>
            </div>

            {/* Coordinator Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {coordinators.map((c) => (
                <div
                  key={c.name}
                  className="
                    border border-white/10
                    rounded-xl
                    px-3
                    py-4
                    min-h-[235px]
                    flex
                    flex-col
                    items-center
                    justify-center
                    text-center
                    bg-phantasm-navy
                    shadow-glow

                    hover:border-blue-500/60
                    hover:shadow-[0_0_20px_rgba(59,130,246,0.12)]

                    transition-all
                  "
                >

                  {/* Profile Icon */}
                  <div
                    className="
                      w-12 h-12
                      rounded-full
                      border border-blue-500/60
                      flex items-center justify-center
                      mb-3
                    "
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-6 h-6 fill-white"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
                    </svg>
                  </div>

                  <h3 className="font-semibold text-sm sm:text-base whitespace-nowrap">
                    {c.name}
                  </h3>

                  <p className="text-xs text-gray-400 mt-1">Coordinator</p>

                  <p className="text-xs sm:text-sm text-gray-200 mt-3 whitespace-nowrap">
                    {c.phone}
                  </p>

                  <a
                    href={`tel:${c.phone.replace(/\s+/g, "")}`}
                    aria-label={`Call ${c.name}`}
                    className="mt-4 w-10 h-10 rounded-full border border-blue-500/50 flex items-center justify-center hover:bg-blue-500/10 hover:border-blue-500 transition-all"
                  >
                    <Phone className="w-4 h-4 text-blue-500" />
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* ================= FIND US ================= */}
          <section
            className="border border-white/10 rounded-2xl p-4 sm:p-5 bg-white/[0.02] shadow-glow"
          >

            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-blue-500" />

              <h2 className="text-base sm:text-lg font-semibold">
                FIND US HERE
              </h2>
            </div>

            {/* Map */}
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="
  relative
  block
  w-full
  h-[180px]
  sm:h-[250px]
  lg:h-[260px]
  rounded-xl
  overflow-hidden
  bg-[#0b1220]
  border border-white/5
  shadow-glow
  group
"
            >

              {/* Grid */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, rgba(59,130,246,0.15) 0, rgba(59,130,246,0.15) 1px, transparent 1px, transparent 24px), repeating-linear-gradient(90deg, rgba(59,130,246,0.15) 0, rgba(59,130,246,0.15) 1px, transparent 1px, transparent 24px)",
                }}
              />

              {/* Glow */}
              <div
                className="
                  absolute
                  inset-0
                  bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_60%)]
                "
              />

              {/* Pin */}
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin
                  className="
                    w-10 h-10
                    text-blue-500
                    fill-blue-500
                    drop-shadow-[0_0_12px_rgba(59,130,246,0.7)]
                    group-hover:scale-110
                    transition-transform
                  "
                  strokeWidth={1.5}
                />
              </div>

              {/* Map Label */}
              <div
                className="
                  absolute
                  bottom-3
                  left-3
                       text-blue-500
                  text-center
                  text-xs
                  sm:text-sm
                  text-gray-300
                  bg-black/70
                  backdrop-blur-sm
                  rounded-md
                  px-3
                  py-2
                "
              >
                Government College of Engineering, Bargur
              </div>

            </a>

            {/* Google Maps Button */}
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="
                mt-3
                w-full
                flex
                items-center
                justify-center
                gap-2
                border border-white/15
                rounded-lg
                py-2.5
                px-3
                text-xs
                sm:text-sm
                font-medium
                tracking-wide
                hover:border-blue-500
                hover:text-blue-500
                transition-colors
              "
            >
              OPEN IN GOOGLE MAPS

              <ExternalLink className="w-4 h-4" />
            </a>

          </section>
        </div>

        {/* ================= DIRECTIONS ================= */}
        <section
          className="
            border border-white/10
            rounded-2xl
            p-4 sm:p-5
            mb-5
            bg-white/[0.02]
            shadow-glow
          "
        >

          <div className="flex items-center gap-2 mb-4">
            <Signpost className="w-5 h-5 text-blue-500" />

            <h2 className="text-base sm:text-lg font-semibold">
              DIRECTIONS TO COLLEGE
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Krishnagiri */}
            <div
              className="
                rounded-xl
                border border-white/10
                bg-phantasm-navy
                p-4
                shadow-glow
                hover:border-blue-500/40
                transition-colors
              "
            >
              <h3 className="text-sm sm:text-base font-semibold text-blue-500 mb-2">
                From Krishnagiri New Bus Stand
              </h3>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Take a bus going towards Bargur or Tirupattur and get down at Government College of Engineering, Bargur.
              </p>
            </div>

            {/* Tirupattur */}
            <div
              className="
                rounded-xl
                border border-white/10
                bg-phantasm-navy
                p-4
                shadow-glow
                hover:border-blue-500/40
                transition-colors
              "
            >
              <h3 className="text-sm sm:text-base font-semibold text-blue-500 mb-2">
                From Tirupattur Bus Stand
              </h3>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Take a bus going towards Krishnagiri and get down at Government College of Engineering, Bargur.
              </p>
            </div>

            {/* Landmark */}
            <div
              className="
                md:col-span-2
                rounded-xl
                border border-blue-500/20
                bg-blue-500/5
                p-4
                shadow-glow
              "
            >
              <h3 className="text-sm sm:text-base font-semibold text-blue-500 mb-2">
                Landmark
              </h3>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                Government College of Engineering, Bargur, NH 46,
                Chennai–Bangalore Highway, Madepalli Village, Bargur,
                Krishnagiri – 635104.
              </p>
            </div>

          </div>

        </section>

      </main>

      {/* ================= FOOTER ================= */}
      <footer
        className="
          px-4
          sm:px-6
          md:px-10
          lg:px-12
          pt-6
          pb-4
          border-t
          border-white/5
        "
      >

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* ================= BRAND ================= */}
          <div>

            <div className="font-gothic text-lg text-blue-500">
              PHANTASM
            </div>

            <div className="text-[9px] tracking-[0.3em] text-gray-400 mb-2">
              CSE SYMPOSIUM
            </div>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm">
              PHANTASM NOVA is more than a symposium. It's where ideas collide,
              minds connect, and innovation comes to life.
            </p>

          </div>

          {/* =====================================================
              MOBILE SEPARATOR 1
              PHANTASM → QUICK LINKS
              Hidden on desktop
          ====================================================== */}
          <div className="block sm:hidden w-full border-t border-white/30 my-1"></div>


          {/* ================= QUICK LINKS ================= */}
          <div>

            <div className="font-serif2 text-sm font-semibold mb-3 border-b-2 border-blue-500 inline-block pb-1">
              QUICK LINKS
            </div>

            {/* Horizontal Quick Links */}
            <ul
              className="
                flex
                flex-row
                flex-wrap
                items-center
                gap-x-6
                gap-y-2
                text-sm
                text-gray-300
                mt-1
              "
            >
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="
                      hover:text-blue-500
                      transition-colors
                      whitespace-nowrap
                    "
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

          </div>

          {/* =====================================================
              MOBILE SEPARATOR 2
              QUICK LINKS → FOLLOW US
              Hidden on desktop
          ====================================================== */}
          <div className="block sm:hidden w-full border-t border-white/30 my-1"></div>


          {/* ================= FOLLOW US ================= */}
          <div>

            <div className="font-serif2 text-sm font-semibold mb-3 border-b-2 border-blue-500 inline-block pb-1">
              FOLLOW US
            </div>

            <div className="flex gap-3">

              {/* Instagram */}
              <a
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="
                  w-9 h-9
                  rounded-lg
                  border border-white/15
                  flex items-center justify-center
                  hover:border-blue-500
                  hover:text-blue-500
                  transition-colors
                "
              >
                <svg
  className="w-4 h-4"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="1.8"
>
  <rect x="3" y="3" width="18" height="18" rx="5" />
  <circle cx="12" cy="12" r="4" />
  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
</svg>
              </a>

              {/* LinkedIn */}
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="
                  w-9 h-9
                  rounded-lg
                  border border-white/15
                  flex items-center justify-center
                  hover:border-blue-500
                  hover:text-blue-500
                  transition-colors
                "
              >
                <svg
  className="w-4 h-4"
  viewBox="0 0 24 24"
  fill="currentColor"
>
  <path d="M6.5 8.5H3.5V20h3V8.5ZM5 3.5A1.75 1.75 0 1 0 5 7a1.75 1.75 0 0 0 0-3.5ZM10 8.5H7V20h3v-5.7c0-1.5.3-3 2.2-3 1.8 0 1.8 1.7 1.8 3.1V20h3v-6.2c0-3.1-.7-5.5-4.2-5.5-1.4 0-2.4.8-2.8 1.5V8.5Z" />
</svg>
              </a>

              {/* YouTube */}
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="
                  w-9 h-9
                  rounded-lg
                  border border-white/15
                  flex items-center justify-center
                  hover:border-blue-500
                  hover:text-blue-500
                  transition-colors
                "
              >
                <svg
  className="w-4 h-4"
  viewBox="0 0 24 24"
  fill="currentColor"
>
  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.9V8.1l6.5 3.9-6.5 3.9Z" />
</svg>
              </a>

            </div>

          </div>

        </div>

        {/* ================= COPYRIGHT ================= */}
        <div
          className="
            text-center
            text-[10px]
            sm:text-xs
            text-gray-500
            mt-6
            pt-4
            border-t
            border-white/5
          "
        >
          © 2025 PHANTASM CSE Symposium. All Rights Reserved.
        </div>

      </footer>

    </div>
  );
}
