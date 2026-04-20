import type { CSSProperties } from "react";
import styles from "./AeorankMark.module.css";

interface AeorankMarkProps {
	size?: number;
	className?: string;
}

export function AeorankMark({ size = 28, className = "" }: AeorankMarkProps) {
	const style = { "--aeo-mark-size": `${size}px` } as CSSProperties;
	return (
		<span className={`${styles.mark} ${className}`} style={style}>
			<svg
				width={size}
				height={size}
				viewBox="0 0 32 32"
				fill="none"
				aria-hidden="true"
			>
				<rect
					className={styles.bg}
					width="32"
					height="32"
					rx="7"
					fill="currentColor"
				/>
				<path
					className={styles.v}
					d="M8 22L13.5 10H18.5L24 22"
					stroke="#fff"
					strokeWidth="2.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path
					className={styles.bar}
					d="M10.5 18H21.5"
					stroke="#fff"
					strokeWidth="2.5"
					strokeLinecap="round"
				/>
			</svg>
		</span>
	);
}
