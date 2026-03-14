import { describe, it, expect } from "vitest";
import { validateScanUrl } from "./validate-url.js";

describe("validateScanUrl", () => {
	// Test 1: Valid HTTPS URL returns normalized URL string
	it("accepts valid HTTPS URL", () => {
		const result = validateScanUrl("https://example.com");
		expect(result).toBe("https://example.com/");
	});

	// Test 2: Valid HTTP URL returns normalized URL string
	it("accepts valid HTTP URL", () => {
		const result = validateScanUrl("http://example.com/path");
		expect(result).toBe("http://example.com/path");
	});

	// Test 3: Throws on non-HTTP scheme
	it("throws on ftp:// scheme", () => {
		expect(() => validateScanUrl("ftp://example.com")).toThrow(
			/Only HTTP\/HTTPS URLs are allowed/,
		);
	});

	// Test 4: Throws on localhost
	it("throws on localhost", () => {
		expect(() => validateScanUrl("http://localhost:3000")).toThrow(
			/Private\/loopback hosts are not allowed/,
		);
	});

	// Test 5: Throws on 127.0.0.1
	it("throws on 127.0.0.1", () => {
		expect(() => validateScanUrl("http://127.0.0.1")).toThrow(
			/Private\/loopback hosts are not allowed/,
		);
	});

	// Test 6: Throws on ::1 (IPv6 loopback)
	it("throws on ::1 IPv6 loopback", () => {
		expect(() => validateScanUrl("http://[::1]")).toThrow(
			/Private\/loopback hosts are not allowed/,
		);
	});

	// Test 7: Throws on 10.x.x.x private range
	it("throws on 10.x.x.x private range", () => {
		expect(() => validateScanUrl("http://10.0.0.1")).toThrow(
			/Private IP ranges are not allowed/,
		);
	});

	// Test 8: Throws on 172.16.x.x private range
	it("throws on 172.16.x.x private range", () => {
		expect(() => validateScanUrl("http://172.16.0.1")).toThrow(
			/Private IP ranges are not allowed/,
		);
	});

	// Test 9: Throws on 192.168.x.x private range
	it("throws on 192.168.x.x private range", () => {
		expect(() => validateScanUrl("http://192.168.1.1")).toThrow(
			/Private IP ranges are not allowed/,
		);
	});

	// Test 10: Throws on 169.254.x.x (AWS metadata)
	it("throws on 169.254.x.x AWS metadata IP", () => {
		expect(() => validateScanUrl("http://169.254.169.254")).toThrow(
			/Private IP ranges are not allowed/,
		);
	});

	// Test 11: Throws on malformed URL
	it("throws on malformed URL", () => {
		expect(() => validateScanUrl("not-a-url")).toThrow(/Invalid URL format/);
	});

	// Test 12: Throws on empty string
	it("throws on empty string", () => {
		expect(() => validateScanUrl("")).toThrow(/Invalid URL format/);
	});
});
