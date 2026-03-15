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
			borderRadius: "12px",
			overflow: "hidden",
			boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
			border: "1px solid rgba(0,0,0,0.06)",
		}}>
			{/* Title bar */}
			<div style={{
				background: "#1e1e1e",
				padding: "12px 16px",
				display: "flex",
				alignItems: "center",
				gap: "8px",
			}}>
				<div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
				<div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
				<div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
				<span style={{
					marginLeft: "auto",
					marginRight: "auto",
					color: "#666",
					fontSize: "12px",
					fontFamily: "'JetBrains Mono', monospace",
					letterSpacing: "0.02em",
				}}>
					aeorank
				</span>
			</div>
			{/* Terminal body */}
			<div style={{
				background: "#0f0f0f",
				padding: "24px",
				fontFamily: "'JetBrains Mono', ui-monospace, monospace",
				fontSize: "13px",
				lineHeight: "1.7",
				color: "#d4d4d4",
				minHeight: "380px",
			}}>
				<div>
					<span style={{ color: "#E8590C" }}>$</span>{" "}
					<span style={{ color: "#e0e0e0" }}>{typedCommand}</span>
					{phase === "typing" && (
						<span style={{
							display: "inline-block",
							width: "8px",
							height: "16px",
							background: "#E8590C",
							marginLeft: "2px",
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
				<span style={{ color: "#fbbf24", fontWeight: "bold", fontSize: "14px" }}>42/100</span>
				<span style={{ color: "#888" }}>{" (D)"}</span>
			</span>
		);
	if (line.includes("\u2192"))
		return <span style={{ color: "#93c5fd" }}>{line}</span>;
	if (line.includes("\u2500\u2500\u2500\u2500"))
		return <span style={{ color: "#333" }}>{line}</span>;
	return <span>{line}</span>;
}
