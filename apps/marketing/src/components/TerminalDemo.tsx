import { useState, useEffect, useRef } from "preact/hooks";

const COMMAND = "npx aeorank-cli scan https://example.com";

const OUTPUT_LINES = [
	"",
	"  Scanning https://example.com...",
	"  \u2713 Fetched 12 pages in 3.2s",
	"  \u2713 Analyzed structure and schema",
	"  \u2713 Generated 8 files",
	"",
	"  AEO Score: 42/100 (D)",
	"",
	"  Dimension              Score  Status",
	"  \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500",
	"  llms.txt Presence        0    \u2717 fail",
	"  Schema.org Markup       65    \u26a0 warn",
	"  Content Structure       80    \u2713 pass",
	"  AI Crawler Access       30    \u2717 fail",
	"  Meta Descriptions       70    \u2713 pass",
	"  FAQ & Speakable         20    \u2717 fail",
	"  ...",
	"",
	"  \u2192 8 files written to ./aeo-output/",
	"  \u2192 Run again after deploying to see improvement",
];

export default function TerminalDemo() {
	const [typedCommand, setTypedCommand] = useState("");
	const [visibleLines, setVisibleLines] = useState(0);
	const [phase, setPhase] = useState<"typing" | "output" | "done">("typing");
	const timeoutRef = useRef<number | null>(null);

	useEffect(() => {
		let charIndex = 0;

		const typeNext = () => {
			if (charIndex < COMMAND.length) {
				charIndex++;
				setTypedCommand(COMMAND.slice(0, charIndex));
				timeoutRef.current = window.setTimeout(typeNext, 35 + Math.random() * 25);
			} else {
				timeoutRef.current = window.setTimeout(() => {
					setPhase("output");
				}, 500);
			}
		};

		timeoutRef.current = window.setTimeout(typeNext, 800);

		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, []);

	useEffect(() => {
		if (phase !== "output") return;

		let lineIndex = 0;
		const showNext = () => {
			if (lineIndex < OUTPUT_LINES.length) {
				lineIndex++;
				setVisibleLines(lineIndex);
				const delay = lineIndex === 6 ? 300 : lineIndex === 7 ? 200 : 60;
				timeoutRef.current = window.setTimeout(showNext, delay);
			} else {
				setPhase("done");
				timeoutRef.current = window.setTimeout(() => {
					setTypedCommand("");
					setVisibleLines(0);
					setPhase("typing");
				}, 4000);
			}
		};

		timeoutRef.current = window.setTimeout(showNext, 300);

		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, [phase]);

	useEffect(() => {
		if (phase !== "typing" || typedCommand !== "") return;

		let charIndex = 0;
		const typeNext = () => {
			if (charIndex < COMMAND.length) {
				charIndex++;
				setTypedCommand(COMMAND.slice(0, charIndex));
				timeoutRef.current = window.setTimeout(typeNext, 35 + Math.random() * 25);
			} else {
				timeoutRef.current = window.setTimeout(() => {
					setPhase("output");
				}, 500);
			}
		};

		timeoutRef.current = window.setTimeout(typeNext, 800);

		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, [phase, typedCommand]);

	return (
		<div style={{
			borderRadius: "14px",
			overflow: "hidden",
			boxShadow: "0 0 0 1px rgba(232, 89, 12, 0.08), 0 12px 50px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3), 0 0 80px rgba(232, 89, 12, 0.06)",
			border: "1px solid rgba(255,255,255,0.06)",
		}}>
			{/* Title bar - macOS style */}
			<div style={{
				background: "linear-gradient(180deg, #1e1e22 0%, #1a1a1e 100%)",
				padding: "13px 16px",
				display: "flex",
				alignItems: "center",
				gap: "8px",
				borderBottom: "1px solid rgba(255,255,255,0.04)",
			}}>
				<div style={{
					display: "flex",
					alignItems: "center",
					gap: "7px",
				}}>
					<div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57", boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.15)" }} />
					<div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e", boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.15)" }} />
					<div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840", boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.15)" }} />
				</div>
				<span style={{
					marginLeft: "auto",
					marginRight: "auto",
					color: "#555",
					fontSize: "12px",
					fontFamily: "'JetBrains Mono', ui-monospace, monospace",
					letterSpacing: "0.05em",
					fontWeight: 500,
				}}>
					aeorank
				</span>
				<div style={{ width: 52 }} />
			</div>
			{/* Terminal body */}
			<div style={{
				background: "linear-gradient(180deg, #0c0c0e 0%, #09090b 100%)",
				padding: "24px",
				fontFamily: "'JetBrains Mono', ui-monospace, monospace",
				fontSize: "13px",
				lineHeight: "1.7",
				color: "#d4d4d8",
				minHeight: "380px",
			}}>
				<div>
					<span style={{ color: "#E8590C", fontWeight: 600 }}>$</span>{" "}
					<span style={{ color: "#e4e4e7" }}>{typedCommand}</span>
					{phase === "typing" && (
						<span style={{
							display: "inline-block",
							width: "8px",
							height: "16px",
							background: "#E8590C",
							marginLeft: "2px",
							verticalAlign: "text-bottom",
							animation: "blink 1s step-end infinite",
						}} />
					)}
				</div>
				{OUTPUT_LINES.slice(0, visibleLines).map((line, i) => (
					<div key={i} style={{ whiteSpace: "pre" }}>
						{colorize(line)}
					</div>
				))}
			</div>
			<style>{`
				@keyframes blink {
					50% { opacity: 0; }
				}
			`}</style>
		</div>
	);
}

function colorize(line: string) {
	if (line.includes("\u2713") && !line.includes("Score"))
		return <span style={{ color: "#4ade80" }}>{line}</span>;
	if (line.includes("\u2717"))
		return <span style={{ color: "#f87171" }}>{line}</span>;
	if (line.includes("\u26a0"))
		return <span style={{ color: "#fbbf24" }}>{line}</span>;
	if (line.includes("Score:"))
		return (
			<span>
				{"  AEO Score: "}
				<span style={{ color: "#fbbf24", fontWeight: "bold", fontSize: "15px" }}>42/100</span>
				<span style={{ color: "#71717a" }}>{" (D)"}</span>
			</span>
		);
	if (line.includes("\u2192"))
		return <span style={{ color: "#93c5fd" }}>{line}</span>;
	if (line.includes("\u2500\u2500\u2500\u2500"))
		return <span style={{ color: "#27272a" }}>{line}</span>;
	if (line.includes("Dimension"))
		return <span style={{ color: "#71717a" }}>{line}</span>;
	return <span>{line}</span>;
}
