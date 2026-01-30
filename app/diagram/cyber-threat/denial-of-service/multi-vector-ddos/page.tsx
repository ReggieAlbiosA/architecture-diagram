import type { Metadata } from "next";
import { DdosVisualizer } from "./ddos-visualizer";

export const metadata: Metadata = {
  title: "Multi-Vector DDoS Attack Visualization | Architecture Graph",
  description:
    "Interactive visualization of a multi-vector Distributed Denial of Service (DDoS) attack. Understand botnet formation, command-and-control infrastructure, traffic flooding, and service denial in real time.",
  keywords: [
    "DDoS attack",
    "distributed denial of service",
    "botnet",
    "cyber threat",
    "network security",
    "multi-vector attack",
    "C2 server",
    "traffic flooding",
  ],
};

export default function MultiVectorDdosPage() {
  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* SEO Header */}
        <header className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950 border border-red-200 dark:border-red-800 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wider">
              Cyber Threat
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Multi-Vector DDoS Attack
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            A step-by-step simulation of a Distributed Denial of Service attack
            &mdash; from botnet recruitment through command-and-control
            orchestration to complete service failure.
          </p>
        </header>

        {/* Interactive Visualization */}
        <DdosVisualizer />

        {/* SEO Content */}
        <section className="mt-12 max-w-4xl mx-auto space-y-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              How a DDoS Attack Works
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="font-semibold text-slate-900 dark:text-white">
                  Botnet Formation
                </dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-1">
                  Attackers compromise thousands of vulnerable devices (IoT
                  cameras, routers, unpatched servers) by exploiting known
                  vulnerabilities or using credential stuffing. Each infected
                  device becomes a &ldquo;bot&rdquo; in the botnet.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900 dark:text-white">
                  Command &amp; Control (C2)
                </dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-1">
                  The C2 server broadcasts attack parameters to the sleeping
                  botnet: target IP address, attack vectors (SYN flood, UDP
                  amplification, HTTP GET/POST), duration, and intensity.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900 dark:text-white">
                  Multi-Vector Flood
                </dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-1">
                  Bots simultaneously send massive volumes of traffic using
                  multiple protocols (Layer 3/4 volumetric + Layer 7
                  application), overwhelming network bandwidth, CPU, memory, and
                  connection tables.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-900 dark:text-white">
                  Service Denial
                </dt>
                <dd className="text-slate-600 dark:text-slate-400 mt-1">
                  The target server exhausts its resources and can no longer
                  process legitimate requests. Users see 503 errors, timeouts, or
                  complete connection failures.
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              Mitigation Strategies
            </h2>
            <ul className="space-y-3 text-slate-600 dark:text-slate-400">
              <li className="flex gap-3">
                <span className="text-green-500 font-bold shrink-0">01</span>
                <span>
                  <strong className="text-slate-900 dark:text-white">
                    Rate Limiting &amp; Traffic Shaping
                  </strong>{" "}
                  &mdash; Cap requests per IP and apply QoS policies to
                  deprioritise suspicious traffic patterns.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-500 font-bold shrink-0">02</span>
                <span>
                  <strong className="text-slate-900 dark:text-white">
                    Anycast &amp; CDN Distribution
                  </strong>{" "}
                  &mdash; Distribute traffic across a global network of edge
                  nodes so no single origin absorbs the full attack volume.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-500 font-bold shrink-0">03</span>
                <span>
                  <strong className="text-slate-900 dark:text-white">
                    Web Application Firewall (WAF)
                  </strong>{" "}
                  &mdash; Filter Layer 7 attacks by inspecting HTTP headers,
                  payloads, and behavioural patterns.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-green-500 font-bold shrink-0">04</span>
                <span>
                  <strong className="text-slate-900 dark:text-white">
                    BGP Blackholing &amp; Scrubbing Centers
                  </strong>{" "}
                  &mdash; Redirect attack traffic to null routes or specialised
                  cleaning facilities that strip malicious packets.
                </span>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
