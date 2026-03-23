import { describe, it, expect, vi } from "vitest";
import { parsePage } from "../scanner/parser.js";

describe("browser-rendered HTML parsing", () => {
	it("should parse React SPA rendered content", () => {
		const spaHtml = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>My React App</title>
	<meta name="description" content="A React single-page application">
</head>
<body>
	<div id="root">
		<header><nav><a href="/">Home</a><a href="/about">About</a></nav></header>
		<main>
			<h1>Welcome to My App</h1>
			<p>This content was rendered by React on the client side.</p>
			<section>
				<h2>Features</h2>
				<ul>
					<li>Server-side rendering</li>
					<li>Client-side hydration</li>
					<li>Dynamic routing</li>
				</ul>
			</section>
			<script type="application/ld+json">
			{
				"@context": "https://schema.org",
				"@type": "WebApplication",
				"name": "My React App",
				"description": "A React single-page application"
			}
			</script>
		</main>
	</div>
</body>
</html>`;

		const page = parsePage("https://react-app.com", spaHtml, "https://react-app.com");

		expect(page.title).toBe("My React App");
		expect(page.metaDescription).toBe("A React single-page application");
		expect(page.headings).toHaveLength(2);
		expect(page.headings[0]).toMatchObject({ level: 1, text: "Welcome to My App" });
		expect(page.headings[1]).toMatchObject({ level: 2, text: "Features" });
		expect(page.bodyText).toContain("rendered by React");
		expect(page.schemaOrg).toHaveLength(1);
		expect((page.schemaOrg[0] as Record<string, unknown>)["@type"]).toBe("WebApplication");
		expect(page.links.length).toBeGreaterThan(0);
	});

	it("should parse Vue SPA rendered content", () => {
		const vueHtml = `<!DOCTYPE html>
<html lang="en">
<head>
	<title>Vue Dashboard</title>
	<meta name="description" content="Analytics dashboard built with Vue">
</head>
<body>
	<div id="app">
		<h1>Dashboard</h1>
		<div class="stats">
			<h2>Overview</h2>
			<p>Total users: 1,234</p>
			<p>Active sessions: 567</p>
		</div>
		<div class="charts">
			<h2>Trends</h2>
			<p>Revenue is up 15% this month.</p>
		</div>
	</div>
</body>
</html>`;

		const page = parsePage("https://vue-app.com/dashboard", vueHtml, "https://vue-app.com");

		expect(page.title).toBe("Vue Dashboard");
		expect(page.headings).toHaveLength(3);
		expect(page.bodyText).toContain("Total users");
		expect(page.bodyText).toContain("Revenue is up");
		expect(page.wordCount).toBeGreaterThan(10);
	});

	it("should handle empty SPA shell before hydration", () => {
		const emptyShell = `<!DOCTYPE html>
<html>
<head><title>Loading...</title></head>
<body>
	<div id="root"></div>
	<script src="/bundle.js"></script>
</body>
</html>`;

		const page = parsePage("https://spa.com", emptyShell, "https://spa.com");

		expect(page.title).toBe("Loading...");
		expect(page.headings).toHaveLength(0);
		expect(page.wordCount).toBe(0);
	});

	it("should parse Angular-style rendered content with data attributes", () => {
		const angularHtml = `<!DOCTYPE html>
<html lang="en">
<head>
	<title>Angular Enterprise App</title>
	<meta name="description" content="Enterprise application built with Angular">
</head>
<body>
	<app-root>
		<app-header>
			<nav><a href="/home">Home</a><a href="/products">Products</a><a href="/contact">Contact</a></nav>
		</app-header>
		<app-main>
			<h1>Our Products</h1>
			<p>Browse our complete catalog of enterprise solutions.</p>
			<app-product-list>
				<h2>Featured Products</h2>
				<div class="product"><h3>Product A</h3><p>Enterprise-grade solution for teams.</p></div>
				<div class="product"><h3>Product B</h3><p>Scalable infrastructure platform.</p></div>
			</app-product-list>
		</app-main>
	</app-root>
</body>
</html>`;

		const page = parsePage("https://angular-app.com/products", angularHtml, "https://angular-app.com");

		expect(page.title).toBe("Angular Enterprise App");
		expect(page.headings.length).toBeGreaterThanOrEqual(3);
		expect(page.bodyText).toContain("enterprise solutions");
		expect(page.links.length).toBeGreaterThanOrEqual(3);
	});
});
