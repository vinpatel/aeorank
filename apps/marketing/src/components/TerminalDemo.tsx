import { useState, useEffect, useRef } from "preact/hooks";

const COMMAND = "npx aeorank-cli scan https://example.com";

const OUTPUT_LINES = [
	"",
	"  Scanning https://example.com...",
	"  ✓ Fetched 12 pages in 3.2s",
	"  ✓ Analyzed structure and schema",
	"  ✓ Generated 9 files",
	"",
	"  AEO Score: 42/100 (D)",
	"",
	"  Pillar                   Score  Status",
	"  ─────────────────────────────────────────",
	"  Answer Readiness           38    ✗ fail",
	"  Content Structure          55    ⚠ warn",
	"  Trust & Authority          60    ⚠ warn",
	"  Technical Foundation       30    ✗ fail",
	"  AI Discovery               45    ✗ fail",
	"",
	"  → 9 files written to ./aeo-output/",
	"  → Run again after deploying to see improvement",
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
			borderRadius: "10px",
			overflow: "hidden",
			boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 30px rgba(0,0,0,0.07)",
			border: "1px solid #E5E2DD",
			background: "#FFFFFF",
		}}>
			{/* Title bar */}
			<div style={{
				background: "#F5F3F0",
				padding: "10px 16px",
				display: "flex",
				alignItems: "center",
				gap: "8px",
				borderBottom: "1px solid #E5E2DD",
			}}>
				<div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
					<div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
					<div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
					<div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
				</div>
				<span style={{
					marginLeft: "auto",
					marginRight: "auto",
					color: "#999",
					fontSize: "12px",
					fontFamily: "'JetBrains Mono', ui-monospace, monospace",
					letterSpacing: "0.03em",
					fontWeight: 500,
				}}>
					aeorank — terminal
				</span>
				<div style={{ width: 52 }} />
			</div>
			{/* Terminal body — light theme */}
			<div style={{
				background: "#FAFAF8",
				padding: "20px 24px",
				fontFamily: "'JetBrains Mono', ui-monospace, monospace",
				fontSize: "13px",
				lineHeight: "1.7",
				color: "#333",
				minHeight: "360px",
			}}>
				<div>
					<span style={{ color: "#E8590C", fontWeight: 600 }}>$</span>{" "}
					<span style={{ color: "#111" }}>{typedCommand}</span>
					{phase === "typing" && (
						<span style={{
							display: "inline-block",
							width: "8px",
							height: "16px",
							background: "#111",
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
	if (line.includes("✓") && !line.includes("Score"))
		return <span style={{ color: "#16A34A" }}>{line}</span>;
	if (line.includes("✗"))
		return <span style={{ color: "#DC2626" }}>{line}</span>;
	if (line.includes("⚠"))
		return <span style={{ color: "#CA8A04" }}>{line}</span>;
	if (line.includes("Score:"))
		return (
			<span>
				{"  AEO Score: "}
				<span style={{ color: "#CA8A04", fontWeight: "bold", fontSize: "15px" }}>42/100</span>
				<span style={{ color: "#999" }}>{" (D)"}</span>
			</span>
		);
	if (line.includes("→"))
		return <span style={{ color: "#2563EB" }}>{line}</span>;
	if (line.includes("─────"))
		return <span style={{ color: "#D1CEC8" }}>{line}</span>;
	if (line.includes("Pillar"))
		return <span style={{ color: "#999" }}>{line}</span>;
	return <span>{line}</span>;
}
