const notifications: {
  unread?: boolean;
  iconBg: string;
  icon: string;
  title: string;
  body: string;
  time: string;
}[] = [
  {
    unread: true,
    iconBg: "rgba(34,200,122,.15)",
    icon: "🏠",
    title: "New BMV Deal Matching Your Search",
    body: "A new 3-bed house in Manchester has been listed at 31% below market value. Asking price: £122,000.",
    time: "2 minutes ago · via Email & Platform",
  },
  {
    unread: true,
    iconBg: "rgba(212,168,67,.15)",
    icon: "✅",
    title: "Your Listing Has Been Approved",
    body: 'Your submission "Commercial Unit – Leeds" has been reviewed and is now live on the marketplace.',
    time: "1 hour ago · Platform",
  },
  {
    iconBg: "rgba(74,96,128,.15)",
    icon: "💳",
    title: "Membership Renewal Reminder",
    body: "Your Premium membership renews in 7 days on 18 June 2026 for £29.00. Update billing details if needed.",
    time: "Yesterday · Email",
  },
  {
    iconBg: "rgba(34,200,122,.15)",
    icon: "💰",
    title: "Affiliate Commission Earned",
    body: "T. Ahmed upgraded to VIP. You've earned £23.70 commission. Total this month: £85.00.",
    time: "2 days ago · Email",
  },
  {
    iconBg: "rgba(232,64,64,.15)",
    icon: "❌",
    title: "Listing Rejected — 2-Bed Flat, Sheffield",
    body: "Your listing was rejected as the discount percentage could not be verified. Please resubmit with updated evidence.",
    time: "5 days ago · Email & Platform",
  },
  {
    iconBg: "rgba(74,96,128,.15)",
    icon: "🔐",
    title: "New Login Detected",
    body: "New sign-in from Manchester, UK at 09:14 on 6 June 2026. If this wasn't you, please secure your account.",
    time: "5 days ago · Email",
  },
];

export default function Notifications() {
  return (
    <section className="section section-dark" id="notifications">
      <div className="container">
        <div className="flex-between mb-32">
          <div>
            <div className="tag mb-8">Notifications</div>
            <h2>Your Alerts</h2>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-outline btn-sm">Mark All Read</button>
            <button className="btn btn-outline btn-sm">Settings</button>
          </div>
        </div>

        <div className="card" style={{ maxWidth: "760px" }}>
          {notifications.map((notif) => (
            <div
              className={notif.unread ? "notif-item notif-unread" : "notif-item"}
              key={notif.title}
            >
              <div className="notif-icon" style={{ background: notif.iconBg }}>
                {notif.icon}
              </div>
              <div className="notif-body">
                <h5>{notif.title}</h5>
                <p>{notif.body}</p>
                <div className="time">{notif.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
