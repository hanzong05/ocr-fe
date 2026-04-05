"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Header from "@/components/Header";
import Notification from "@/components/Notification";
import Form1A from "@/components/forms/Form1A";
import Form2A from "@/components/forms/Form2A";
import Form3A from "@/components/forms/Form3A";
import { saveDocument, TYPE_ID } from "@/lib/api";

export default function CertTemplatePage() {
  const { isLoggedIn, user, notify } = useApp();
  const router = useRouter();
  const [formClass, setFormClass] = useState<string>("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn) router.push("/login");
  }, [isLoggedIn, router]);

  useEffect(() => {
    const fc = sessionStorage.getItem("lcr_form_class") || "1A";
    const f = JSON.parse(sessionStorage.getItem("lcr_fields") || "{}");
    setFormClass(fc);
    setFields(f);
  }, []);

  if (!isLoggedIn) return null;

  function handleChange(key: string, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      await saveDocument(Number(user?.id), TYPE_ID[formClass] ?? 1, fields);
      notify("Certification saved successfully!", "success");
      router.push("/services");
    } catch (e: unknown) {
      notify(
        "Save failed: " + (e instanceof Error ? e.message : "Unknown error"),
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  async function exportPDF() {
    if (!printRef.current) return;
    setExporting(true);

    try {
      // Dynamically import to avoid SSR issues
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const element = printRef.current;

      // Capture at high resolution (scale: 3 = ~300 DPI equivalent on screen)
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        // Ensure full element is captured even if off-screen
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      // US Letter dimensions in mm
      const pageWidth = 215.9;
      const pageHeight = 279.4;

      // Margins in mm
      const marginTop = 12.7;
      const marginBottom = 12.7;
      const marginLeft = 12.7;
      const marginRight = 12.7;

      const contentWidth = pageWidth - marginLeft - marginRight;
      const contentHeight = pageHeight - marginTop - marginBottom;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "letter",
        compress: true,
      });

      // Convert canvas px to mm (at 96 DPI base, scale=3 means 288 DPI)
      const pxToMm = (px: number) => (px / (96 * 3)) * 25.4;

      const imgWidthMm = pxToMm(canvas.width);
      const imgHeightMm = pxToMm(canvas.height);

      // Scale image to fit content width, maintaining aspect ratio
      const scaleFactor = contentWidth / imgWidthMm;
      const scaledWidth = imgWidthMm * scaleFactor;
      const scaledHeight = imgHeightMm * scaleFactor;

      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      // Paginate if content is taller than one page
      if (scaledHeight <= contentHeight) {
        // Single page — center vertically if short
        pdf.addImage(
          imgData,
          "JPEG",
          marginLeft,
          marginTop,
          scaledWidth,
          scaledHeight
        );
      } else {
        // Multi-page: slice canvas per page
        const pageHeightPx = canvas.width * (contentHeight / contentWidth);
        let remainingHeight = canvas.height;
        let offsetY = 0;
        let isFirstPage = true;

        while (remainingHeight > 0) {
          const sliceHeight = Math.min(pageHeightPx, remainingHeight);

          // Create a slice canvas
          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = canvas.width;
          pageCanvas.height = sliceHeight;
          const ctx = pageCanvas.getContext("2d")!;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(canvas, 0, -offsetY);

          const pageImgData = pageCanvas.toDataURL("image/jpeg", 1.0);
          const sliceHeightMm = pxToMm(sliceHeight) * scaleFactor;

          if (!isFirstPage) pdf.addPage();
          pdf.addImage(
            pageImgData,
            "JPEG",
            marginLeft,
            marginTop,
            scaledWidth,
            sliceHeightMm
          );

          offsetY += sliceHeight;
          remainingHeight -= sliceHeight;
          isFirstPage = false;
        }
      }

      const filename = `Form${formClass}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      pdf.save(filename);
      notify("PDF exported successfully!", "success");
    } catch (e: unknown) {
      notify(
        "PDF export failed: " +
          (e instanceof Error ? e.message : "Unknown error"),
        "error"
      );
    } finally {
      setExporting(false);
    }
  }

  const formProps = { fields, editing, onChange: handleChange };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Notification />
      <Header />

      <main style={{ flex: 1, padding: 24, background: "#f0f2f5" }}>
        <div style={{ maxWidth: 820, margin: "0 auto" }}>

          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 20,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <button
              onClick={() => setEditing((e) => !e)}
              style={btnStyle(editing ? "#6b7280" : "var(--navy)")}
            >
              {editing ? "✕  Cancel" : "✏  Edit"}
            </button>

            <button
              onClick={exportPDF}
              disabled={exporting}
              style={{
                ...btnStyle("#1a56db"),
                opacity: exporting ? 0.7 : 1,
                minWidth: 160,
              }}
            >
              {exporting ? (
                <>
                  <Spinner /> Generating PDF…
                </>
              ) : (
                "⬇  Download PDF"
              )}
            </button>

            <button
              onClick={save}
              disabled={saving}
              style={{
                ...btnStyle("var(--primary-green)"),
                marginLeft: "auto",
                opacity: saving ? 0.7 : 1,
              }}
            >
              {saving ? "Saving…" : "💾  Save"}
            </button>
          </div>

          {/* Document preview */}
          <div
            style={{
              background: "white",
              borderRadius: 6,
              boxShadow: "0 4px 32px rgba(0,0,0,0.14)",
              overflow: "hidden",
            }}
          >
            {/* "Paper" that gets captured */}
            <div
              ref={printRef}
              style={{
                // US Letter at 96 DPI = 816 × 1056 px
                width: 816,
                minHeight: 1056,
                margin: "0 auto",
                padding: "48px 60px 60px",
                background: "#ffffff",
                boxSizing: "border-box",
                fontFamily: "serif",
                fontSize: 12,
                lineHeight: 1.5,
                color: "#111",
              }}
            >
              {formClass === "1A" && <Form1A {...formProps} />}
              {formClass === "2A" && <Form2A {...formProps} />}
              {formClass === "3A" && <Form3A {...formProps} />}
            </div>
          </div>

          <p
            style={{
              textAlign: "center",
              color: "#9ca3af",
              fontSize: 12,
              marginTop: 12,
            }}
          >
            Preview is actual PDF size (US Letter). Use <strong>Download PDF</strong> for
            best quality.
          </p>
        </div>
      </main>
    </div>
  );
}

/* ─── helpers ─────────────────────────────────────────────── */

function btnStyle(bg: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 20px",
    background: bg,
    color: "white",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    whiteSpace: "nowrap",
  };
}

function Spinner() {
  return (
    <span
      style={{
        display: "inline-block",
        width: 14,
        height: 14,
        border: "2px solid rgba(255,255,255,0.4)",
        borderTopColor: "white",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}
