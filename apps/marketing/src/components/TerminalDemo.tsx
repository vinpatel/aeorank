import { useState, useEffect, useRef } from "preact/hooks";

const COMMAND = "npx aeorank scan https://example.com";

const OUTPUT_LINES = [
	"",
	"  Scanning https://example.com...",
	"  ✓ Fetched 12 pages in 3.2s",
	"  ✓ Analyzed structure and schema",
	"  ✓ Generated 8 files",
	"",
	"  AEO Score: 42/100 (D)",
	"",
	"  Dimension              Score  Status",
	"  ─────────────────────────────────────",
	"  llms.txt Presence        0    ✗ fail",
	"  Schema.org Markup       65    ⚠ warn",
	"  Content Structure       80    ✓ pass",
	"  AI Crawler Access       30    ✗ fail",
	"  Meta Descriptions       70    ✓ pass",
	"  FAQ & Speakable         20    ✗ fail",
	"  ...",
	"",
	"  → 8 files written to ./aeo-output/",
	"  → Run again after deploying files to see improvement",
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

	// Restart loop
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
		<div style={{ borderRadius: "8px", overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.15)" }}>
			{/* Title bar */}
			<div
				style={{
					background: "#2d2d2d",
					padding: "10px 16px",
					display: "flex",
					alignItems: "center",
					gap: "8px",
				}}
			>
				<div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ff5f57" }} />
				<div style={{ width: 12, height: 12, borderRadius: "50%", background: "#febc2e" }} />
				<div style={{ width: 12, height: 12, borderRadius: "50%", background: "#28c840" }} />
				<span
					style={{
						marginLeft: "auto",
						marginRight: "auto",
						color: "#888",
						fontSize: "13px",
						fontFamily: "monospace",
					}}
				>
					Terminal
				</span>
			</div>
			{/* Terminal body */}
			<div
				style={{
					background: "#1a1a2e",
					padding: "20px",
					fontFamily: "'JetBrains Mono', ui-monospace, monospace",
					fontSize: "13px",
					lineHeight: "1.6",
					color: "#e0e0e0",
					minHeight: "380px",
				}}
			>
				<div>
					<span style={{ color: "#28c840" }}>$</span>{" "}
					<span>{typedCommand}</span>
					{phase === "typing" && (
						<span
							style={{
								display: "inline-block",
								width: "8px",
								height: "16px",
								background: "#e0e0e0",
								marginLeft: "2px",
								animation: "blink 1s step-end infinite",
							}}
						/>
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
		return <span style={{ color: "#28c840" }}>{line}</span>;
	if (line.includes("✗"))
		return <span style={{ color: "#ff5f57" }}>{line}</span>;
	if (line.includes("⚠"))
		return <span style={{ color: "#febc2e" }}>{line}</span>;
	if (line.includes("Score:"))
		return (
			<span>
				{"  AEO Score: "}
				<span style={{ color: "#febc2e", fontWeight: "bold" }}>42/100</span>
				{" (D)"}
			</span>
		);
	if (line.includes("→"))
		return <span style={{ color: "#88aaff" }}>{line}</span>;
	if (line.includes("────"))
		return <span style={{ color: "#555" }}>{line}</span>;
	return <span>{line}</span>;
}
