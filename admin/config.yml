backend:
  name: github
  repo: lilian23031999-bit/nail-lovers   # <- change to your repo
  branch: main
site_url: https://naillovers.netlify.app
display_url: https://naillovers.netlify.app
media_folder: images/uploads
public_folder: /images/uploads
# local_backend: true   # uncomment to test the dashboard locally

collections:
  - name: site
    label: Website Content
    files:
      - name: services
        label: Services & Prices
        file: content/services.json
        fields:
          - label: Services
            name: items
            widget: list
            summary: "{{fields.icon}} {{fields.name}} {{fields.price}}"
            fields:
              - { label: Icon (emoji), name: icon, widget: string }
              - { label: Service Name, name: name, widget: string }
              - { label: Description, name: description, widget: text }
              - { label: "Price (e.g. From ₦15,000)", name: price, widget: string, required: false }

      - name: promotions
        label: Promotions
        file: content/promotions.json
        fields:
          - { label: Show announcement bar at top, name: banner_enabled, widget: boolean, default: false }
          - { label: Announcement text, name: banner_text, widget: string, required: false }
          - { label: Announcement link, name: banner_link, widget: string, required: false, default: "#booking" }
          - label: Promotions
            name: items
            widget: list
            summary: "{{fields.title}} ({{fields.badge}})"
            fields:
              - { label: Active (show on site), name: active, widget: boolean, default: true }
              - { label: Title, name: title, widget: string }
              - { label: Description, name: description, widget: text }
              - { label: "Badge (e.g. 10% OFF)", name: badge, widget: string, required: false }
              - { label: Promo code, name: code, widget: string, required: false }
              - { label: "Ends on (auto-hides after this date)", name: expires, widget: datetime, time_format: false, date_format: "YYYY-MM-DD", format: "YYYY-MM-DD", required: false }

      - name: gallery
        label: Gallery
        file: content/gallery.json
        fields:
          - { label: Video link, name: video_url, widget: string, required: false }
          - { label: Video button text, name: video_label, widget: string }
          - label: Photos
            name: items
            widget: list
            summary: "{{fields.label}}"
            fields:
              - { label: Photo, name: image, widget: image }
              - { label: Description for Google (alt text), name: alt, widget: string }
              - { label: Hover label, name: label, widget: string }

      - name: testimonials
        label: Testimonials
        file: content/testimonials.json
        fields:
          - label: Testimonials
            name: items
            widget: list
            summary: "{{fields.name}}"
            fields:
              - { label: Client name, name: name, widget: string }
              - { label: Service, name: service, widget: string }
              - { label: Review, name: text, widget: text }

      - name: faq
        label: FAQ
        file: content/faq.json
        fields:
          - label: Questions
            name: items
            widget: list
            summary: "{{fields.question}}"
            fields:
              - { label: Question, name: question, widget: string }
              - { label: Answer, name: answer, widget: text }

      - name: settings
        label: Contact, Booking & SEO
        file: content/settings.json
        fields:
          - { label: Website name, name: site_title, widget: string }
          - { label: Live website address, name: site_url, widget: string, hint: "Used for Google (SEO). No trailing slash." }
          - { label: SEO description (150-160 characters), name: seo_description, widget: text }
          - { label: SEO keywords, name: seo_keywords, widget: string }
          - { label: "Google Search Console verification code (only the content value from the meta tag)", name: google_verification, widget: string, required: false }
          - { label: Logo first part, name: brand_main, widget: string }
          - { label: Logo script part, name: brand_script, widget: string }
          - { label: Hero small tag, name: hero_tag, widget: string }
          - { label: Hero title, name: hero_title, widget: string }
          - { label: Hero highlighted words, name: hero_accent, widget: string }
          - { label: Hero text, name: hero_text, widget: text }
          - { label: Hero image, name: hero_image, widget: image }
          - { label: Hero image description, name: hero_image_alt, widget: string }
          - label: Hero stats
            name: stats
            widget: list
            fields:
              - { label: Number, name: num, widget: string }
              - { label: Label, name: label, widget: string }
          - { label: About photo, name: about_image, widget: image }
          - { label: About photo description, name: about_image_alt, widget: string }
          - { label: Badge title, name: about_badge_title, widget: string }
          - { label: Badge name, name: about_badge_name, widget: string }
          - { label: About small tag, name: about_tag, widget: string }
          - { label: About title, name: about_title, widget: string }
          - { label: About bio (blank line = new paragraph, **bold**), name: about_bio, widget: text }
          - { label: Quote, name: about_quote, widget: text }
          - { label: WhatsApp number (international, no +), name: whatsapp, widget: string }
          - { label: Phone shown on site, name: phone, widget: string }
          - { label: Email, name: email, widget: string }
          - { label: Instagram link, name: instagram_url, widget: string }
          - { label: Instagram handle, name: instagram_handle, widget: string }
          - { label: Location, name: location, widget: string }
          - { label: Booking form services, name: booking_services, widget: list, field: { label: Service, name: service, widget: string } }
          - { label: Booking time slots, name: time_slots, widget: list, field: { label: Time, name: time, widget: string } }
          - { label: Booking note, name: booking_note, widget: string }
          - { label: Contact email note, name: form_email_note, widget: string, required: false }
