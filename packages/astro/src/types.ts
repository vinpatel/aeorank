export interface AeorankAstroConfig {
	siteName: string;
	siteUrl: string;
	description: string;
	organization?: {
		name: string;
		url?: string;
		logo?: string;
	};
	faq?: Array<{ question: string; answer: string }>;
}
