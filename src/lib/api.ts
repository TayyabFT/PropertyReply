const API_URL = "https://property-relpy-backend.vercel.app/api";

export type ApiUser = {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  plan: string | null;
  subscriptionStatus?: "none" | "active" | "past_due" | "canceled";
  role: "user" | "admin";
  status: "active" | "suspended" | "banned";
  kycStatus?:
    | "pending"
    | "in_progress"
    | "approved"
    | "rejected"
    | "consider";
  isEmailVerified?: boolean;
  initials: string;
  phone?: string;
  location?: string;
  investorType?: string;
  notificationPrefs?: string[];
  createdAt?: string;
};

type AuthPayload = {
  success: boolean;
  message?: string;
  data: {
    user: ApiUser;
    token: string;
  };
};

type MePayload = {
  success: boolean;
  data: {
    user: ApiUser;
  };
};

export class ApiRequestError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok || json.success === false) {
    throw new ApiRequestError(
      json.message || "Something went wrong. Please try again.",
      response.status,
    );
  }

  return json as T;
}

export const authApi = {
  register(body: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    return request<AuthPayload>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  login(body: { email: string; password: string }) {
    return request<AuthPayload>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  me(token: string) {
    return request<MePayload>("/auth/me", { method: "GET" }, token);
  },

  updateProfile(
    token: string,
    body: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      location?: string;
      investorType?: string;
      notificationPrefs?: string[];
    },
  ) {
    return request<MePayload>(
      "/auth/profile",
      { method: "PATCH", body: JSON.stringify(body) },
      token,
    );
  },

  changePassword(
    token: string,
    body: { currentPassword: string; newPassword: string },
  ) {
    return request<{ success: boolean; message: string }>(
      "/auth/change-password",
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },

  logout(token: string) {
    return request<{ success: boolean; message: string }>(
      "/auth/logout",
      { method: "POST" },
      token,
    );
  },

  forgotPassword(body: { email: string }) {
    return request<{ success: boolean; message: string }>(
      "/auth/forgot-password",
      { method: "POST", body: JSON.stringify(body) },
    );
  },

  resetPassword(body: { token: string; newPassword: string }) {
    return request<{ success: boolean; message: string }>(
      "/auth/reset-password",
      { method: "POST", body: JSON.stringify(body) },
    );
  },

  verifyEmail(body: { token: string }) {
    return request<{ success: boolean; message: string; user?: ApiUser }>(
      "/auth/verify-email",
      { method: "POST", body: JSON.stringify(body) },
    );
  },

  resendVerification(body: { email: string }) {
    return request<{ success: boolean; message: string }>(
      "/auth/resend-verification",
      { method: "POST", body: JSON.stringify(body) },
    );
  },
};

export type OverviewStat = {
  label: string;
  value: string;
  valueClass?: string;
  change: string;
  trend: "up" | "neutral" | "down";
};

export type OverviewMembership = {
  plan: string;
  status: string;
  billingLabel: string;
  renewsAt: string;
  price: string;
  badgeLabel: string;
  badgeClass: string;
};

export type OverviewSubmission = {
  id: string;
  property: string;
  location: string;
  price: string;
  discount: string;
  status: string;
  statusKey: string;
  statusColor: string;
  submitted: string;
};

export type OverviewSavedProperty = {
  id: string;
  title: string;
  meta: string;
};

export type OverviewData = {
  stats: OverviewStat[];
  membership: OverviewMembership;
  submissions: OverviewSubmission[];
  savedProperties: OverviewSavedProperty[];
  savedCount: number;
};

type OverviewPayload = {
  success: boolean;
  data: OverviewData;
};

export const overviewApi = {
  get(token: string) {
    return request<OverviewPayload>("/overview", { method: "GET" }, token);
  },

  removeSaved(token: string, id: string) {
    return request<{ success: boolean; message: string; data: { deleted: boolean } }>(
      `/overview/saved/${id}`,
      { method: "DELETE" },
      token,
    );
  },
};

export type ListingTag = {
  label: string;
  badge?: string;
};

export type ListingProperty = {
  id: string;
  placeholder: string;
  discount: string;
  featured?: boolean;
  lock?: {
    label: string;
    buttonText: string;
  };
  title: string;
  location: string;
  asking: string;
  market: string;
  saving?: string;
  tags: ListingTag[];
  footerButtonLabel: string;
  footerButtonClass: string;
  meta: string;
  isSaved: boolean;
  isLocked: boolean;
  canAccess: boolean;
  accessTier: string;
  propertyType: string;
  bedrooms: number;
  yieldPercent: number | null;
  strategies: string[];
  saveCount: number;
};

export type ListingDetail = ListingProperty & {
  description: string;
  sellerName: string;
  postcode: string;
  askingPrice: number;
  marketValue: number;
  discountPercent: number;
};

export type ListingsFilterOptions = {
  propertyTypes: { value: string; label: string }[];
  priceRanges: {
    value: string;
    label: string;
    min: number | null;
    max: number | null;
  }[];
  minDiscounts: { value: string; label: string }[];
  strategies: { value: string; label: string }[];
  bedrooms: { value: string; label: string }[];
  sortOptions: { value: string; label: string }[];
};

export type ListingsQuery = {
  location?: string;
  propertyType?: string;
  priceRange?: string;
  minDiscount?: string;
  strategy?: string;
  bedrooms?: string;
  sort?: string;
  page?: number;
  limit?: number;
};

export type ListingsData = {
  summary: {
    showing: number;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    lastUpdated: string;
    summaryText: string;
  };
  sort: string;
  filters: {
    location: string;
    propertyType: string;
    priceRange: string;
    minDiscount: string;
    strategy: string;
    bedrooms: string;
  };
  properties: ListingProperty[];
  pagination: {
    page: number;
    totalPages: number;
    hasPrev: boolean;
    hasNext: boolean;
  };
};

type ListingsPayload = {
  success: boolean;
  data: ListingsData;
};

type ListingFiltersPayload = {
  success: boolean;
  data: ListingsFilterOptions;
};

type ListingDetailPayload = {
  success: boolean;
  data: ListingDetail;
};

type ListingSavePayload = {
  success: boolean;
  message: string;
  data: { saved: boolean; saveCount: number };
};

type SavedListingsPayload = {
  success: boolean;
  data: { id: string; savedAt: string }[];
};

function listingsQueryString(query: ListingsQuery = {}) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const listingsApi = {
  getFilters(token: string) {
    return request<ListingFiltersPayload>(
      "/listings/filters",
      { method: "GET" },
      token,
    );
  },

  getListings(token: string, query: ListingsQuery = {}) {
    return request<ListingsPayload>(
      `/listings${listingsQueryString(query)}`,
      { method: "GET" },
      token,
    );
  },

  getById(token: string, id: string) {
    return request<ListingDetailPayload>(
      `/listings/${id}`,
      { method: "GET" },
      token,
    );
  },

  save(token: string, id: string) {
    return request<ListingSavePayload>(
      `/listings/${id}/save`,
      { method: "POST" },
      token,
    );
  },

  unsave(token: string, id: string) {
    return request<ListingSavePayload>(
      `/listings/${id}/save`,
      { method: "DELETE" },
      token,
    );
  },

  getSaved(token: string) {
    return request<SavedListingsPayload>(
      "/listings/saved",
      { method: "GET" },
      token,
    );
  },
};

export type DealAnalysisCalcRow = {
  label: string;
  value: string;
  valueClass?: string;
};

export type DealAnalysisMetric = {
  label: string;
  value: string;
  valueClass?: string;
  sub: string;
};

export type DealAnalysisDeal = {
  id: string;
  title: string;
  location: string;
  discountPercent: number;
  askingPrice: number;
  propertyType: string;
  hasFullAnalysis: boolean;
};

export type DealAnalysisContactField = {
  label: string;
  value: string;
  locked?: boolean;
};

export type DealAnalysisData = {
  listingId: string;
  title: string;
  pageTitle: string;
  featureBadge: string;
  userPlan: string;
  hasFullAccess: boolean;
  isSaved: boolean;
  header: {
    address: string;
    sellerLine: string;
    kycPassed: boolean;
    kycBadge: string;
  };
  actions: {
    canSave: boolean;
    canReport: boolean;
    canContact: boolean;
  };
  metrics: DealAnalysisMetric[];
  discountMeter: {
    percent: number;
    label: string;
    fillWidth: number;
  };
  flipAnalysis:
    | {
        locked?: false;
        rows: DealAnalysisCalcRow[];
        total: DealAnalysisCalcRow;
      }
    | {
        locked: true;
        message: string;
      };
  btlAnalysis:
    | {
        locked?: false;
        rows: DealAnalysisCalcRow[];
        total: DealAnalysisCalcRow;
      }
    | {
        locked: true;
        message: string;
      };
  sellerDescription: string;
  comparableRange: string;
  contact: {
    locked: boolean;
    badge: string | null;
    fields: DealAnalysisContactField[];
  };
  reportReasons: { value: string; label: string }[];
};

export type DealAnalysisDealsData = {
  deals: DealAnalysisDeal[];
  userPlan: string;
  hasFullAccess: boolean;
  total: number;
};

export type DealAnalysisContactData = {
  listingId: string;
  title: string;
  contact: {
    name: string;
    phone: string;
    email: string;
    role: string;
  };
};

type DealAnalysisPayload = {
  success: boolean;
  data: DealAnalysisData;
};

type DealAnalysisDealsPayload = {
  success: boolean;
  data: DealAnalysisDealsData;
};

type DealAnalysisContactPayload = {
  success: boolean;
  data: DealAnalysisContactData;
};

type DealAnalysisReportPayload = {
  success: boolean;
  message: string;
  data: { id: string; status: string; message: string };
};

type DealAnalysisSavePayload = {
  success: boolean;
  message: string;
  data: { saved: boolean; saveCount: number };
};

type ReportReasonsPayload = {
  success: boolean;
  data: { value: string; label: string }[];
};

export const dealAnalysisApi = {
  getDeals(token: string) {
    return request<DealAnalysisDealsPayload>(
      "/deal-analysis/deals",
      { method: "GET" },
      token,
    );
  },

  getAnalysis(token: string, listingId: string) {
    return request<DealAnalysisPayload>(
      `/deal-analysis/${listingId}`,
      { method: "GET" },
      token,
    );
  },

  getReportReasons(token: string) {
    return request<ReportReasonsPayload>(
      "/deal-analysis/report-reasons",
      { method: "GET" },
      token,
    );
  },

  save(token: string, listingId: string) {
    return request<DealAnalysisSavePayload>(
      `/deal-analysis/${listingId}/save`,
      { method: "POST" },
      token,
    );
  },

  unsave(token: string, listingId: string) {
    return request<DealAnalysisSavePayload>(
      `/deal-analysis/${listingId}/save`,
      { method: "DELETE" },
      token,
    );
  },

  report(
    token: string,
    listingId: string,
    body: { reason: string; details?: string },
  ) {
    return request<DealAnalysisReportPayload>(
      `/deal-analysis/${listingId}/report`,
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },

  getContact(token: string, listingId: string) {
    return request<DealAnalysisContactPayload>(
      `/deal-analysis/${listingId}/contact`,
      { method: "GET" },
      token,
    );
  },

  sendEnquiry(token: string, listingId: string, body: { message: string }) {
    return request<{
      success: boolean;
      message: string;
      data: { id: string; status: string; message: string };
    }>(
      `/deal-analysis/${listingId}/enquiry`,
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },
};

export type EnquiryMessage = {
  id: string;
  role: "buyer" | "seller";
  authorName: string;
  message: string;
  createdAt: string;
  createdAtLabel: string;
  isMine: boolean;
};

export type EnquiryListItem = {
  id: string;
  box: "inbox" | "sent";
  listingId: string | null;
  propertyTitle: string;
  location: string;
  askingPrice: number | null;
  status: string;
  unread: boolean;
  counterparty: { name: string; email: string; phone: string };
  preview: string;
  lastMessageAt: string;
  lastMessageAtLabel: string;
  createdAt: string;
  createdAtLabel: string;
  replyCount: number;
};

export type EnquiryDetail = EnquiryListItem & {
  messages: EnquiryMessage[];
  canReply: boolean;
};

export const enquiriesApi = {
  list(token: string, box: "all" | "inbox" | "sent" = "all") {
    return request<{
      success: boolean;
      data: {
        box: "all" | "inbox" | "sent";
        unreadCount: number;
        inboxUnread?: number;
        sentUnread?: number;
        total: number;
        enquiries: EnquiryListItem[];
      };
    }>(`/enquiries?box=${box}`, { method: "GET" }, token);
  },

  unreadCount(token: string) {
    return request<{
      success: boolean;
      data: {
        unreadCount: number;
        inboxUnread?: number;
        sentUnread?: number;
      };
    }>("/enquiries/unread-count", { method: "GET" }, token);
  },

  get(token: string, id: string) {
    return request<{ success: boolean; data: EnquiryDetail }>(
      `/enquiries/${id}`,
      { method: "GET" },
      token,
    );
  },

  reply(token: string, id: string, message: string) {
    return request<{
      success: boolean;
      message: string;
      data: EnquiryDetail;
    }>(
      `/enquiries/${id}/reply`,
      { method: "POST", body: JSON.stringify({ message }) },
      token,
    );
  },

  markRead(token: string, id: string) {
    return request<{ success: boolean; data: { id: string; unread: boolean } }>(
      `/enquiries/${id}/read`,
      { method: "POST" },
      token,
    );
  },

  close(token: string, id: string) {
    return request<{
      success: boolean;
      message: string;
      data: { id: string; status: string };
    }>(`/enquiries/${id}/close`, { method: "POST" }, token);
  },
};

export const billingApi = {
  checkout(token: string, plan: "Premium" | "VIP") {
    return request<{ success: boolean; data: { url: string } }>(
      "/billing/checkout",
      { method: "POST", body: JSON.stringify({ plan }) },
      token,
    );
  },

  confirmCheckout(token: string, sessionId: string) {
    return request<{
      success: boolean;
      data: {
        purpose?: "listing_fee" | "subscription";
        plan: string | null;
        status: string;
        paymentStatus?: string;
      };
    }>(
      `/billing/confirm?session_id=${encodeURIComponent(sessionId)}`,
      { method: "GET" },
      token,
    );
  },

  portal(token: string) {
    return request<{ success: boolean; data: { url: string } }>(
      "/billing/portal",
      { method: "POST" },
      token,
    );
  },
};

export type SubmitOptions = {
  propertyTypes: string[];
  bedrooms: string[];
  roles: string[];
  strategyTags: string[];
  imageLimits: {
    maxImages: number;
    maxSizeMb: number;
    acceptedFormats: string[];
  };
};

export type SubmitContact = {
  name: string;
  role: string;
  phone: string;
  email: string;
};

export type SubmitPayload = {
  title: string;
  description: string;
  propertyType: string;
  bedrooms: string;
  streetAddress: string;
  postcode: string;
  town: string;
  county: string;
  askingPrice: number | string;
  marketValue: number | string;
  strategies: string[];
  images: string[];
  contact: SubmitContact;
  draftId?: string;
};

export type Submission = {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  bedrooms: string;
  streetAddress: string;
  postcode: string;
  town: string;
  county: string;
  location: string;
  askingPrice: number;
  marketValue: number;
  discountPercent: number;
  strategies: string[];
  images: string[];
  contact: SubmitContact;
  status: string;
  statusLabel: string;
  paymentStatus: "pending" | "paid";
  submittedAt: string;
  updatedAt: string;
};

export type DiscountPreview = {
  askingPrice: number;
  marketValue: number;
  discountPercent: number;
  saving: number;
};

type SubmitOptionsPayload = {
  success: boolean;
  data: SubmitOptions;
};

type SubmissionPayload = {
  success: boolean;
  message?: string;
  data: Submission;
};

type SubmitCheckoutPayload = {
  success: boolean;
  message?: string;
  data: { submissionId: string; checkoutUrl: string };
};

type SubmissionsListPayload = {
  success: boolean;
  data: Submission[];
};

type DiscountPreviewPayload = {
  success: boolean;
  data: DiscountPreview;
};

export const submitApi = {
  getOptions(token: string) {
    return request<SubmitOptionsPayload>(
      "/submit/options",
      { method: "GET" },
      token,
    );
  },

  previewDiscount(
    token: string,
    body: { askingPrice: number | string; marketValue: number | string },
  ) {
    return request<DiscountPreviewPayload>(
      "/submit/preview-discount",
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },

  submit(token: string, body: SubmitPayload) {
    return request<SubmitCheckoutPayload>(
      "/submit",
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },

  retryPayment(token: string, id: string) {
    return request<SubmitCheckoutPayload>(
      `/submit/${id}/checkout`,
      { method: "POST" },
      token,
    );
  },

  saveDraft(token: string, body: SubmitPayload) {
    return request<SubmissionPayload>(
      "/submit/draft",
      { method: "POST", body: JSON.stringify(body) },
      token,
    );
  },

  updateDraft(token: string, id: string, body: SubmitPayload) {
    return request<SubmissionPayload>(
      `/submit/${id}`,
      { method: "PUT", body: JSON.stringify(body) },
      token,
    );
  },

  getDrafts(token: string) {
    return request<SubmissionsListPayload>(
      "/submit/drafts",
      { method: "GET" },
      token,
    );
  },

  getSubmissions(token: string) {
    return request<SubmissionsListPayload>(
      "/submit/submissions",
      { method: "GET" },
      token,
    );
  },

  getById(token: string, id: string) {
    return request<SubmissionPayload>(
      `/submit/${id}`,
      { method: "GET" },
      token,
    );
  },

  deleteDraft(token: string, id: string) {
    return request<{ success: boolean; message: string; data: { deleted: boolean } }>(
      `/submit/${id}`,
      { method: "DELETE" },
      token,
    );
  },
};

export type AdminStatCard = {
  label: string;
  value: string;
  valueClass?: string;
  sub: string;
};

export type AdminStats = {
  cards: AdminStatCard[];
  chips: {
    pendingListings: number;
    openReports: number;
    activeUsers: number;
  };
};

export type AdminSubmission = {
  id: string;
  property: string;
  location: string;
  submittedBy: string;
  submitterEmail: string;
  price: string;
  discount: string;
  submitted: string;
  kycLabel: string;
  kycBadge: string;
  status: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  plan: string;
  planBadge: string;
  kycLabel: string;
  kycBadge: string;
  kycStatus: string;
  joined: string;
  status: string;
  statusLabel: string;
  statusColor: string;
};

export type AdminReport = {
  id: string;
  listingId: string | null;
  title: string;
  location: string;
  reason: string;
  details: string;
  reportedBy: string;
  submittedBy: string;
  createdAt: string;
};

export type AdminListing = {
  id: string;
  title: string;
  location: string;
  askingPrice: string;
  status: string;
  salePrice: string | null;
  commissionGBP: string | null;
  commissionInvoiceStatus: string;
};

type AdminStatsPayload = { success: boolean; data: AdminStats };
type AdminSubmissionsPayload = { success: boolean; data: AdminSubmission[] };
type AdminUsersPayload = { success: boolean; data: AdminUser[] };
type AdminUserPayload = { success: boolean; message?: string; data: AdminUser };
type AdminReportsPayload = { success: boolean; data: AdminReport[] };
type AdminListingsPayload = { success: boolean; data: AdminListing[] };
type AdminActionPayload = {
  success: boolean;
  message?: string;
  data: Record<string, unknown>;
};

export const adminApi = {
  getStats(token: string) {
    return request<AdminStatsPayload>("/admin/stats", { method: "GET" }, token);
  },

  getSubmissions(token: string, status = "pending") {
    return request<AdminSubmissionsPayload>(
      `/admin/submissions?status=${encodeURIComponent(status)}`,
      { method: "GET" },
      token,
    );
  },

  approveSubmission(token: string, id: string) {
    return request<AdminActionPayload>(
      `/admin/submissions/${id}/approve`,
      { method: "POST" },
      token,
    );
  },

  rejectSubmission(token: string, id: string) {
    return request<AdminActionPayload>(
      `/admin/submissions/${id}/reject`,
      { method: "POST" },
      token,
    );
  },

  getUsers(
    token: string,
    params: { search?: string; plan?: string; status?: string } = {},
  ) {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.plan) query.set("plan", params.plan);
    if (params.status) query.set("status", params.status);
    const qs = query.toString();
    return request<AdminUsersPayload>(
      `/admin/users${qs ? `?${qs}` : ""}`,
      { method: "GET" },
      token,
    );
  },

  updateUser(
    token: string,
    id: string,
    body: { plan?: string; status?: string; kycStatus?: string },
  ) {
    return request<AdminUserPayload>(
      `/admin/users/${id}`,
      { method: "PATCH", body: JSON.stringify(body) },
      token,
    );
  },

  deleteUser(token: string, id: string) {
    return request<AdminActionPayload>(
      `/admin/users/${id}`,
      { method: "DELETE" },
      token,
    );
  },

  getReports(token: string) {
    return request<AdminReportsPayload>("/admin/reports", { method: "GET" }, token);
  },

  resolveReport(token: string, id: string) {
    return request<AdminActionPayload>(
      `/admin/reports/${id}/resolve`,
      { method: "PATCH" },
      token,
    );
  },

  getListings(token: string) {
    return request<AdminListingsPayload>(
      "/admin/listings",
      { method: "GET" },
      token,
    );
  },

  removeListing(token: string, id: string) {
    return request<AdminActionPayload>(
      `/admin/listings/${id}`,
      { method: "DELETE" },
      token,
    );
  },

  markSold(token: string, id: string, salePrice: number) {
    return request<AdminActionPayload>(
      `/admin/listings/${id}/mark-sold`,
      { method: "POST", body: JSON.stringify({ salePrice }) },
      token,
    );
  },
};

export type NotificationItem = {
  id: string;
  unread: boolean;
  icon: string;
  iconBg: string;
  title: string;
  body: string;
  time: string;
};

export type NotificationsData = {
  unreadCount: number;
  notifications: NotificationItem[];
};

export const notificationsApi = {
  list(token: string) {
    return request<{ success: boolean; data: NotificationsData }>(
      "/notifications",
      { method: "GET" },
      token,
    );
  },

  markAllRead(token: string) {
    return request<{ success: boolean; message: string }>(
      "/notifications/read-all",
      { method: "POST" },
      token,
    );
  },
};

export type KycStep = {
  num: string;
  label: string;
  state: "done" | "active" | "todo";
};

export type KycComplianceRow = {
  label: string;
  value: string;
  ok?: boolean;
  mono?: boolean;
};

export type KycData = {
  status: "pending" | "in_progress" | "approved" | "rejected" | "consider";
  verified: boolean;
  stripeIdentitySessionId: string | null;
  provider?: "stripe";
  staticMode?: boolean;
  reference: string | null;
  lastError?: { code: string | null; reason: string | null } | null;
  steps: KycStep[];
  compliance: KycComplianceRow[];
};

export const kycApi = {
  get(token: string) {
    return request<{ success: boolean; data: KycData }>(
      "/kyc",
      { method: "GET" },
      token,
    );
  },

  startVerification(token: string) {
    return request<{
      success: boolean;
      message: string;
      data: {
        sessionId: string;
        url: string | null;
        status: string;
        provider?: string;
        staticMode?: boolean;
        message: string;
      };
    }>("/kyc/start-verification", { method: "POST" }, token);
  },
};

export const publicApi = {
  listings(limit = 6) {
    return request<{ success: boolean; data: { properties: ListingProperty[] } }>(
      `/public/listings?limit=${limit}`,
      { method: "GET" },
    );
  },
};
