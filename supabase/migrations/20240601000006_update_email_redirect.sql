-- Update the redirect URL for email confirmations
UPDATE auth.config
SET redirect_urls = array_append(redirect_urls, 'https://elastic-borg9-mp79g.dev.tempolabs.ai');
