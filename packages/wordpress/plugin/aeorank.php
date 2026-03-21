<?php
/**
 * Plugin Name: AEOrank
 * Plugin URI: https://aeorank.dev
 * Description: Generate AEO (AI Engine Optimization) files for your WordPress site — llms.txt, schema.json, robots-patch.txt, and more.
 * Version: 0.0.1
 * Author: AEOrank
 * Author URI: https://aeorank.dev
 * License: MIT
 */

if (!defined('ABSPATH')) exit;

define('AEORANK_VERSION', '0.0.1');
define('AEORANK_PLUGIN_DIR', plugin_dir_path(__FILE__));

// Register activation hook to flush rewrite rules
register_activation_hook(__FILE__, 'aeorank_activate');
register_deactivation_hook(__FILE__, 'aeorank_deactivate');

function aeorank_activate() {
    aeorank_register_routes();
    flush_rewrite_rules();
}

function aeorank_deactivate() {
    flush_rewrite_rules();
}

// Register settings
add_action('admin_menu', 'aeorank_admin_menu');
add_action('admin_init', 'aeorank_register_settings');

function aeorank_admin_menu() {
    add_options_page(
        'AEOrank Settings',
        'AEOrank',
        'manage_options',
        'aeorank',
        'aeorank_settings_page'
    );
}

function aeorank_register_settings() {
    register_setting('aeorank_settings', 'aeorank_site_name');
    register_setting('aeorank_settings', 'aeorank_description');
    register_setting('aeorank_settings', 'aeorank_org_name');
    register_setting('aeorank_settings', 'aeorank_org_url');
    register_setting('aeorank_settings', 'aeorank_org_logo');
}

function aeorank_settings_page() {
    ?>
    <div class="wrap">
        <h1>AEOrank Settings</h1>
        <form method="post" action="options.php">
            <?php settings_fields('aeorank_settings'); ?>
            <table class="form-table">
                <tr>
                    <th><label for="aeorank_site_name">Site Name</label></th>
                    <td><input type="text" id="aeorank_site_name" name="aeorank_site_name" value="<?php echo esc_attr(get_option('aeorank_site_name', get_bloginfo('name'))); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label for="aeorank_description">Description</label></th>
                    <td><textarea id="aeorank_description" name="aeorank_description" class="large-text" rows="3"><?php echo esc_textarea(get_option('aeorank_description', get_bloginfo('description'))); ?></textarea></td>
                </tr>
                <tr>
                    <th><label for="aeorank_org_name">Organization Name</label></th>
                    <td><input type="text" id="aeorank_org_name" name="aeorank_org_name" value="<?php echo esc_attr(get_option('aeorank_org_name', '')); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label for="aeorank_org_url">Organization URL</label></th>
                    <td><input type="url" id="aeorank_org_url" name="aeorank_org_url" value="<?php echo esc_attr(get_option('aeorank_org_url', '')); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label for="aeorank_org_logo">Organization Logo URL</label></th>
                    <td><input type="url" id="aeorank_org_logo" name="aeorank_org_logo" value="<?php echo esc_attr(get_option('aeorank_org_logo', '')); ?>" class="regular-text"></td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// Get config from WP settings
function aeorank_get_config() {
    return [
        'siteName' => get_option('aeorank_site_name', get_bloginfo('name')),
        'siteUrl' => rtrim(home_url(), '/'),
        'description' => get_option('aeorank_description', get_bloginfo('description')),
        'organization' => [
            'name' => get_option('aeorank_org_name', ''),
            'url' => get_option('aeorank_org_url', ''),
            'logo' => get_option('aeorank_org_logo', ''),
        ],
    ];
}

// Register REST API routes
add_action('init', 'aeorank_register_routes');

function aeorank_register_routes() {
    add_rewrite_rule('^llms\.txt$', 'index.php?aeorank_file=llms.txt', 'top');
    add_rewrite_rule('^llms-full\.txt$', 'index.php?aeorank_file=llms-full.txt', 'top');
    add_rewrite_rule('^CLAUDE\.md$', 'index.php?aeorank_file=CLAUDE.md', 'top');
    add_rewrite_rule('^schema\.json$', 'index.php?aeorank_file=schema.json', 'top');
    add_rewrite_rule('^robots-patch\.txt$', 'index.php?aeorank_file=robots-patch.txt', 'top');
    add_rewrite_rule('^faq-blocks\.html$', 'index.php?aeorank_file=faq-blocks.html', 'top');
    add_rewrite_rule('^citation-anchors\.html$', 'index.php?aeorank_file=citation-anchors.html', 'top');
    add_rewrite_rule('^sitemap-ai\.xml$', 'index.php?aeorank_file=sitemap-ai.xml', 'top');
}

add_filter('query_vars', function($vars) {
    $vars[] = 'aeorank_file';
    return $vars;
});

add_action('template_redirect', 'aeorank_serve_file');

function aeorank_serve_file() {
    $file = get_query_var('aeorank_file');
    if (!$file) return;

    $config = aeorank_get_config();
    $content_types = [
        'llms.txt' => 'text/plain; charset=utf-8',
        'llms-full.txt' => 'text/plain; charset=utf-8',
        'CLAUDE.md' => 'text/plain; charset=utf-8',
        'schema.json' => 'application/ld+json; charset=utf-8',
        'robots-patch.txt' => 'text/plain; charset=utf-8',
        'faq-blocks.html' => 'text/html; charset=utf-8',
        'citation-anchors.html' => 'text/html; charset=utf-8',
        'sitemap-ai.xml' => 'application/xml; charset=utf-8',
    ];

    $generators = [
        'llms.txt' => 'aeorank_generate_llms_txt',
        'llms-full.txt' => 'aeorank_generate_llms_full_txt',
        'CLAUDE.md' => 'aeorank_generate_claude_md',
        'schema.json' => 'aeorank_generate_schema_json',
        'robots-patch.txt' => 'aeorank_generate_robots_patch',
        'faq-blocks.html' => 'aeorank_generate_faq_blocks',
        'citation-anchors.html' => 'aeorank_generate_citation_anchors',
        'sitemap-ai.xml' => 'aeorank_generate_sitemap_ai',
    ];

    if (!isset($generators[$file])) return;

    $content = call_user_func($generators[$file], $config);
    $content_type = $content_types[$file] ?? 'text/plain; charset=utf-8';

    header("Content-Type: $content_type");
    header("Cache-Control: public, max-age=3600, s-maxage=86400");
    header("X-AEOrank: 1");
    echo $content;
    exit;
}

// Include generators
require_once AEORANK_PLUGIN_DIR . 'generators.php';
