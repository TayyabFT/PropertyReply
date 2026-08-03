const trustCards: {
  title: string;
  paragraphs: string[];
  linkLabel: string;
}[] = [
  {
    title: "Terms & Conditions",
    paragraphs: [
      "By using PropertyReply, you agree to our terms of service. These set out the rules governing use of the platform, listing submissions, membership obligations, and liability limitations.",
      "All property listings on this platform are submitted by third parties. PropertyReply does not guarantee the accuracy, completeness, or legality of any listing. Users must conduct their own due diligence before engaging in any property transaction.",
      "Membership fees are non-refundable once a billing period has commenced. Accounts found to be in breach of terms may be suspended or permanently banned.",
    ],
    linkLabel: "Read full Terms & Conditions →",
  },
  {
    title: "Privacy Policy",
    paragraphs: [
      "We take your privacy seriously. PropertyReply processes your personal data in accordance with the UK GDPR and the Data Protection Act 2018. Data is used to provide and improve the platform, communicate with you, and fulfil our legal obligations.",
      "We use Stripe Identity as our identity verification partner. Your identity data is transmitted securely and stored in accordance with their data processing agreement. We never sell personal data to third parties.",
      "You have the right to access, correct, or delete your data at any time. Contact us at privacy@propertyreply.co.uk.",
    ],
    linkLabel: "Read full Privacy Policy →",
  },
  {
    title: "Investment Disclaimer",
    paragraphs: [
      "PropertyReply is a listing marketplace and information service. Nothing published on this platform constitutes financial, investment, legal, or tax advice.",
      "Property investment involves risk. Values can fall as well as rise. Past performance is not a reliable indicator of future returns. You should seek independent financial and legal advice before committing to any property purchase or investment strategy.",
      "All deal analysis figures are estimates only and are provided for illustrative purposes.",
    ],
    linkLabel: "Read full Disclaimer →",
  },
  {
    title: "Anti-Spam & Reporting",
    paragraphs: [
      "PropertyReply has a zero-tolerance policy for spam, fraudulent, or misleading listings. All submissions are reviewed by our moderation team before going live.",
      "If you believe a listing is inaccurate, misleading, or suspicious, please use the Report button on any listing. Reports are reviewed within 24 hours. Persistent abusers will be permanently banned and may be reported to relevant authorities.",
      "Anti-spam measures include rate limiting, CAPTCHA verification, and automated spam detection.",
    ],
    linkLabel: "Report a listing →",
  },
];

export default function Trust() {
  return (
    <section className="section section-alt" id="trust">
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">Legal & Trust</div>
          <h2>Trust, Compliance & Legal</h2>
        </div>

        <div className="trust-cards">
          {trustCards.map((card) => (
            <div className="trust-card" key={card.title}>
              <h3>{card.title}</h3>
              {card.paragraphs.map((paragraph, index) => (
                <p key={`${card.title}-p-${index}`}>{paragraph}</p>
              ))}
              <a
                href="#"
                className="inline-link"
                style={{
                  display: "block",
                  marginTop: "14px",
                  fontSize: ".85rem",
                }}
              >
                {card.linkLabel}
              </a>
            </div>
          ))}
        </div>

        <div className="card" style={{ maxWidth: "600px", marginTop: "32px" }}>
          <h3 className="mb-16">Report a Suspicious Listing</h3>
          <div className="form-group">
            <label>Listing Reference / URL</label>
            <input
              type="text"
              placeholder="e.g. propertyreply.co.uk/listing/12345"
            />
          </div>
          <div className="form-group">
            <label>Reason for Report</label>
            <select>
              <option>-- Select Reason --</option>
              <option>Fraudulent / Fake listing</option>
              <option>Incorrect pricing information</option>
              <option>Spam or duplicate listing</option>
              <option>Property does not exist</option>
              <option>Suspected scam</option>
              <option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Additional Details</label>
            <textarea
              rows={3}
              placeholder="Please provide as much detail as possible…"
            ></textarea>
          </div>
          <div className="form-group">
            <label>Your Email (optional)</label>
            <input type="email" placeholder="So we can follow up if needed" />
          </div>
          <button className="btn btn-gold">Submit Report</button>
        </div>
      </div>
    </section>
  );
}
