"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  enquiriesApi,
  type EnquiryDetail,
  type EnquiryListItem,
  ApiRequestError,
} from "@/lib/api";

type Box = "all" | "inbox" | "sent";

export default function Enquiries() {
  const { token } = useAuth();
  const [box, setBox] = useState<Box>("all");
  const [items, setItems] = useState<EnquiryListItem[]>([]);
  const [inboxUnread, setInboxUnread] = useState(0);
  const [sentUnread, setSentUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [thread, setThread] = useState<EnquiryDetail | null>(null);
  const [threadLoading, setThreadLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  const activeIdRef = useRef<string | null>(null);
  activeIdRef.current = activeId;

  const loadList = useCallback(
    async (nextBox: Box, soft = false) => {
      if (!token) return;
      if (soft) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const res = await enquiriesApi.list(token, nextBox);
        setItems(res.data.enquiries);
        setInboxUnread(res.data.inboxUnread ?? 0);
        setSentUnread(res.data.sentUnread ?? 0);
      } catch (err) {
        setError(
          err instanceof ApiRequestError
            ? err.message
            : "Failed to load enquiries.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  const openThread = useCallback(
    async (id: string, quiet = false) => {
      if (!token) return;
      setActiveId(id);
      if (!quiet) {
        setThreadLoading(true);
        setReplyError(null);
      }
      try {
        const res = await enquiriesApi.get(token, id);
        setThread(res.data);
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, unread: false } : item,
          ),
        );
      } catch (err) {
        if (!quiet) {
          setReplyError(
            err instanceof ApiRequestError
              ? err.message
              : "Unable to open this enquiry.",
          );
          setThread(null);
        }
      } finally {
        if (!quiet) setThreadLoading(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadList(box);
  }, [box, loadList]);

  // Keep the open thread fresh so seller replies appear for the buyer
  useEffect(() => {
    if (!token) return;
    const timer = setInterval(() => {
      loadList(box, true);
      if (activeIdRef.current) {
        openThread(activeIdRef.current, true);
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [token, box, loadList, openThread]);

  const visibleItems = useMemo(() => {
    if (box === "all") return items;
    return items.filter((item) => item.box === box);
  }, [items, box]);

  const sendReply = async () => {
    if (!token || !activeId || !reply.trim()) {
      setReplyError("Please enter a reply before sending.");
      return;
    }
    setSending(true);
    setReplyError(null);
    try {
      const res = await enquiriesApi.reply(token, activeId, reply.trim());
      setThread(res.data);
      setReply("");
      await loadList(box, true);
    } catch (err) {
      setReplyError(
        err instanceof ApiRequestError
          ? err.message
          : "Unable to send your reply.",
      );
    } finally {
      setSending(false);
    }
  };

  const closeThread = async () => {
    if (!token || !activeId) return;
    try {
      await enquiriesApi.close(token, activeId);
      if (thread) setThread({ ...thread, status: "closed", canReply: false });
      await loadList(box, true);
    } catch {
      // non-critical
    }
  };

  const switchBox = (next: Box) => {
    setBox(next);
    setActiveId(null);
    setThread(null);
    setReplyError(null);
  };

  return (
    <section className="section section-dark" id="enquiries">
      <div className="container">
        <div className="flex-between mb-32">
          <div>
            <div className="tag mb-8">Messaging</div>
            <h2>Enquiries</h2>
            <p className="muted" style={{ marginTop: "8px", maxWidth: "560px" }}>
              All conversations about listings. Investors see replies under{" "}
              <strong>Sent</strong>; sellers reply from <strong>Received</strong>.
              Use <strong>All</strong> to see everything.
            </p>
          </div>
          {refreshing && (
            <span className="muted" style={{ fontSize: ".8rem" }}>
              Updating…
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
          <button
            type="button"
            className={box === "all" ? "btn btn-gold btn-sm" : "btn btn-outline btn-sm"}
            onClick={() => switchBox("all")}
          >
            All
            {inboxUnread + sentUnread > 0 ? ` (${inboxUnread + sentUnread})` : ""}
          </button>
          <button
            type="button"
            className={box === "inbox" ? "btn btn-gold btn-sm" : "btn btn-outline btn-sm"}
            onClick={() => switchBox("inbox")}
          >
            Received{inboxUnread > 0 ? ` (${inboxUnread})` : ""}
          </button>
          <button
            type="button"
            className={box === "sent" ? "btn btn-gold btn-sm" : "btn btn-outline btn-sm"}
            onClick={() => switchBox("sent")}
          >
            Sent{sentUnread > 0 ? ` (${sentUnread})` : ""}
          </button>
        </div>

        {loading && <p className="muted">Loading enquiries…</p>}
        {error && (
          <div className="alert alert-error">
            <span>!</span>
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && (
          <div className="enquiries-layout">
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              {visibleItems.length === 0 ? (
                <p className="muted" style={{ padding: "20px" }}>
                  {box === "inbox"
                    ? "No received enquiries yet. When someone contacts you about your listing, it appears here."
                    : box === "sent"
                      ? "No sent enquiries yet. Open a deal and use Contact Seller to start a conversation."
                      : "No conversations yet. Buyers start from Contact Seller on a deal; sellers reply here."}
                </p>
              ) : (
                visibleItems.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => openThread(item.id)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "16px 18px",
                      border: "none",
                      borderBottom: "1px solid rgba(255,255,255,.06)",
                      background:
                        activeId === item.id
                          ? "rgba(212,168,67,.12)"
                          : item.unread
                            ? "rgba(255,255,255,.04)"
                            : "transparent",
                      cursor: "pointer",
                      color: "inherit",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "10px",
                        marginBottom: "4px",
                      }}
                    >
                      <strong style={{ fontSize: ".92rem" }}>
                        {item.unread ? "● " : ""}
                        {item.propertyTitle}
                      </strong>
                      <span
                        className="muted"
                        style={{ fontSize: ".72rem", whiteSpace: "nowrap" }}
                      >
                        {item.lastMessageAtLabel}
                      </span>
                    </div>
                    <p className="muted" style={{ fontSize: ".78rem", margin: "0 0 4px" }}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "1px 8px",
                          borderRadius: "999px",
                          marginRight: "6px",
                          background:
                            item.box === "inbox"
                              ? "rgba(34,197,94,.15)"
                              : "rgba(59,130,246,.15)",
                          fontSize: ".68rem",
                        }}
                      >
                        {item.box === "inbox" ? "Received" : "Sent"}
                      </span>
                      {item.box === "inbox" ? "From" : "To"}: {item.counterparty.name}
                    </p>
                    <p
                      style={{
                        fontSize: ".84rem",
                        margin: 0,
                        opacity: 0.85,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.preview}
                    </p>
                  </button>
                ))
              )}
            </div>

            <div className="card" style={{ minHeight: "420px" }}>
              {!activeId && (
                <p className="muted" style={{ padding: "12px" }}>
                  Select a conversation to read messages and reply.
                </p>
              )}

              {activeId && threadLoading && !thread && (
                <p className="muted">Loading conversation…</p>
              )}

              {activeId && thread && (
                <>
                  <div
                    className="flex-between"
                    style={{ marginBottom: "16px", gap: "12px" }}
                  >
                    <div>
                      <h3 style={{ marginBottom: "4px" }}>{thread.propertyTitle}</h3>
                      <p className="muted" style={{ fontSize: ".82rem", margin: 0 }}>
                        {thread.box === "inbox" ? "Buyer" : "Seller"}:{" "}
                        {thread.counterparty.name}
                        {thread.counterparty.email
                          ? ` · ${thread.counterparty.email}`
                          : ""}
                        {thread.counterparty.phone
                          ? ` · ${thread.counterparty.phone}`
                          : ""}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                      {thread.listingId && (
                        <Link
                          href={`/app/deal-analysis?listing=${thread.listingId}`}
                          className="btn btn-outline btn-sm"
                        >
                          View deal
                        </Link>
                      )}
                      {thread.status !== "closed" && (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={closeThread}
                        >
                          Close
                        </button>
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                      maxHeight: "360px",
                      overflowY: "auto",
                      paddingRight: "4px",
                      marginBottom: "18px",
                    }}
                  >
                    {thread.messages.map((msg) => (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: msg.isMine ? "flex-end" : "flex-start",
                          maxWidth: "85%",
                          background: msg.isMine
                            ? "rgba(212,168,67,.16)"
                            : "rgba(255,255,255,.05)",
                          border: "1px solid rgba(255,255,255,.08)",
                          borderRadius: "12px",
                          padding: "12px 14px",
                        }}
                      >
                        <p
                          style={{
                            fontSize: ".72rem",
                            color: "var(--slate)",
                            margin: "0 0 6px",
                          }}
                        >
                          {msg.authorName}
                          {msg.role === "seller" ? " (Seller)" : " (Buyer)"} ·{" "}
                          {msg.createdAtLabel}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            whiteSpace: "pre-wrap",
                            fontSize: ".9rem",
                            lineHeight: 1.5,
                          }}
                        >
                          {msg.message}
                        </p>
                      </div>
                    ))}
                  </div>

                  {thread.canReply ? (
                    <>
                      {replyError && (
                        <div
                          className="alert alert-error"
                          style={{ marginBottom: "10px" }}
                        >
                          <span>!</span>
                          <span>{replyError}</span>
                        </div>
                      )}
                      <div className="form-group" style={{ margin: 0 }}>
                        <textarea
                          rows={3}
                          placeholder="Write your reply…"
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          maxLength={2000}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-gold btn-sm"
                        style={{ marginTop: "12px" }}
                        onClick={sendReply}
                        disabled={sending}
                      >
                        {sending ? "Sending…" : "Send Reply"}
                      </button>
                    </>
                  ) : (
                    <p className="muted">This enquiry thread is closed.</p>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
