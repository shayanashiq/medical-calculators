import Link from "next/link";

export default function AboutPage() {
    return (
        <main className="bg-white">
            {/* ── HERO ── */}
            <div
                className="px-4 pt-14 pb-16 sm:px-6"
                style={{
                    background: "linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #0284c7 100%)",
                }}
            >
                <div className="mx-auto max-w-5xl">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                            <span className="text-white/90 text-xs font-medium tracking-wide uppercase">Medical Calculators Online</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-white sm:text-5xl leading-tight mb-4">
                            Built by someone who<br />
                            <span className="text-emerald-200">lives at the crossroads</span>
                        </h1>
                        <p className="text-white/75 text-base sm:text-lg leading-relaxed max-w-xl">
                            Medical roots. Computer science degree. A relentless drive to make medical knowledge
                            accessible — without sacrificing accuracy.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── STAT BAR ── */}
            <div className="border-b border-slate-100 bg-slate-50">
                <div className="mx-auto max-w-5xl grid grid-cols-3 divide-x divide-slate-200">
                    {[
                        { num: "200+", label: "Calculators" },
                        { num: "987+", label: "Searches covered" },
                        { num: "100%", label: "Free & private" },
                    ].map(({ num, label }) => (
                        <div key={label} className="py-6 text-center">
                            <div className="text-2xl font-extrabold text-teal-700">{num}</div>
                            <div className="text-xs text-slate-500 mt-1 uppercase tracking-wide">{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── FOUNDER ── */}
            <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
                <div className="flex flex-col sm:flex-row gap-10 items-start">
                    {/* Photo + identity */}
                    <div className="flex-shrink-0 flex flex-col items-center sm:items-start gap-3 sm:w-52">
                    <div className="w-36 h-36 rounded-2xl overflow-hidden ring-4 ring-teal-500 shadow-lg">
  <div className="w-full h-full rounded-[14px] overflow-hidden">
    <img
      src="/sajeel.png"
      alt="Sajeel Ahmad"
      className="w-full h-full object-cover object-top"
    />
  </div>
</div>
                        <div className="text-center sm:text-left">
                            <div className="font-bold text-slate-900 text-lg leading-tight">Sajeel Ahmad</div>
                            <div className="text-sm text-teal-600 font-medium mt-0.5">Founder &amp; Developer</div>
                            <div className="text-xs text-slate-400 mt-0.5">📍 Pakistan</div>
                        </div>
                        <div className="flex gap-2 mt-1">
                            <a
                                href="https://www.linkedin.com/in/sajeel-ahmad"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="LinkedIn"
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 flex items-center justify-center text-slate-500 transition"
                            >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                            <a
                                href="https://www.instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Instagram"
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-teal-50 hover:text-teal-700 flex items-center justify-center text-slate-500 transition"
                            >
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Bio */}
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold text-slate-900 mb-3 leading-snug">
                            Where medicine meets code
                        </h2>
                        <p className="text-slate-600 text-sm leading-relaxed mb-5">
                            Sajeel Ahmad is a Computer Science graduate with an unusual backstory — he began his
                            academic journey in the medical sciences, developing a strong foundation in
                            biology, human physiology, Biochemistry, Internal Medicine, and clinical thinking.
                            After pivoting to CS, he found the intersection he was always headed toward: building
                            health tools that are scientifically grounded and technically excellent. He continues
                            independent research in the medical field to this day, ensuring every formula on this
                            platform reflects current guidelines.
                        </p>

                        {/* Inline tag chips */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {["CS Graduate", "Active Medical Researcher", "Health Tech Builder"].map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-50 text-teal-700 border border-teal-100"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* Quote */}
                        <blockquote className="border-l-4 border-teal-500 pl-4 text-slate-600 italic text-sm leading-relaxed">
                            "I started in medicine and moved to code — but I never stopped being curious about
                            health. This platform is my way of using both. Every calculator here reflects
                            research I genuinely care about."
                        </blockquote>
                    </div>
                </div>
            </div>

            {/* ── WHAT WE STAND FOR ── */}
            <div className="mx-auto max-w-5xl px-4 sm:px-6 py-14">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">What we stand for</h2>
                <p className="text-slate-500 text-sm mb-10">Every decision on this platform comes back to these three things.</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        {
                            icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                            ),
                            label: "100% Private",
                            desc: "All calculations happen in your browser. We never store or transmit your health data.",
                        },
                        {
                            icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                            ),
                            label: "Evidence-Based",
                            desc: "Every formula verified against medical journals, WHO guidelines, and clinical standards.",
                        },
                        {
                            icon: (
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            ),
                            label: "Instant Results",
                            desc: "No signup, no paywalls. Enter your numbers and get an answer immediately.",
                        },
                    ].map(({ icon, label, desc }) => (
                        <div key={label} className="bg-white rounded-xl p-5 border border-teal-100 shadow-sm flex gap-4 items-start">
                            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <svg className="w-4.5 h-4.5 text-white w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                    {icon}
                                </svg>
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 text-sm mb-1">{label}</div>
                                <div className="text-xs text-slate-500 leading-relaxed">{desc}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── OUR MISSION ── */}
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
                <div className="text-2xl font-bold text-slate-900 mb-1">Our Mission</div>
                <p className="text-slate-700 text-sm leading-relaxed">
                    Medical Calculators Online was created to provide everyone with reliable, easy-to-use medical calculators that support evidence-based decision making. We believe that accurate health calculations should be accessible to every person, regardless of their location or resources.
                    Our mission is to bridge the gap between complex medical knowledge and everyday clinical or personal use by simplifying calculations without compromising accuracy. We aim to empower healthcare professionals, students, and individuals with tools that are intuitive, fast, and grounded in trusted medical standards.
                    We are committed to continuously improving our platform by integrating validated formulas, maintaining up-to-date medical guidelines, and ensuring a seamless user experience across all devices. By making these tools freely available, we strive to support better understanding, safer decisions, and improved health outcomes worldwide.
                </p>
            </div>

            {/* ── OUR STORY ── */}
            <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Our story</h2>
                <p className="text-slate-500 text-sm mb-12">What started as a simple idea has grown into a comprehensive health calculation platform.</p>

                <div className="relative pl-8 border-l-2 border-teal-100 space-y-0">
                    {[
                        {
                            step: "01",
                            title: "The problem",
                            body: "Finding accurate health calculations meant jumping between dozens of sites, each with different formulas and questionable accuracy. Medical professionals had their tools, but regular people were left guessing.",
                        },
                        {
                            step: "02",
                            title: "The research",
                            body: "Months went into medical journals, WHO guidelines, and clinical research papers. Every formula verified against multiple sources. The medical background made a real difference — understanding the \"why\" behind each formula, not just the arithmetic.",
                        },
                        {
                            step: "03",
                            title: "Today",
                            body: "Now with 280 calculators covering 1139+ health-related searches. From BMI to medication dosing, from pregnancy tracking to fitness planning — tools people actually need, presented so clearly that anyone can use them.",
                        },
                    ].map(({ step, title, body }, i) => (
                        <div key={step} className="relative pb-12 last:pb-0">
                            {/* Timeline dot */}
                            <div className="absolute -left-[2.85rem] top-0 w-9 h-9 rounded-full bg-white border-2 border-teal-500 flex items-center justify-center">
                                <span className="text-xs font-extrabold text-teal-600">{step}</span>
                            </div>
                            <div className="pt-1">
                                <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{body}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── DISCLAIMER ── */}
            <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
                <div className="flex gap-4 items-start bg-amber-50 border border-amber-200 rounded-xl px-5 py-5">
                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                    <div>
                        <div className="font-bold text-slate-800 text-sm mb-1">Important Medical Disclaimer</div>
                        <p className="text-slate-600 text-xs leading-relaxed">
                            We are developers and health information researchers, not medical professionals. Our calculators
                            are educational tools based on published medical research and established formulas.{" "}
                            All calculators are tested and verified by medical professionals.
                            <strong>Always consult qualified healthcare providers</strong> for medical advice, diagnosis,
                            or treatment. Never use our calculators as a substitute for professional medical consultation.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}