<?php
if (!defined('ABSPATH')) exit;

function aeorank_generate_llms_txt($config) {
    $siteName = $config['siteName'];
    $siteUrl = $config['siteUrl'];
    $description = $config['description'];
    $org = !empty($config['organization']['name']) ? "\nOrganization: {$config['organization']['name']}" : '';

    return "# {$siteName}\n\n> {$description}\n\n## About\n\n{$siteName} — {$description}\n\nWebsite: {$siteUrl}{$org}\n\n## Key Pages\n\n- {$siteUrl}/ (Home)\n- {$siteUrl}/sitemap-ai.xml (AI Sitemap)\n- {$siteUrl}/schema.json (Structured Data)";
}

function aeorank_generate_llms_full_txt($config) {
    $siteName = $config['siteName'];
    $siteUrl = $config['siteUrl'];
    $description = $config['description'];
    $org = $config['organization'];

    $content = "# {$siteName} — Full Context\n\n> {$description}\n\n## About\n\n{$siteName} is accessible at {$siteUrl}.\n";

    if (!empty($org['name'])) {
        $content .= "It is operated by {$org['name']}";
        if (!empty($org['url'])) $content .= " ({$org['url']})";
        $content .= ".\n";
    }

    $content .= "\n## Description\n\n{$description}\n\n## Key Pages\n\n- Home: {$siteUrl}/\n- AI Sitemap: {$siteUrl}/sitemap-ai.xml\n- Structured Data: {$siteUrl}/schema.json\n- FAQ Blocks: {$siteUrl}/faq-blocks.html\n- Citation Anchors: {$siteUrl}/citation-anchors.html";

    return $content;
}

function aeorank_generate_claude_md($config) {
    $siteName = $config['siteName'];
    $siteUrl = $config['siteUrl'];
    $description = $config['description'];
    $org = !empty($config['organization']['name']) ? "\nOrganization: {$config['organization']['name']}" : '';

    return "# {$siteName}\n\n{$description}\n\nSite URL: {$siteUrl}{$org}\n\n## Tech Stack\n\n- **Framework:** WordPress\n- **Plugin:** AEOrank\n\n## AEO Files\n\nThis site publishes the following AEO (AI Engine Optimization) files:\n- /llms.txt — Summary for LLM crawlers\n- /llms-full.txt — Extended context for LLM crawlers\n- /schema.json — JSON-LD structured data\n- /robots-patch.txt — AI bot access rules\n- /faq-blocks.html — FAQ with schema markup\n- /citation-anchors.html — Citation anchor examples\n- /sitemap-ai.xml — AI-optimized sitemap";
}

function aeorank_generate_schema_json($config) {
    $graph = [];

    $graph[] = [
        '@type' => 'WebSite',
        'name' => $config['siteName'],
        'url' => $config['siteUrl'],
        'description' => $config['description'],
    ];

    if (!empty($config['organization']['name'])) {
        $org = [
            '@type' => 'Organization',
            'name' => $config['organization']['name'],
            'url' => !empty($config['organization']['url']) ? $config['organization']['url'] : $config['siteUrl'],
        ];
        if (!empty($config['organization']['logo'])) {
            $org['logo'] = $config['organization']['logo'];
        }
        $graph[] = $org;
    }

    return json_encode([
        '@context' => 'https://schema.org',
        '@graph' => $graph,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
}

function aeorank_generate_robots_patch($config) {
    return "# AI Bot Access Rules — AEOrank\n# Append these rules to your robots.txt\n\nUser-agent: GPTBot\nAllow: /llms.txt\nAllow: /llms-full.txt\nAllow: /schema.json\nAllow: /sitemap-ai.xml\nAllow: /faq-blocks.html\nAllow: /citation-anchors.html\n\nUser-agent: ClaudeBot\nAllow: /llms.txt\nAllow: /llms-full.txt\nAllow: /CLAUDE.md\nAllow: /schema.json\nAllow: /sitemap-ai.xml\n\nUser-agent: PerplexityBot\nAllow: /llms.txt\nAllow: /llms-full.txt\nAllow: /schema.json\nAllow: /sitemap-ai.xml\n\nUser-agent: Google-Extended\nAllow: /llms.txt\nAllow: /llms-full.txt\nAllow: /schema.json\nAllow: /sitemap-ai.xml";
}

function aeorank_generate_faq_blocks($config) {
    $siteName = esc_html($config['siteName']);
    return "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n\t<meta charset=\"utf-8\">\n\t<title>FAQ — {$siteName}</title>\n</head>\n<body>\n\t<div itemscope itemtype=\"https://schema.org/FAQPage\">\n\t\t<h1>Frequently Asked Questions</h1>\n\t\t<!-- Add FAQ entries via the AEOrank settings or use the aeorank_faq filter -->\n\t</div>\n</body>\n</html>";
}

function aeorank_generate_citation_anchors($config) {
    $siteName = esc_html($config['siteName']);
    $siteUrl = $config['siteUrl'];
    return "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n\t<meta charset=\"utf-8\">\n\t<title>Citation Anchors — {$siteName}</title>\n</head>\n<body>\n\t<section id=\"citations\">\n\t\t<h1>Citation Anchors for {$siteName}</h1>\n\t\t<p>These anchors help AI engines cite specific sections of this site.</p>\n\t\t<ul>\n\t\t\t<li><a href=\"{$siteUrl}/#about\" id=\"about\">About {$siteName}</a></li>\n\t\t\t<li><a href=\"{$siteUrl}/#faq\" id=\"faq\">Frequently Asked Questions</a></li>\n\t\t\t<li><a href=\"{$siteUrl}/#contact\" id=\"contact\">Contact</a></li>\n\t\t</ul>\n\t</section>\n</body>\n</html>";
}

function aeorank_generate_sitemap_ai($config) {
    $siteUrl = esc_html($config['siteUrl']);
    $now = date('Y-m-d');
    return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n\t<url>\n\t\t<loc>{$siteUrl}/</loc>\n\t\t<lastmod>{$now}</lastmod>\n\t\t<changefreq>weekly</changefreq>\n\t\t<priority>1.0</priority>\n\t</url>\n\t<url>\n\t\t<loc>{$siteUrl}/llms.txt</loc>\n\t\t<lastmod>{$now}</lastmod>\n\t\t<changefreq>monthly</changefreq>\n\t\t<priority>0.8</priority>\n\t</url>\n\t<url>\n\t\t<loc>{$siteUrl}/schema.json</loc>\n\t\t<lastmod>{$now}</lastmod>\n\t\t<changefreq>monthly</changefreq>\n\t\t<priority>0.7</priority>\n\t</url>\n</urlset>";
}
