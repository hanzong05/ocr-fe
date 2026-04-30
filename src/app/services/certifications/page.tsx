"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import Notification from "@/components/Notification";
import UploadArea from "@/components/UploadArea";
import { processDocument, assembleFields, assembleConfidence } from "@/lib/api";
import { FormClass } from "@/lib/types";

export default function CertificationsPage() {
  const { isLoggedIn, notify } = useApp();
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);
  if (!isLoggedIn) return null;

  async function proceed() {
    if (!files.length) {
      notify("Please upload at least one file.", "error");
      return;
    }
    setLoading(true);
    try {
      const data = await processDocument(files[0]);
      if (data.status !== "success") {
        notify("Processing failed: " + data.message, "error");
        return;
      }

      // ✅ Block Form 90 — wrong page
      if (data.form_class === "90") {
        notify("This is a Marriage License (Form 90). Please upload it under Marriage License instead.", "error");
        return;
      }

      const formClass = data.form_class as FormClass;

      const assembled = assembleFields(formClass, data.fields);
      const assembledConfidence = assembleConfidence(
        formClass,
        data.confidence || {}
      );

      sessionStorage.setItem("lcr_form_class", data.form_class);
      sessionStorage.setItem("lcr_fields", JSON.stringify(assembled));
      sessionStorage.setItem("lcr_confidence", JSON.stringify(assembledConfidence));
      router.push("/services/certifications/template");
    } catch (err) {
      notify(
        err instanceof Error ? err.message : "Could not reach the OCR server. Check your internet connection.",
        "error",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <Notification />
      <Header />
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 40,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            width: "100%",
            maxWidth: 560,
          }}
        >
          <h2
            style={{
              fontSize: 22,
              fontWeight: 700,
              marginBottom: 6,
              color: "var(--navy)",
            }}
          >
            CERTIFICATIONS
          </h2>
          <p style={{ color: "var(--gray)", fontSize: 14, marginBottom: 24 }}>
            Form 1A, Form 2A, Form 3A
          </p>

          <UploadArea files={files} onFiles={setFiles} />

          <button
            onClick={proceed}
            disabled={loading || !files.length}
            style={{
              marginTop: 24,
              width: "100%",
              padding: "14px",
              background: files.length
                ? "var(--primary-green)"
                : "var(--light-gray)",
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 700,
              cursor: files.length && !loading ? "pointer" : "not-allowed",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Processing..." : "PROCEED"}
          </button>
        </div>
      </main>
    </div>
  );
}
