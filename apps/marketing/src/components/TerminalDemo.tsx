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
			fontFamily: "'JetBrains Mono', ui-monospace, monospace",
			fontSize: "13px",
			lineHeight: "1.75",
			color: "#C8C8D4",
			padding: "20px 24px",
			minHeight: "340px",
			background: "transparent",
		}}>
			<div>
				<span style={{ color: "#E8590C", fontWeight: 600 }}>$</span>{" "}
				<span style={{ color: "#EDEDF0" }}>{typedCommand}</span>
				{phase === "typing" && (
					<span style={{
						display: "inline-block",
						width: "7px",
						height: "15px",
						background: "#EDEDF0",
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
		return <span style={{ color: "#22C55E" }}>{line}</span>;
	if (line.includes("✗"))
		return <span style={{ color: "#F87171" }}>{line}</span>;
	if (line.includes("⚠"))
		return <span style={{ color: "#EAB308" }}>{line}</span>;
	if (line.includes("Score:"))
		return (
			<span>
				{"  AEO Score: "}
				<span style={{ color: "#EAB308", fontWeight: "bold", fontSize: "15px" }}>42/100</span>
				<span style={{ color: "#5C5C6E" }}>{" (D)"}</span>
			</span>
		);
	if (line.includes("→"))
		return <span style={{ color: "#06B6D4" }}>{line}</span>;
	if (line.includes("─────"))
		return <span style={{ color: "#2A2A3A" }}>{line}</span>;
	if (line.includes("Pillar"))
		return <span style={{ color: "#5C5C6E" }}>{line}</span>;
	return <span>{line}</span>;
}
