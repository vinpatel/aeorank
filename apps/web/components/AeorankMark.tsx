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
			<svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
				<rect width="32" height="32" rx="7" fill="#0A0B0F" />
				<path
					className={styles.arcOuter}
					d="M6.943 23.133 A13.078 13.078 0 0 1 27.107 6.511"
					stroke="#3DFFB5"
					strokeWidth="0.922"
					strokeLinecap="butt"
				/>
				<path
					className={styles.arcInner}
					d="M10.039 20.800 A9.202 9.202 0 0 1 24.226 9.105"
					stroke="#3DFFB5"
					strokeWidth="0.694"
					strokeLinecap="butt"
				/>
				<circle className={styles.dot} cx="13.918" cy="13.333" r="1.425" fill="#3DFFB5" />
				<polygon points="17.352,14.502 17.352,19.470 6.539,30.283 6.539,25.315" fill="#F2F2F3" />
				<polygon points="17.425,14.502 17.425,19.470 28.237,30.283 28.237,25.315" fill="#3DFFB5" />
			</svg>
		</span>
	);
}
